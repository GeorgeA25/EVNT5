import { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import {
  deleteEventsById,
  getEventsById,
  updateEventById,
} from "../firebase/firebaseStore";
import { useNavigate, useParams } from "react-router-dom";
import EventCard from "../components/EventCard";
import StaffNavbar from "../components/StaffNavBar";
import Footer from "../components/Footer";

const StaffEventDetailPage = () => {
  const [draftEvent, setDraftEvent] = useState({});
  const [eventDetails, setEventDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const { eventId } = useParams();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (isLoggingOut) return;
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const eventData = await getEventsById(eventId);
        setEventDetails(eventData);

        if (eventData.createdBy !== currentUser.uid) {
          setError("You do not have permission to view or modify this event.");
          setTimeout(() => setError(""), 3000);
        }
      } catch (error) {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, currentUser]);

  const handleDelete = async () => {
    const confirmedDeletion = window.confirm(
      "Are you sure you want to delete this event"
    );
    if (!confirmedDeletion) return;

    try {
      await deleteEventsById(eventId);
      setMessage("Event has been deleted, returning back to your dashboard");
      setTimeout(() => {
        navigate("/staff-dashboard");
      }, 3000);
    } catch (error) {
      setError("error whilst deleting event", error);
      setMessage("Failed to delete event. Please try again");
    }
  };

  const handleEditToggle = () => {
    if (!editing) {
      setDraftEvent(eventDetails);
    }
    setEditing(!editing);
  };

  const handleSaveAndUpdateEvent = async () => {
    try {
      await updateEventById(eventId, draftEvent);
      setEventDetails(draftEvent);
      setEditing(false);
      setMessage("Event updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError("Failed to update event. Please try again");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraftEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setDraftEvent(eventDetails);
    setEditing(false);
  };
  if (isLoggingOut) {
    return <p>Logging out. Redirecting you back to login page...</p>;
  }
  if (loading) {
    return <p aria-live="polite">Loading event...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!eventDetails) {
    return <p>No event found</p>;
  }

  return (
    <section aria-labelledby="staff-event-details">
      <StaffNavbar onLoggingOut={() => setIsLoggingOut(true)} />
      <h2>Event Details</h2>
      <EventCard event={eventDetails} clickable={false} />

      {currentUser && currentUser.uid === eventDetails.createdBy && (
        <div aria-label="Staff Event controls">
          {!editing ? (
            <button onClick={() => setEditing(true)} aria-label="true">
              Edit Event
            </button>
          ) : (
            <button onClick={handleCancel} aria-label="Cancel Edit">
              Cancel
            </button>
          )}
          <button onClick={handleDelete} aria-label="Delete Event">
            Delete Event
          </button>
        </div>
      )}
      {message && <p aria-live="polite">{message}</p>}
      {error && <p aria-live="assertive">{error}</p>}
      {editing && (
        <>
          <h2>Edit Event Form</h2>
          <form aria-label="Edit event form">
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              name="title"
              type="text"
              value={draftEvent.title || ""}
              onChange={handleChange}
              aria-label="Event Title"
              aria-required="true"
              required
            />
            <label htmlFor="description"></label>
            <textarea
              id="description"
              name="description"
              value={draftEvent.description || ""}
              onChange={handleChange}
              aria-label="Event Description"
              aria-required="true"
              required
            ></textarea>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              value={draftEvent.location || ""}
              onChange={handleChange}
              aria-label="Event Location"
              aria-required="true"
              required
            ></input>
            <label htmlFor="date">Date:</label>
            <input
              id="date"
              name="date"
              type="date"
              value={draftEvent.date || ""}
              onChange={handleChange}
              aria-label="Event Date"
              aria-required="true"
              required
            ></input>
            <label htmlFor="startTime">Starttime</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={draftEvent.startTime || ""}
              onChange={handleChange}
              aria-label="Event Starttime"
              aria-required="true"
              required
            ></input>
            <label htmlFor="endTime">Endtime:</label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={draftEvent.endTime || ""}
              onChange={handleChange}
              aria-label="Event Endtime"
              aria-required="true"
              required
            ></input>
            <label htmlFor="type">Type</label>
            <input
              id="type"
              name="type"
              type="text"
              value={draftEvent.type || ""}
              onChange={handleChange}
              aria-label="Event Type"
              aria-required="true"
              required
            ></input>
            <label htmlFor="price">Price (£):</label>
            <input
              id="price"
              name="price"
              type="number"
              value={draftEvent.price || ""}
              onChange={handleChange}
              aria-label="Event Price"
              aria-required="true"
              required
            ></input>
          </form>
          <button
            onClick={handleSaveAndUpdateEvent}
            aria-label="Save event button"
          >
            Save
          </button>
          {message && <p aria-live="polite">{message}</p>}
        </>
      )}
      <Footer />
    </section>
  );
};

export default StaffEventDetailPage;
