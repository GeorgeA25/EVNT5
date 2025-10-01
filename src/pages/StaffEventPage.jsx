import { useState, useEffect } from "react";
import {
  getUserFromFirestore,
  getEventsByStaffId,
} from "../firebase/firebaseStore";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const StaffEventPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) {
        setError("User not authenticated");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const eventList = await getEventsByStaffId(currentUser.uid);
        setEvents(eventList);
      } catch (error) {
        console.error("Error whilst fetching events", error);
        setError("Failed to load events onto page");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <section>
      <h1>Welcome to the Staff Dashbaord</h1>
      <button onClick={handleCreateEvent}>Create New Event</button>
      {loading && <p>Loading evnt5...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && events.length > 0 && (
        <ul>
          {events.map((event) => (
            <li key={event.id} onClick={() => handleEventClick(event.id)}>
              <h2>Title: {event.title}</h2>
              <p>Date: {event.date}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default StaffEventPage;
