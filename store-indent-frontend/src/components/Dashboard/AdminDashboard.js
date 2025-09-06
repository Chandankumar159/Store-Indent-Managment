import React, { useEffect, useState } from "react";
import API from "../../api";

const bg = "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=1500&q=80";

export default function AdminDashboard({ user }) {
  const [pending, setPending] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    API.get("/indents/pending").then(res => setPending(res.data));
  }, []);

  const handleApprove = async (id) => {
    await API.put(`/indents/${id}/approve`);
    setMsg("Approved!");
    setTimeout(() => setMsg(""), 2000);
    API.get("/indents/pending").then(res => setPending(res.data));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `url(${bg}) center/cover no-repeat`,
      padding: 0
    }}>
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#2874f0" }}>Pending Indents for Approval</h2>
        {msg && <div style={{ color: "green" }}>{msg}</div>}
        <table style={{ width: "100%", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #ccc" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Items</th>
              <th>Status</th>
              <th>Approve</th>
            </tr>
          </thead>
          <tbody>
            {pending.map(indent => (
              <tr key={indent.id}>
                <td>{indent.user.name} ({indent.user.email})</td>
                <td>
                  {indent.items.map(it => (
                    <div key={it.item.id}>{it.item.name}: {it.requestedQty}</div>
                  ))}
                </td>
                <td>{indent.status}</td>
                <td>
                  <button onClick={() => handleApprove(indent.id)} style={{ background: "#388e3c", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px" }}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
