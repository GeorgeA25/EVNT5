import { useState, useEffect } from "react";
import { getEventsFromFirestore } from "../firebase/firebaseStore";
import EventCard from "../components/EventCard";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../css/EventsPage.css";
import "../css/Footer.css";

const UserEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("All");

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

  const eventTypes = [];
  for (const event of events) {
    if (!eventTypes.includes(event.type)) {
      eventTypes.push(event.type);
    }
  }

  const filteredEvents =
    selectedType === "All"
      ? events
      : events.filter((event) => event.type === selectedType);

  return (
    <section className="events-section">
      <h1 className="events-message">Events Page</h1>
      <UserNavbar />
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="event-filter"
      >
        <option value="All">View All Event Types</option>
        {eventTypes.map((type) => (
          <option key={type} value={type} className="event-filter">
            {type}
          </option>
        ))}
      </select>
      {loading && (
        <p className="events-loading">Loading events please wait...</p>
      )}
      {error && <p className="events-error">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p>No events avaliable at the moment. PLease check back in later</p>
      )}
      {!loading && !error && events.length > 0 && (
        <div className="events-list">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      <Footer />
    </section>
  );
};

export default UserEventsPage;
