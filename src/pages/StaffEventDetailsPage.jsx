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
import "../css/EventDetailsPage.css";

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
    <section
      aria-labelledby="staff-event-details"
      className="staff-event-details-section"
    >
      <StaffNavbar onLoggingOut={() => setIsLoggingOut(true)} />
      <h2 className="staff-event-title">Event Details</h2>
      <EventCard event={eventDetails} clickable={false} />

      {currentUser && currentUser.uid === eventDetails.createdBy && (
        <div aria-label="Staff Event controls" className="staff-controls">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              aria-label="true"
              className="staff-button"
            >
              Edit Event
            </button>
          ) : (
            <button
              onClick={handleCancel}
              aria-label="Cancel Edit"
              className="staff-button"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleDelete}
            aria-label="Delete Event"
            className="staff-button"
          >
            Delete Event
          </button>
        </div>
      )}
      {message && (
        <p aria-live="polite" className="staff-message">
          {message}
        </p>
      )}
      {error && (
        <p aria-live="assertive" classname="staff-error">
          {error}
        </p>
      )}
      {editing && (
        <>
          <h2>Edit Event Form</h2>
          <form aria-label="Edit event form" className="edit-event-form">
            <label htmlFor="title" className="edit-event-label">
              Title:
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={draftEvent.title || ""}
              onChange={handleChange}
              aria-label="Event Title"
              aria-required="true"
              required
              className="edit-event-input"
            />
            <label htmlFor="description" className="edit-event-label"></label>
            <textarea
              id="description"
              name="description"
              value={draftEvent.description || ""}
              onChange={handleChange}
              aria-label="Event Description"
              aria-required="true"
              required
              className="edit-event-input"
            ></textarea>
            <label htmlFor="location" className="edit-event-label">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={draftEvent.location || ""}
              onChange={handleChange}
              aria-label="Event Location"
              aria-required="true"
              required
              className="edit-event-input"
            ></input>
            <label htmlFor="date" className="edit-event-label">
              Date:
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={draftEvent.date || ""}
              onChange={handleChange}
              aria-label="Event Date"
              aria-required="true"
              required
              className="edit-event-input"
            ></input>
            <label htmlFor="startTime" className="edit-event-label">
              Starttime
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={draftEvent.startTime || ""}
              onChange={handleChange}
              aria-label="Event Starttime"
              aria-required="true"
              required
              className="edit-event-input"
            ></input>
            <label htmlFor="endTime" className="edit-event-label">
              Endtime:
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={draftEvent.endTime || ""}
              onChange={handleChange}
              aria-label="Event Endtime"
              aria-required="true"
              required
              className="edit-event-input"
            ></input>
            <label htmlFor="type" className="edit-event-label">
              Type
            </label>
            <input
              id="type"
              name="type"
              type="text"
              value={draftEvent.type || ""}
              onChange={handleChange}
              aria-label="Event Type"
              aria-required="true"
              required
              className="edit-event-input"
            ></input>
            <label htmlFor="price" className="edit-event-label">
              Price (£):
            </label>
            <input
              id="price"
              name="price"
              type="number"
              value={draftEvent.price || ""}
              onChange={handleChange}
              aria-label="Event Price"
              aria-required="true"
              required
              className="edit-event-input"
            ></input>
          </form>
          <button
            onClick={handleSaveAndUpdateEvent}
            aria-label="Save event button"
            className="staff-button"
          >
            Save
          </button>
          {message && (
            <p aria-live="polite" className="staff-message">
              {message}
            </p>
          )}
        </>
      )}
      <Footer />
    </section>
  );
};

export default StaffEventDetailPage;
