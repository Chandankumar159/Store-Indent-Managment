import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav style={{ background: "#2874f0", color: "#fff", padding: "1rem" }}>
      <span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Store Indent System</span>
      <span style={{ float: "right" }}>
        {user ? (
          <>
            <span style={{ marginRight: 20 }}>{user.name} ({user.role})</span>
            <button onClick={logout} style={{ background: "#fff", color: "#2874f0", border: "none", padding: "0.5rem 1rem", borderRadius: 4 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#fff", marginRight: 20 }}>Login</Link>
            <Link to="/register" style={{ color: "#fff" }}>Register</Link>
          </>
        )}
      </span>
    </nav>
  );
}
