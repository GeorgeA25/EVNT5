import { useState, useEffect } from "react";
import {
  getSignedUpEventsByEventId,
  addSignedUpEvents,
  getEventsById,
} from "../firebase/firebaseStore";
import { auth } from "../firebase/firebaseConfig";
import { useParams } from "react-router-dom";
import EventCard from "../components/EventCard";
import { combineDateAndTime } from "../utils/convertDateAndTime";
import { getAuth } from "firebase/auth";
import UserNavbar from "../components/UserNavbar";
import sendConfirmationEmail from "../utils/confirmationEmail";
import { useNavigate } from "react-router-dom";

const UserEventDetailsPage = () => {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [signUpsList, setSignUpList] = useState([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentUser = auth.currentUser;
  const googleUser = currentUser?.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventData = await getEventsById(eventId);
        console.log(eventData);
        setEventDetails(eventData);
      } catch (error) {
        setError("Error whilst fetching event details");
      } finally {
        setLoading(false);
      }
    };

    const fetchSignUpList = async () => {
      try {
        const signUps = await getSignedUpEventsByEventId(eventId);
        console.log(signUps);
        setSignUpList(signUps);
      } catch (error) {
        setError("Error fetching sign up form");
      }
    };
    fetchSignUpList();
    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    const connected = localStorage.getItem("googleCalendarConnected");
    if (connected === "true") {
      setCalendarConnected(true);
    }
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoadingSignUp(true);
    setError(null);
    setMessage("");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError(
        "You need to be logged into your account to sign up to this event."
      );
      setLoading(false);
      return;
    }
    try {
      if (eventDetails.price > 0) {
        navigate("/payment", {
          state: { eventDetails, name, email },
        });
        setLoadingSignUp(false);
        return;
      }

      const user = {
        name: name || currentUser.displayName,
        email: email || currentUser.email,
      };
      await addSignedUpEvents(user, eventId);
      setMessage(
        "You have successfully signed up to the event see you there!. A confirmation email has been sent."
      );
      setName("");
      setEmail("");

      await sendConfirmationEmail({
        toEmail: user.email,
        name: user.name,
        title: eventDetails.title,
        date: eventDetails.date,
        location: eventDetails.location,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime,
        time: new Date().toLocaleString(),
      });

      const updatedSignUps = await getSignedUpEventsByEventId(eventId);
      console.log(updatedSignUps);
      setSignUpList(updatedSignUps);
    } catch (error) {
      setError(
        "Error whilst signing up to the event. Please fill check the form and try again"
      );
    } finally {
      setLoadingSignUp(false);
    }
  };

  const copyEventUrl = async () => {
    try {
      const eventUrl = window.location.href;
      navigator.clipboard.writeText(eventUrl);
      setMessage("Event URL has been copied to clipboard");
    } catch (error) {
      setError("Error whilst copying the event URL. Please try again");
    }
  };

  const handleAddToGoogleCalendarButton = async () => {
    if (!auth.currentUser) {
      setError("you must be logged in to add events to google calendar");
      return;
    }
    const eventData = {
      title: eventDetails.title,
      description: eventDetails.description,
      location: eventDetails.location,
      startTime: combineDateAndTime(eventDetails.date, eventDetails.startTime),
      endTime: combineDateAndTime(eventDetails.date, eventDetails.endTime),
    };
    try {
      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(
        "https://addeventtogooglecalendar-o53weyim5q-nw.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(eventData),
        }
      );
      const outcome = await response.json();

      if (response.status === 403 && outcome.error?.includes("authorization")) {
        window.location.href = "/connect-google-calendar";
        return;
      }
      if (!response.ok || !outcome.success) {
        throw new Error(
          outcome.error || "failed to add event to google calendar"
        );
      }
      setMessage("Event successfuly added to you google calendar");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError("you need to be logged in to connect to google calendar");
      return;
    }
    localStorage.setItem("pendingEventId", eventId);
    setTimeout(() => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = "http://localhost:5173/oauth2callback";
      const scope = "https://www.googleapis.com/auth/calendar";
      const state = user.uid;
      const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(
        scope
      )}&access_type=offline&prompt=consent&state=${state}`;
      window.location.href = oauth2Url;
    }, 1500);
  };

  const userSignedUp = signUpsList.some(
    (s) => s.email === auth.currentUser?.email
  );

  if (isLoggingOut) {
    return <p>Logging out. Redirecting you back to login page...</p>;
  }

  return (
    <>
      <h1>{eventDetails.title}</h1>

      <div>
        {loading ? (
          <p>Loading event details...</p>
        ) : eventDetails.title ? (
          <EventCard event={eventDetails} />
        ) : (
          <p>No event details avaliable</p>
        )}
      </div>
      {!user && authChecked && (
        <div>
          <p>
            You're viewing a shared event link. To sign up for this event or if
            you have a Google Account, sign up then add the event to your Google
            Calendar, please visit this link.
            <a
              href="https://evnt5-97cf1.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "blue", textDecoration: "underline" }}
            >
              https://evnt5-97cf1.web.app/
            </a>
          </p>
        </div>
      )}
      {loading && <p>Loading form please wait...</p>}
      {error && <p>{error}</p>}
      {authChecked && user && (
        <>
          <UserNavbar
            clickable={false}
            onLoggingOut={() => setIsLoggingOut(true)}
          />
          <h1>Sign Up Form</h1>
          <form onSubmit={handleSignUp}>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Please enter your name"
              required
            ></input>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email"
              required
            ></input>
            <button type="submit" disabled={loadingSignUp}>
              {loadingSignUp ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div>
            <button onClick={copyEventUrl}>Copy Event URL</button>
          </div>
          {message && <p>{message}</p>}
          {error && <p>{error}</p>}
          <div>
            {googleUser && (
              <div>
                <h2>Google Calendar</h2>
                {!userSignedUp && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    style={{ color: "red" }}
                  >
                    You must be signed up for this event in order to add the
                    event to your calendar. Upon signing up, please connect your
                    Google Calendar
                  </p>
                )}
                <button
                  onClick={handleConnectGoogleCalendar}
                  disabled={!userSignedUp}
                >
                  Connect Google Calendar
                </button>
                {!calendarConnected && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    style={{ color: "red" }}
                  >
                    Pleas connect your Google Calendar first before adding the
                    event to your calendar
                  </p>
                )}
                <button
                  onClick={handleAddToGoogleCalendarButton}
                  disabled={!calendarConnected || !userSignedUp}
                >
                  Add event to google calendar
                </button>
              </div>
            )}
            {error && (
              <p role="alert" aria-live="assertive" style={{ color: "red" }}>
                {error}
              </p>
            )}
            {message && (
              <p role="status" aria-live="polite" style={{ color: "green" }}>
                {message}
              </p>
            )}

            <h3>Users who have signed up</h3>
            <ul>
              {signUpsList.length > 0 ? (
                signUpsList.map((signUp, index) => (
                  <li key={index}>{signUp.name}</li>
                ))
              ) : (
                <p>No users have signed up yet.</p>
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default UserEventDetailsPage;
