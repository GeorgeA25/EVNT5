import { useNavigate } from "react-router-dom";
import "../css/EventCard.css";

const EventCard = ({
  event,
  clickable = true,
  basePath = "/events",
  onSignOut,
}) => {
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
      {onSignOut && (
        <button className="signout-button" onClick={handleSignOutClick}>
          Sign out of Event
        </button>
      )}
    </div>
  );
};

export default EventCard;
