import { useNavigate } from "react-router-dom";
import "../css/EventCard.css";

const EventCard = ({ event, clickable = true, basePath = "/events" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable) {
      return navigate(`${basePath}/${event.id}`);
    }
  };

  return (
    <div className="event-card" onClick={handleClick}>
      <h2>{event.title}</h2>
      <p>Description: {event.description}</p>
      <p>Loaction: {event.location}</p>
      <p>Type: {event.type}</p>
      <p>Date: {event.date}</p>
      <p>Startime: {event.startTime}</p>
      <p>Endtime: {event.endTime}</p>
      <p>Price(£): {event.price}</p>
    </div>
  );
};

export default EventCard;
