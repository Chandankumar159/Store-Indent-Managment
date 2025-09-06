import React, { useEffect, useState } from "react";
import API from "../../api";
import ItemCard from "../ItemCard";

const bg = "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1500&q=80";

export default function StoreDashboard() {
  const [indents, setIndents] = useState([]);
  const [thresholdItems, setThresholdItems] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    API.get("/indents/approved").then(res => setIndents(res.data));
    API.get("/items/threshold").then(res => setThresholdItems(res.data));
  }, []);

  const handleIssue = async (item, qty) => {
    const indent = indents.find(i => i.items.some(it => it.item.id === item.id));
    if (!indent) return;
    await API.put(`/indents/${indent.id}/issue`, { issuedItems: [{ item: item.id, issuedQty: Number(qty) }] });
    setMsg("Issued!");
    setTimeout(() => setMsg(""), 2000);
    API.get("/indents/approved").then(res => setIndents(res.data));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `url(${bg}) center/cover no-repeat`,
      padding: 0
    }}>
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#2874f0" }}>Approved Indents</h2>
        {msg && <div style={{ color: "green" }}>{msg}</div>}
        {indents.map(indent => (
          <div key={indent.id} style={{ marginBottom: 20, background: "#fff", padding: 16, borderRadius: 8 }}>
            <div><b>User:</b> {indent.user.name} ({indent.user.email})</div>
            <div>
              {indent.items.map(it =>
                <ItemCard key={it.item.id} item={it.item} onIssue={handleIssue} issuedQty={it.issuedQty} />
              )}
            </div>
            <div>Status: {indent.status}</div>
          </div>
        ))}
        <h2 style={{ color: "#ff5722", marginTop: 40 }}>Items Below Threshold</h2>
        <div>
          {thresholdItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
