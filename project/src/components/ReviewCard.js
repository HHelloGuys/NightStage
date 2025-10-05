// src/components/ReviewCard.js
import React from "react";

function ReviewCard({ review = {} }) {
  // 백엔드/목 양쪽 포맷을 모두 지원
  const img =
    review.image ||
    review.reviewPicture ||      // camelCase (JPA @JsonProperty 없이 나올 수 있음)
    review.review_picture ||     // snake_case 대비
    ((process.env.PUBLIC_URL || "") + "/mock/default.jpg");

  const title =
    review.title ||
    (Number.isFinite(review.rating) ? `★ ${review.rating}/5` : "리뷰");

  const description = review.description || review.content || "";
  const tags = Array.isArray(review.tags) ? review.tags : [];

  return (
    <div
      style={{
        width: 300,
        border: "1px solid #ccc",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={img}
        alt={title || "리뷰 이미지"}
        style={{ width: "100%", height: 160, objectFit: "cover" }}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = (process.env.PUBLIC_URL || "") + "/mock/default.jpg";
        }}
        loading="lazy"
        decoding="async"
      />
      <div style={{ padding: "0.75rem" }}>
        <h4 style={{ margin: 0, marginBottom: 6 }}>{title}</h4>
        <p style={{ fontSize: "0.9rem", color: "#555", margin: 0, whiteSpace: "pre-wrap" }}>
          {description}
        </p>

        {tags.length > 0 && (
          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.75rem",
                  background: "#eee",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewCard;
