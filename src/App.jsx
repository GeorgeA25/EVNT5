import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import UserEventPage from "./pages/UserEventsPage";
import StaffEventPage from "./pages/StaffEventPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<UserEventPage />} />
      <Route path="/staff-dashboard" element={<StaffEventPage />} />
    </Routes>
  );
}

export default App;
