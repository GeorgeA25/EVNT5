import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PaymentForm = ({ amountPounds, currency = "gbp", onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const amountPence = Math.round(amountPounds * 100);

      const response = await fetch(
        "https://createpaymentintent-o53weyim5q-nw.a.run.app/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountPence, currency }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create payment");
      }
      const clientSecret = data.clientSecret;

      const cardElement = elements.getElement(CardElement);
      const confirmResponse = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (confirmResponse.error) {
        setError(confirmResponse.error.message || "Payment failed");
        setLoading(false);
        return;
      }
      const paymentIntent = confirmResponse.paymentIntent;
      if (paymentIntent.status === "succeeded") {
        await onPaymentSuccess(paymentIntent);
      } else {
        setError("Payment did not succeed" + paymentIntent.status);
      }
    } catch (error) {
      console.error(error);
      setError(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handlePay}>
      <div aria-label="Credit or Debt card input">
        <CardElement />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing" : "Pay"}
      </button>
    </form>
  );
};

export default PaymentForm;
