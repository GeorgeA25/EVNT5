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

  return (
    <section>
      {loading && <p>Loading please wait...</p>}
      <h2>Create an Event</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Event Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={event.title}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.title ? "true" : "false"}
          aria-describedby={inputErrors.title ? "title-error" : ""}
        />
        {inputErrors.title && (
          <span id="title-error">{inputErrors.title || ""}</span>
        )}
        <label htmlFor="description">Event Description</label>
        <textarea
          name="description"
          id="description"
          value={event.description}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.description ? "true" : "false"}
          aria-describedby={inputErrors.description ? "description-error" : ""}
        />
        {inputErrors.description && (
          <span id="description-error">{inputErrors.description}</span>
        )}
        <label htmlFor="location">Event Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={event.location}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.location ? "true" : "false"}
          aria-describedby={inputErrors.location ? "location-error" : ""}
        />
        {inputErrors.location && (
          <span id="location-error">{inputErrors.location}</span>
        )}
        <label htmlFor="date">Event Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={event.date}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.date ? "true" : "false"}
          aria-describedby={inputErrors.date ? "date-error" : ""}
        />
        {inputErrors.date && <span id="date-error">{inputErrors.date}</span>}
        <label htmlFor="type">Event Type</label>
        <input
          type="text"
          id="type"
          name="type"
          value={event.type}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.type ? "true" : "false"}
          aria-describedby={inputErrors.type ? "type-error" : ""}
        />
        {inputErrors.type && <span id="type-error">{inputErrors.type}</span>}
        <label htmlFor="startTime">Event Start Time</label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          value={event.startTime}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.startTime ? "true" : "false"}
          aria-describedby={inputErrors.startTime ? "startTime-error" : ""}
        />
        {inputErrors.startTime && (
          <span id="startTime-error">{inputErrors.startTime}</span>
        )}
        <label htmlFor="endTime">Event End Time</label>
        <input
          type="time"
          id="endTime"
          name="endTime"
          value={event.endTime}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.endTime ? "true" : "false"}
          aria-describedby={inputErrors.endTime ? "endTime-error" : ""}
        />
        {inputErrors.endTime && (
          <span id="endTime-error">{inputErrors.endTime}</span>
        )}
        <label htmlFor="price">Event price</label>
        <input
          type="number"
          id="price"
          name="price"
          value={event.price}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.price ? "true" : "false"}
          aria-describedby={inputErrors.price ? "price-error" : ""}
        />
        {inputErrors.price && <span id="price-error">{inputErrors.price}</span>}
        <button type="submit">Create Event</button>
        {error && <p>{error}</p>}
        {successMessage && <p>{successMessage}</p>}
      </form>
    </section>
  );
};

export default EventForm;
