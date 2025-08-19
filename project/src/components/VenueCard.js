// src/components/VenueCard.js
import React from "react";
import { useNavigate } from "react-router-dom";

function VenueCard({ venue }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/venue/${venue.id}`)}
      style={{
        width: 250,
        border: "1px solid #ddd",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        cursor: "pointer",
      }}
    >
      <img
        src={venue.image}
        alt={venue.name}
        style={{ width: "100%", height: 140, objectFit: "cover" }}
      />
      <div style={{ padding: "0.5rem" }}>
        <h4>{venue.name}</h4>
        <p style={{ color: "#888", fontSize: "0.85rem" }}>{venue.address}</p>
        <p>
          <strong>{Number(venue.price).toLocaleString()}원</strong>
        </p>
      </div>
    </div>
  );
}

export default VenueCard;
