import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const bg = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `url(${bg}) center/cover no-repeat`,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 8, minWidth: 300 }}>
        <h2 style={{ color: "#2874f0", marginBottom: 20 }}>Register</h2>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <select name="role" value={form.role} onChange={handleChange} style={{ width: "100%", marginBottom: 10, padding: 8 }}>
          <option value="USER">User</option>
          <option value="STORE">Store Incharge</option>
          <option value="HOD">HOD</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" style={{ width: "100%", background: "#2874f0", color: "#fff", padding: 10, border: "none", borderRadius: 4 }}>Register</button>
      </form>
    </div>
  );
}
