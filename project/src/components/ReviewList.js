// src/components/ReviewList.js
import React from "react";
import ReviewCard from "./ReviewCard";

export default function ReviewList({ items, loading, errMsg }) {
  if (loading) return <div style={{ color: "#666" }}>불러오는 중…</div>;
  if (errMsg) return <div style={{ color: "#b91c1c" }}>{errMsg}</div>;

  return (
    <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
      {items.map((r) => <ReviewCard key={r.id} review={r} />)}
      {items.length === 0 && <div style={{ color: "#666" }}>표시할 후기가 없습니다.</div>}
    </div>
  );
}
