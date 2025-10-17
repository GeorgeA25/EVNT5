import { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import {
  getSignedUpEventsByUserEmail,
  getEventsById,
} from "../firebase/firebaseStore";
import EventCard from "../components/EventCard";
import UserNavbar from "../components/UserNavbar";

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

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

  return (
    <>
      <h1>My Events</h1>
      <UserNavbar />
      {loading && <p role="polite">Loading your events...</p>}
      {error && <p role="alert">{error}</p>}
      {events.length === 0 && !loading && (
        <p role="alert">You havent signed up to any events yet</p>
      )}
      <div>
        {events.map((event) => (
          <EventCard key={event.id} event={event} clickable={false} />
        ))}
      </div>
    </>
  );
};
export default MyEventsPage;
