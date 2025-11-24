import { useState, useEffect } from "react";
import { addEventsTorFirestore } from "../firebase/firebaseStore";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const EventForm = () => {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "",
    createdBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [inputErrors, setInputErrors] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      setEvent((preEvent) => ({
        ...preEvent,
        createdBy: auth.currentUser.uid,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((preEvent) => ({
      ...preEvent,
      [name]: value,
    }));

    setInputErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };
  const formValidation = () => {
    let valid = true;
    let errors = {};

    const requiredInputs = [
      "title",
      "description",
      "location",
      "type",
      "date",
      "startTime",
      "endTime",
      "price",
    ];

    requiredInputs.forEach((input) => {
      if (!event[input]) {
        errors[input] = `${input} is required`;
        valid = false;
      }
    });

    if (event.startTime && event.endTime) {
      const start = new Date(`${event.date}T${event.startTime}`);
      const end = new Date(`${event.date}T${event.endTime}`);

      if (end <= start) {
        errors.endTime =
          "End time for creating an event must be after event's created start time";
        valid = false;
      }
    }

    setInputErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isValid = formValidation();

    if (!isValid) {
      setLoading(false);
      return;
    }
    try {
      await addEventsTorFirestore(event);
      setEvent({
        title: "",
        description: "",
        location: "",
        type: "",
        date: "",
        startTime: "",
        endTime: "",
        price: "",
      });
      setSuccessMessage("Event was created successfully");
    } catch (error) {
      console.error("Error whilst creating event", error);
      setError(
        "There was an error whilst creating the event. Please check all inputs then try again"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        navigate("/staff-dashboard");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  useEffect(() => {
    if (Object.keys(inputErrors).length > 0) {
      const timer = setTimeout(() => {
        setInputErrors({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <section className="create-event-section">
      {loading && (
        <p className="create-event-loading">Loading please wait...</p>
      )}
      <form onSubmit={handleSubmit} className="create-event-form">
        <label htmlFor="title" className="create-event-label">
          Event Title:
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={event.title}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.title ? "true" : "false"}
          aria-describedby={inputErrors.title ? "title-error" : ""}
          className="create-event-input"
        />
        {inputErrors.title && (
          <span id="title-error" className="create-event-form-error">
            {inputErrors.title || ""}
          </span>
        )}
        <label htmlFor="description" className="create-event-label">
          Event Description:
        </label>
        <textarea
          name="description"
          id="description"
          value={event.description}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.description ? "true" : "false"}
          aria-describedby={inputErrors.description ? "description-error" : ""}
          className="create-event-input"
        />
        {inputErrors.description && (
          <span id="description-error" className="create-event-form-error">
            {inputErrors.description}
          </span>
        )}
        <label htmlFor="location" className="create-event-label">
          Event Location:
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={event.location}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.location ? "true" : "false"}
          aria-describedby={inputErrors.location ? "location-error" : ""}
          className="create-event-input"
        />
        {inputErrors.location && (
          <span id="location-error" className="create-event-form-error">
            {inputErrors.location}
          </span>
        )}
        <label htmlFor="date" className="create-event-label">
          Event Date:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={event.date}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.date ? "true" : "false"}
          aria-describedby={inputErrors.date ? "date-error" : ""}
          min={new Date().toISOString().split("T")[0]}
          className="create-event-input"
        />
        {inputErrors.date && (
          <span id="date-error" className="create-event-form-error">
            {inputErrors.date}
          </span>
        )}
        <label htmlFor="type" className="create-event-label">
          Event Type:
        </label>
        <input
          type="text"
          id="type"
          name="type"
          value={event.type}
          onChange={handleChange}
          required
          placeholder="e.g., Tech Meetup, Movie Night"
          aria-invalid={inputErrors.type ? "true" : "false"}
          aria-describedby={inputErrors.type ? "type-error" : ""}
          className="create-event-input"
        />
        {inputErrors.type && (
          <span id="type-error" className="create-event-form-error">
            {inputErrors.type}
          </span>
        )}
        <label htmlFor="startTime" className="create-event-label">
          Event Start Time:
        </label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          value={event.startTime}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.startTime ? "true" : "false"}
          aria-describedby={inputErrors.startTime ? "startTime-error" : ""}
          className="create-event-input"
        />
        {inputErrors.startTime && (
          <span id="startTime-error" className="create-event-form-error">
            {inputErrors.startTime}
          </span>
        )}
        <label htmlFor="endTime" className="create-event-label">
          Event End Time:
        </label>
        <input
          type="time"
          id="endTime"
          name="endTime"
          value={event.endTime}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.endTime ? "true" : "false"}
          aria-describedby={inputErrors.endTime ? "endTime-error" : ""}
          className="create-event-input"
        />
        {inputErrors.endTime && (
          <span id="endTime-error" className="create-event-form-error">
            {inputErrors.endTime}
          </span>
        )}
        <label htmlFor="price" className="create-event-label">
          Event price(£):
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={event.price}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.price ? "true" : "false"}
          aria-describedby={inputErrors.price ? "price-error" : ""}
          className="create-event-input"
        />
        {inputErrors.price && (
          <span id="price-error" className="create-event-form-error">
            {inputErrors.price}
          </span>
        )}
        <button type="submit" className="create-event-button">
          Create Event
        </button>
        {error && <p className="create-event-error">{error}</p>}
        {successMessage && (
          <p className="creat-event-message">{successMessage}</p>
        )}
      </form>
    </section>
  );
};

export default EventForm;
