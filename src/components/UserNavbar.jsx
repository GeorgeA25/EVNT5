import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { deleteUsersFromFirestore } from "../firebase/firebaseStore";

const UserNavbar = () => {
  const [isDroppedDown, setIsDroppedDown] = useState(false);
  const [logOutMessage, setLogOutMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsDroppedDown(true);
    try {
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
  return (
    <nav>
      <div>
        <button onClick={() => setIsDroppedDown(!isDroppedDown)}>
          Profile
        </button>
        {isDroppedDown && (
          <div>
            <button onClick={handleLogout}>Log out</button>
            <br />
            <button onClick={handleDeleteAccount}> Delete Account</button>
          </div>
        )}
      </div>
      {logOutMessage && <p>{logOutMessage}</p>}
      {deleteMessage && <p>{deleteMessage}</p>}
    </nav>
  );
};

export default UserNavbar;
