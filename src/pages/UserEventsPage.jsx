import { useState, useEffect } from "react";
import { getEventsFromFirestore } from "../firebase/firebaseStore";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import UserNavbar from "../components/UserNavbar";

const UserEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const eventList = await getEventsFromFirestore();
        setEvents(eventList);
      } catch (error) {
        console.error("Error whlilst fetching events", error);
        setError("Failed to load events onto page");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section>
      <h1>Welcome to Evnt5 Page</h1>
      <UserNavbar />
      <br />
      {loading && <p>Loading events please wait...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p>No events avaliable at the moment. PLease check back in later</p>
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

export default UserEventsPage;
