import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import "../css/NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const handleNotFoundPage = () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/events");
      return;
    }

    if (currentUser.email.includes("@evnt5.com")) {
      navigate("/staff-dashboard");
    } else {
      navigate("/events");
    }
  };
  return (
    <section>
      <p className="not-found-message">
        Oops this page doesn't exist. Please click the button to take you back
        to the home page
      </p>
      <button onClick={handleNotFoundPage} className="not-found-button">
        Home Page
      </button>
    </section>
  );
};

export default NotFoundPage;
