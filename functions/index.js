import { onRequest } from "firebase-functions/v2/https";
import { google } from "googleapis";
import logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import admin from "firebase-admin";
import cors from "cors";
import Stripe from "stripe";

const GOOGLE_CLIENT_ID = defineSecret("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");

admin.initializeApp();

const corsHandler = cors({ origin: true });

export const addEventToGoogleCalendar = onRequest(
  { region: "europe-west2", secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET] },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return res.status(200).send();
    }
    corsHandler(req, res, async () => {
      console.log("request body recieved", req.body);
      try {
        const { title, description, location, startTime, endTime } = req.body;

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
          return res.status(401).send({
            success: false,
            error: "Unauthorized: Missing or invalid token",
          });
        }
        const idToken = authHeader.split("Bearer ")[1];

        let decodedToken;
        try {
          decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
          console.error("Error verifying firebase id token", error);
          return res
            .status(401)
            .send({ status: false, error: "Unauthorized: invalid token" });
        }
        const uid = decodedToken.uid;

        console.log(`adding event for user: ${uid}`);

        const userDoc = await admin
          .firestore()
          .collection("GoogleUsers")
          .doc(uid)
          .get();

        const tokenDoc = await admin
          .firestore()
          .collection("google_calendar_tokens")
          .doc(uid)
          .get();

        if (!userDoc.exists) {
          return res.status(403).send({
            success: false,
            error: "User record no found in GoogleUsers collections",
          });
        }

        if (!tokenDoc.exists) {
          return res.status(403).send({
            success: false,
            error: "Google calendar authorization required",
          });
        }

        const { refresh_token } = tokenDoc.data();

        if (!refresh_token) {
          return res.status(403).send({
            success: false,
            error: "Missing refresh token",
          });
        }

        if (!title || !startTime || !endTime) {
          return res.status(400).send({
            success: false,
            error: "Missing event data",
          });
        }

        const clientId = await GOOGLE_CLIENT_ID.value();
        const clientSecret = await GOOGLE_CLIENT_SECRET.value();
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

        oauth2Client.setCredentials({
          refresh_token,
        });

        const { token: newAccessToken } = await oauth2Client.getAccessToken();

        oauth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token,
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const event = {
          summary: title,
          description,
          location,
          start: { dateTime: new Date(startTime).toISOString() },
          end: { dateTime: new Date(endTime).toISOString() },
        };

        const outcome = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        res.status(200).send({ success: true, data: outcome.data });
      } catch (error) {
        logger.error("Error adding event to Google Calendar", error);
        res.status(500).send({ success: false, error: error.message });
      }
    });
  }
);

export const exchangeGoogleCode = onRequest(
  { region: "europe-west2", secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET] },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return res.status(200).send();
    }
    corsHandler(req, res, async () => {
      try {
        const { code, uid } = req.body;
        if (!code || !uid) {
          return res
            .status(400)
            .send({ success: false, error: "Missing authorization code" });
        }
        const clientId = await GOOGLE_CLIENT_ID.value();
        const clientSecret = await GOOGLE_CLIENT_SECRET.value();
        const redirectUri =
          "https://evnt5-97cf1.firebaseapp.com/oauth2callback";
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        });
        const tokens = await tokenRes.json();
        if (tokens.error) {
          console.error(
            "token exchnage failed",
            tokens.error,
            tokens.error_description
          );
          return res.status(400).json(tokens);
        }
        const { refresh_token, access_token, scope, token_type } = tokens;
        const updatedData = {
          access_token,
          scope,
          token_type,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (tokens.expiry_date) updatedData.expiry_date = tokens.expiry_date;
        if (refresh_token) {
          updatedData.refresh_token = refresh_token;
        }
        await admin
          .firestore()
          .collection("google_calendar_tokens")
          .doc(uid)
          .set(updatedData, { merge: true, ignoreUndefinedProperties: true });
        console.log(`google calendar tokens stored for user: ${uid}`);
        return res
          .status(200)
          .json({ success: true, message: "Refresh token stored" });
      } catch (error) {
        logger.error("error exchnaging google auth code", error);
        return res.status(500).json({ success: false, error: error.message });
      }
    });
  }
);

const stripeSecret = defineSecret("stripe_secret");

export const createPaymentIntent = onRequest(
  { region: "europe-west2", secrets: [stripeSecret] },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return res.status(200).send();
    }
    corsHandler(req, res, async () => {
      try {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
          res.status(400).send({ error: "Amount and currency are required" });
          return;
        }
        const stripe = new Stripe(await stripeSecret.value());

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          automatic_payment_methods: { enabled: true },
        });
        res.status(200).send({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("Stripe error", error);
        res.status(500).send({ error: error.message });
      }
    });
  }
);
