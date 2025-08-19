import React, { useState } from "react";

function FilterDrawer({ onClose, onApply }) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const facilities = [
    "TV/프로젝터", "인터넷/WiFi", "복사/인쇄기", "화이트보드",
    "음향/마이크", "취사시설", "음식물반입가능", "주류반입가능", "샤워시설"
  ];

  const toggleFacility = (f) => {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  return (
    <div style={drawerOverlay}>
      <div style={drawerContent}>
        <h4>결제유형</h4>
        <div style={{ marginBottom: "1rem" }}>
          <label><input type="checkbox" defaultChecked /> 모든 결제유형</label>
        </div>

        <h4>가격</h4>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          ~
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>

        <h4 style={{ marginTop: "1rem" }}>편의시설</h4>
        <div style={tagWrap}>
          {facilities.map((f) => (
            <button
              key={f}
              onClick={() => toggleFacility(f)}
              style={{
                ...tagButton,
                background: selectedFacilities.includes(f) ? "#8b5cf6" : "#eee",
                color: selectedFacilities.includes(f) ? "#fff" : "#333",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          <button onClick={onClose} style={resetBtn}>초기화</button>
          <button onClick={() => onApply({ minPrice, maxPrice, selectedFacilities })} style={applyBtn}>필터 적용하기</button>
        </div>
      </div>
    </div>
  );
}

const drawerOverlay = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 999,
};

const drawerContent = {
  position: "absolute",
  right: 0,
  top: 0,
  width: "360px",
  height: "100%",
  background: "white",
  padding: "1.5rem",
  overflowY: "auto",
};

const tagWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  marginTop: "0.5rem",
};

const tagButton = {
  padding: "0.5rem 1rem",
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
};

const resetBtn = {
  background: "#facc15",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  cursor: "pointer",
};

const applyBtn = {
  background: "#8b5cf6",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
};

export default FilterDrawer;
