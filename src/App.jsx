import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
//import "./App.css";
import LoginPage from "./pages/LoginPage";
import StaffEventPage from "./pages/StaffEventPage";
import CreateEventPage from "./pages/CreateEventPage";
import UserEventsPage from "./pages/UserEventsPage";
import UserEventDetailsPage from "./pages/UserEventDetailsPage";
import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getGoogleUsersFromFirestore } from "./firebase/firebaseStore";
import OAuth2Callback from "./components/oauth2callback";
import { ToastContainer } from "react-toastify";
import NotFoundPage from "./pages/NotFound";
import StaffEventDetailsPage from "./pages/StaffEventDetailsPage";
import PaymentPage from "./pages/PaymentPage";
import MyEventsPage from "./pages/MyEventsPage";

function App() {
  const navigate = useNavigate();

  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          isStaff: user.email.includes("@evnt5.com"),
          firestoreUser: await getGoogleUsersFromFirestore(user.uid),
        });
        if (window.location.pathname === "/") {
          const targetPath = user.email.includes("@evnt5.com")
            ? "/staff-dashboard"
            : "/events";
          navigate(targetPath, { replace: true });
        }
      } else {
        setCurrentUser(null);
      }
      setIsFirebaseReady(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/staff-dashboard" element={<StaffEventPage />} />
        <Route path="/events" element={<UserEventsPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/events/:eventId" element={<UserEventDetailsPage />} />
        <Route
          path="/staff-events/:eventId"
          element={<StaffEventDetailsPage />}
        />
        <Route path="/oauth2callback" element={<OAuth2Callback />} />
        <Route path="/*" element={<NotFoundPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/signedUpEvents" element={<MyEventsPage />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={4000} />
    </>
  );
}

export default App;
