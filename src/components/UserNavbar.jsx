import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { deleteUsersFromFirestore } from "../firebase/firebaseStore";
import "../css/Navbar.css";

const UserNavbar = ({ onLoggingOut }) => {
  const [isDroppedDown, setIsDroppedDown] = useState(false);
  const [logOutMessage, setLogOutMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsDroppedDown(true);
    try {
      localStorage.removeItem("googleCalendarConnected");

      Object.keys(localStorage)
        .filter((key) => key.startsWith("eventAdded_"))
        .forEach((key) => localStorage.removeItem(key));

      if (onLoggingOut) {
        onLoggingOut();
      }
      await signOut(auth);

      setIsDroppedDown(false);
      console.log("User signed out successfully");
      setLogOutMessage("Logging out. Redirecting to login page...");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("error signing out");
    }
  };

  const handleGoBackToEvents = () => {
    navigate("/events");
  };
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is currently logged in");
      return;
    }

    const deleteConfirmation = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!deleteConfirmation) return;

    try {
      await deleteUsersFromFirestore(user.uid);
      await signOut(auth);
      setDeleteMessage(
        "Account has been deleted. Redirecting to login page..."
      );
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error(
        "Error whilst deleting your account. If you wish to delete accoun please try again",
        error
      );
    }
  };

  const handleMyEvents = () => {
    navigate("/signedUpEvents");
  };

  return (
    <nav>
      <div>
        <button
          onClick={() => setIsDroppedDown(!isDroppedDown)}
          className="user-navbar"
        >
          Profile
        </button>
        {isDroppedDown && (
          <div>
            <button onClick={handleLogout} className="user-navbar">
              Log out
            </button>
            <br />
            <button onClick={handleDeleteAccount} className="user-navbar">
              {" "}
              Delete Account
            </button>
            <br />
            <button onClick={handleGoBackToEvents} className="user-navbar">
              Home Page
            </button>
            <br />
            <button onClick={handleMyEvents} className="user-navbar">
              My Events
            </button>
          </div>
        )}
      </div>
      {logOutMessage && <p className="user-nav-logout">{logOutMessage}</p>}
      {deleteMessage && <p className="user-nav-delete">{deleteMessage}</p>}
    </nav>
  );
};

export default UserNavbar;
