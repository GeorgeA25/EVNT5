import { useState, useEffect } from "react";
import {
  getUserFromFirestore,
  getEventsByStaffId,
} from "../firebase/firebaseStore";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import StaffNavbar from "../components/StaffNavBar";

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

  return (
    <section>
      <h1>Welcome to the Staff Dashbaord</h1>
      <StaffNavbar />
      <br />
      <button onClick={handleCreateEvent}>Create New Event</button>
      {loading && <p>Loading evnt5...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p>
          No events avaliable at the moment. Please create an event to display
          on your staff dashboard and users events list
        </p>
      )}
      {!loading && !error && events.length > 0 && (
        <div>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
};

export default StaffEventPage;
