import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import UserDashboard from "./components/Dashboard/UserDashboard";
import StoreDashboard from "./components/Dashboard/StoreDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import API from "./api";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/auth/me").then(res => setUser(res.data.user)).catch(() => setUser(null));
    }
  }, []);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={user?.role === "USER" ? <UserDashboard /> : <Navigate to="/login" />} />
        <Route path="/store" element={user?.role === "STORE" ? <StoreDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={["HOD", "ADMIN"].includes(user?.role) ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? (user.role === "USER" ? "/user" : user.role === "STORE" ? "/store" : "/admin") : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
