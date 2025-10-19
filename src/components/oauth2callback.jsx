import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

const OAuth2Callback = () => {
  const [message, setMessage] = useState(
    "Processing Google Calendar authorization..."
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOAuth2Callback = async (user) => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    console.log(state);

    if (!code || !state) {
      toast.error("no code found in url");
      return;
    }
    if (!user || user.uid !== state) {
      setError("invalid or mismatched user. Please log in again");
      setLoading(false);
      return;
    }

    const eventId = localStorage.getItem("pendingEventId");
    if (!eventId) {
      setError("missing event context please reconnect from event page");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://exchangegooglecode-o53weyim5q-nw.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, uid: user.uid }),
        }
      );
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: true, token: text };
      }

      if (!data.success) {
        setError("failed to exchange code", data.error);
        setLoading(true);
      } else {
        console.log("refresh token stored successfully");
        localStorage.setItem("googleCalendarConnected", "true");
        localStorage.removeItem("pendingEventId");
        setMessage(
          "Google Calendar has been connected! You can now add the event you've signed upto to your calendar"
        );
        setTimeout(() => {
          window.location.href = `/events/${eventId}`;
        }, 2500);
      }
    } catch (error) {
      setError("error connection Google Calendar");
      console.error("error calling firebase function", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("user must be logged in to store refresh token");
        return;
      }
      await handleOAuth2Callback(user);
    });
    return () => unsubscribe();
  }, []);
  return (
    <div>
      {loading && (
        <p style={{ color: "white" }}>
          Processing google calendar authorization...
        </p>
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
    </div>
  );
};

export default OAuth2Callback;
