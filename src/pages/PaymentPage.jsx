import { useNavigate, useLocation } from "react-router-dom";
import {
  addPaymentInfoToFirestore,
  addSignedUpEvents,
} from "../firebase/firebaseStore";
import { auth } from "../firebase/firebaseConfig";
import sendConfirmationEmail from "../utils/confirmationEmail";
import { useState } from "react";
import PaymentForm from "../components/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import "../css/PaymentPage.css";

const stripeKey = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    eventDetails,
    name: prefillName,
    email: prefillEmail,
  } = location.state || {};

  const handlePayment = async (paymentIntent) => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("User must be logged in");
        setLoading(false);
        return;
      }

      const user = {
        name: prefillName || currentUser.displayName,
        email: prefillEmail || currentUser.email,
      };

      await addSignedUpEvents(user, eventDetails.id);

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

      await addPaymentInfoToFirestore(
        currentUser.uid,
        eventDetails,
        paymentIntent
      );
      setMessage(
        "Payment successful! You are now signed up for the event. A confirmation email has been sent out."
      );

      setTimeout(() => {
        navigate(`/events/${eventDetails.id}`);
      }, 3000);
    } catch (error) {
      console.error(error);
      setError(
        "Payment succeeded but there was an error signing you up to the event",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <section className="payment-page-section">
        <h1 className="payment-page-title">Pay for {eventDetails.title}</h1>
        <p className="payment-page-amount">
          Amount: £{Number(eventDetails.price.toFixed(2))}
        </p>
        {error && (
          <p role="alert" className="payment-page-error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="payment-page-message">
            {message}
          </p>
        )}
        {loading && (
          <p className="payment-page-loading" role="polite">
            Processing...
          </p>
        )}
        <div className="payment-page-container">
          <Elements stripe={stripeKey}>
            <PaymentForm
              amountPounds={Number(eventDetails.price)}
              currency="gbp"
              onPaymentSuccess={handlePayment}
            />
          </Elements>
        </div>
      </section>
    </>
  );
};

export default PaymentPage;
