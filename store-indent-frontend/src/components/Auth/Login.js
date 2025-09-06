import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const bg = "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1500&q=80";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      if (res.data.user.role === "USER") navigate("/user");
      else if (res.data.user.role === "STORE") navigate("/store");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `url(${bg}) center/cover no-repeat`,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 8, minWidth: 300 }}>
        <h2 style={{ color: "#2874f0", marginBottom: 20 }}>Login</h2>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <button type="submit" style={{ width: "100%", background: "#2874f0", color: "#fff", padding: 10, border: "none", borderRadius: 4 }}>Login</button>
      </form>
    </div>
  );
}
