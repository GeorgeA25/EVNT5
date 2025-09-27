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
        <label>Event Title</label>
        <input
          type="text"
          name="title"
          value={event.title}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.title ? "true" : "false"}
          aria-labelledby="title-label"
          aria-describedby={inputErrors.title ? "title-error" : ""}
        />
        {inputErrors.title && <span id="title-error">{inputErrors.title}</span>}
        <label>Event Description</label>
        <textarea
          name="description"
          value={event.description}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.description ? "true" : "false"}
          aria-labelledby="description-label"
          aria-describedby={inputErrors.description ? "description-error" : ""}
        />
        {inputErrors.description && (
          <span id="description-error">{inputErrors.description}</span>
        )}
        <label>Event Location</label>
        <input
          type="text"
          name="location"
          value={event.location}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.location ? "true" : "false"}
          aria-labelledby="location-label"
          aria-describedby={inputErrors.location ? "location-error" : ""}
        />
        {inputErrors.location && (
          <span id="location-error">{inputErrors.location}</span>
        )}
        <label>Event Date</label>
        <input
          type="date"
          name="date"
          value={event.date}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.date ? "true" : "false"}
          aria-labelledby="date-label"
          aria-describedby={inputErrors.date ? "date-error" : ""}
        />
        {inputErrors.date && <span id="date-error">{inputErrors.date}</span>}
        <label>Event Type</label>
        <input
          type="text"
          name="type"
          value={event.type}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.type ? "true" : "false"}
          aria-labelledby="type-label"
          aria-describedby={inputErrors.type ? "type-error" : ""}
        />
        {inputErrors.type && <span id="type-error">{inputErrors.type}</span>}
        <label>Event Start Time</label>
        <input
          type="time"
          name="startTime"
          value={event.startTime}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.startTime ? "true" : "false"}
          aria-labelledby="startTime-label"
          aria-describedby={inputErrors.startTime ? "startTime-error" : ""}
        />
        {inputErrors.startTime && (
          <span id="startTime-error">{inputErrors.startTime}</span>
        )}
        <label>Event End Time</label>
        <input
          type="time"
          name="endTime"
          value={event.endTime}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.endTime ? "true" : "false"}
          aria-labelledby="endTime-label"
          aria-describedby={inputErrors.endTime ? "endTime-error" : ""}
        />
        {inputErrors.endTime && (
          <span id="endTime-error">{inputErrors.endTime}</span>
        )}
        <label>Event price</label>
        <input
          type="number"
          name="price"
          value={event.price}
          onChange={handleChange}
          required
          aria-invalid={inputErrors.price ? "true" : "false"}
          aria-labelledby="price-label"
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
