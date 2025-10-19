import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { deleteStaffFromFirestore } from "../firebase/firebaseStore";

const StaffNavbar = ({ onloggingOut }) => {
  const [isDroppedDown, setIsDroppedDown] = useState(false);
  const [logOutMessage, setLogOutMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsDroppedDown(true);
    try {
      if (onloggingOut) {
        onloggingOut();
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

  const handleGoBackToStaffPage = () => {
    navigate("/staff-dashboard");
  };

  const handleDeleteAccount = async () => {
    const staff = auth.currentUser;
    if (!staff) {
      console.error("No staff is currently logged in");
      return;
    }

    const deleteConfirmation = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!deleteConfirmation) return;

    try {
      await deleteStaffFromFirestore(staff.uid);
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
  return (
    <nav>
      <div>
        <button
          onClick={() => setIsDroppedDown(!isDroppedDown)}
          className="staff-navbar"
        >
          Profile
        </button>
        {isDroppedDown && (
          <div>
            <button onClick={handleLogout} className="staff-navbar">
              Log out
            </button>
            <br />
            <button onClick={handleDeleteAccount} className="staff-navbar">
              {" "}
              Delete Account
            </button>
            <br />
            <button onClick={handleGoBackToStaffPage} className="staff-navbar">
              Home Page
            </button>
          </div>
        )}
      </div>
      {logOutMessage && <p className="staff-navbar-loading">{logOutMessage}</p>}
      {deleteMessage && <p className="staff-navbar-delete">{deleteMessage}</p>}
    </nav>
  );
};

export default StaffNavbar;
