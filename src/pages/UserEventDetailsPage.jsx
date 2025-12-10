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
import Footer from "../components/Footer";
import "../css/EventDetailsPage.css";

const UserEventDetailsPage = () => {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingAddEvent, setLoadingAddEvent] = useState(false);
  const [eventAdded, setEventAdded] = useState(false);
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
    if (!user) return;
    const connected = localStorage.getItem("googleCalendarConnected");
    const added = localStorage.getItem(`${user.uid}_eventAdded_${eventId}`);
    if (connected === "true") {
      setCalendarConnected(true);
    }
    if (added === "true") {
      setEventAdded(true);
    }
  }, [eventId, user]);

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

    setLoadingAddEvent(true);
    setError(null);
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
      setEventAdded(true);
      localStorage.setItem(`${user.uid}_eventAdded_${eventId}`, "true");
      setMessage("Event successfuly added to your google calendar");
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
    setLoadingConnect(true);
    localStorage.setItem("pendingEventId", eventId);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = "https://evnt5-97cf1.firebaseapp.com/oauth2callback";
      const scope = "https://www.googleapis.com/auth/calendar";
      const state = user.uid;
      const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(
        scope
      )}&access_type=offline&prompt=consent&state=${state}`;
      setTimeout(() => {
        window.location.href = oauth2Url;
      }, 2000);
    } catch (error) {
      setError("Failed to connect Google Calendar");
    } finally {
      setLoadingConnect(false);
    }
  };

  const userSignedUp = signUpsList.some(
    (s) => s.email === auth.currentUser?.email
  );

  const todaysDate = new Date();
  todaysDate.setHours(0, 0, 0, 0);

  const eventExpired =
    eventDetails.date && new Date(eventDetails.date) < todaysDate;

  if (isLoggingOut) {
    return <p>Logging out. Redirecting you back to login page...</p>;
  }

  return (
    <>
      <section className="event-page-section">
        <h1 className="event-page-title">Event Details</h1>

        {loading ? (
          <p className="event-loading">Loading event details...</p>
        ) : eventDetails.title ? (
          <EventCard event={eventDetails} />
        ) : (
          <p>No event details avaliable</p>
        )}
        {!user && authChecked && (
          <div>
            <p className="shared-event-message">
              You're viewing a shared event link. To sign up for this event or
              if you have a Google Account, Firstly register an account then
              sign up to the event and finally add the event to your Google
              Calendar, please visit this link:
              <a
                href="https://evnt5-97cf1.firebaseapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="event-shared-link"
              >
                https://evnt5-97cf1.firebaseapp.com
              </a>
            </p>
          </div>
        )}
        {authChecked && user && (
          <>
            <UserNavbar
              clickable={false}
              onLoggingOut={() => setIsLoggingOut(true)}
            />
            <div className="signup-card">
              <h2 className="sign-up-form-title">Sign Up Form</h2>
              <form onSubmit={handleSignUp} className="signup-form">
                <label htmlFor="signup-name" className="signup-label">
                  Name:
                </label>
                <input
                  type="text"
                  id="signup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Please enter your name"
                  required
                  className="signup-input"
                ></input>
                <label htmlFor="signup-email" className="event-signup-label">
                  Email:
                </label>
                <input
                  type="email"
                  id="signup-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Please enter your email"
                  required
                  className="signup-input"
                ></input>
                <button
                  type="submit"
                  disabled={loadingSignUp || userSignedUp || eventExpired}
                  className="signup-button"
                >
                  {eventExpired
                    ? "Event Expired"
                    : userSignedUp
                    ? "Already signed up"
                    : loadingSignUp
                    ? "Signing Up..."
                    : "Sign Up"}
                </button>
                {eventExpired && (
                  <p className="expired-message">This event has expired.</p>
                )}
              </form>

              <div>
                <button onClick={copyEventUrl} className="copy-url-button">
                  Copy Event URL
                </button>
              </div>
              <div>
                {googleUser && (
                  <div>
                    <h2 className="google-title">Google Calendar</h2>
                    {!userSignedUp && (
                      <p
                        role="alert"
                        aria-live="assertive"
                        style={{ color: "red" }}
                      >
                        You must be signed up for this event in order to add the
                        event to your calendar. Upon signing up, please connect
                        your Google Calendar
                      </p>
                    )}
                    <button
                      onClick={handleConnectGoogleCalendar}
                      disabled={
                        !userSignedUp || loadingConnect || calendarConnected
                      }
                      className="google-connect-button"
                    >
                      {loadingConnect
                        ? "Connecting"
                        : calendarConnected
                        ? "Connected to Google Calendar"
                        : "Connect Google Calendar"}
                    </button>
                    {!calendarConnected && (
                      <p
                        role="alert"
                        aria-live="assertive"
                        style={{ color: "red" }}
                      >
                        Please connect your Google Calendar first before adding
                        the event to your calendar
                      </p>
                    )}
                    <button
                      onClick={handleAddToGoogleCalendarButton}
                      disabled={
                        !calendarConnected ||
                        !userSignedUp ||
                        loadingAddEvent ||
                        eventAdded
                      }
                      className="google-add-button"
                    >
                      {loadingAddEvent
                        ? "Adding event"
                        : eventAdded
                        ? "Added to Calendar"
                        : "Add event to calendar"}
                    </button>
                  </div>
                )}
                {error && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    style={{ color: "red" }}
                  >
                    {error}
                  </p>
                )}
                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    style={{ color: "green" }}
                  >
                    {message}
                  </p>
                )}

                <h2 className="signups-list-title">Users who have signed up</h2>
                <ul className="signups-list">
                  {signUpsList.length > 0 ? (
                    signUpsList.map((signUp, index) => (
                      <li key={index} className="signup-name">
                        {signUp.name}
                      </li>
                    ))
                  ) : (
                    <p>No users have signed up yet.</p>
                  )}
                </ul>
              </div>
            </div>

            {loading && (
              <p className="event-details-loading">
                Loading form please wait...
              </p>
            )}
            {error && <p className="event-details-error">{error}</p>}
          </>
        )}
        <Footer />
      </section>
    </>
  );
};

export default UserEventDetailsPage;
