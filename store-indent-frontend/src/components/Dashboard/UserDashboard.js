import React, { useEffect, useState } from "react";
import API from "../../api";
import ItemCard from "../ItemCard";

const bg = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1500&q=80";

export default function UserDashboard() {
  const [items, setItems] = useState([]);
  const [myIndents, setMyIndents] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    API.get("/items").then(res => setItems(res.data));
    API.get("/indents/my").then(res => setMyIndents(res.data));
  }, []);

  const handleRequest = async (item) => {
    const qty = prompt("Enter quantity to request", 1);
    if (!qty || isNaN(qty) || qty < 1) return;
    await API.post("/indents", { items: [{ item: item.id, requestedQty: Number(qty) }] });
    setMsg("Request submitted!");
    setTimeout(() => setMsg(""), 2000);
    API.get("/indents/my").then(res => setMyIndents(res.data));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `url(${bg}) center/cover no-repeat`,
      padding: 0
    }}>
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#2874f0" }}>Available Items</h2>
        {msg && <div style={{ color: "green" }}>{msg}</div>}
        <div>
          {items.map(item => (
            <ItemCard key={item.id} item={item} onRequest={handleRequest} />
          ))}
        </div>
        <h2 style={{ color: "#2874f0", marginTop: 40 }}>My Requests</h2>
        <table style={{ width: "100%", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #ccc" }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Requested Qty</th>
              <th>Issued Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {myIndents.flatMap((indent, indentIdx) =>
              indent.items.map((it, itemIdx) => (
                <tr key={indent.id + "-" + (it.item.id || itemIdx)}>
                  <td>{it.item.name}</td>
                  <td>{it.requestedQty}</td>
                  <td>{it.issuedQty}</td>
                  <td>{indent.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
