// src/components/ReviewCard.js
import React from "react";

function ReviewCard({ review }) {
  return (
    <div style={{
      width: 300,
      border: "1px solid #ccc",
      borderRadius: 8,
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    }}>
      <img
        src={review.image}
        alt="리뷰 이미지"
        style={{ width: "100%", height: 160, objectFit: "cover" }}
      />
      <div style={{ padding: "0.5rem" }}>
        <h4>{review.title}</h4>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>{review.description}</p>
        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {review.tags.map((tag, i) => (
            <span key={i} style={{
              fontSize: "0.75rem",
              background: "#eee",
              padding: "0.2rem 0.5rem",
              borderRadius: 4
            }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
