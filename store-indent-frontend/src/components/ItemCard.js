import React from "react";
const defaultImg = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80";

export default function ItemCard({ item, onRequest, onIssue, issuedQty }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #ccc",
      padding: 16, margin: 10, width: 220, display: "inline-block", verticalAlign: "top"
    }}>
      <img src={defaultImg} alt="item" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
      <h4 style={{ color: "#2874f0" }}>{item.name}</h4>
      <div>Stock: {item.quantity}</div>
      {onRequest && (
        <button onClick={() => onRequest(item)} style={{ marginTop: 10, background: "#ff5722", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px" }}>Request</button>
      )}
      {onIssue && (
        <div style={{ marginTop: 10 }}>
          <input type="number" min="1" max={item.quantity} defaultValue={issuedQty || 1} style={{ width: 60, marginRight: 8 }} id={`qty-${item.id}`} />
          <button onClick={() => onIssue(item, document.getElementById(`qty-${item.id}`).value)} style={{ background: "#388e3c", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px" }}>Issue</button>
        </div>
      )}
    </div>
  );
}
