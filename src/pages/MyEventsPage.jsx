import { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import {
  getSignedUpEventsByUserEmail,
  getEventsById,
  removeUserFromEvent,
} from "../firebase/firebaseStore";
import EventCard from "../components/EventCard";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../css/MyEventsPage.css";

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setError("You need to be logged in to view your events");
        setLoading(false);
        return;
      }
      setUser(firebaseUser);

      try {
        const signUps = await getSignedUpEventsByUserEmail(firebaseUser.email);
        const eventData = [];
        for (const signUp of signUps) {
          const event = await getEventsById(signUp.eventId);
          eventData.push(event);
        }

        setEvents(eventData);
      } catch (error) {
        console.error(error);
        setError("error whilst fetching your events. Please try again");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOutOfEvent = async (eventId) => {
    if (!user) return;

    const confirmSignOut = window.confirm(
      "Are you sure you want to sign out of this event."
    );
    if (!confirmSignOut) return;

    try {
      await removeUserFromEvent(eventId, user.email);
      setEvents((preEvent) => preEvent.filter((e) => e.id !== eventId));

      localStorage.removeItem(`${user.uid}_eventAdded_${eventId}`);

      setMessage("You've successfully signed out of this event!");
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage(
        "There was an error removing you from this event. Please try again"
      );
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <>
      <section className="my-events-section">
        <h1 className="my-events-title">My Events</h1>
        <UserNavbar />
        {loading && (
          <p role="polite" className="my-events-loading">
            Loading your events...
          </p>
        )}
        {error && (
          <p role="alert" className="my-events-error">
            {error}
          </p>
        )}
        {message && (
          <p role="polite" className="my-events-loading">
            {message}
          </p>
        )}
        {events.length === 0 && !loading && (
          <p role="alert" className="my-events-message">
            You havent signed up to any events yet
          </p>
        )}
        <div className="my-events-list">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              clickable={false}
              onSignOut={handleSignOutOfEvent}
            />
          ))}
        </div>
        <Footer />
      </section>
    </>
  );
};
export default MyEventsPage;
