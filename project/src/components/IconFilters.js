import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 전체 아이콘 목록
const allIcons = [
  { label: "작업실", icon: "🎶", category: "연습" },
  { label: "버스킹홀", icon: "🎤", category: "행사" },
  { label: "연습실", icon: "🎧", category: "연습" },
  { label: "연주스튜디오", icon: "📷", category: "촬영" },
  { label: "공연장", icon: "🏟️", category: "행사" },
  { label: "댄스연습실", icon: "💃", category: "연습" },
  { label: "라이브방송", icon: "📺", category: "촬영" },
  { label: "렌탈스튜디오", icon: "🏠", category: "촬영" },
];

// 카테고리 탭 목록
const tabs = ["전체", "연습", "촬영", "행사"];

function IconFilters({ onSelect }) {
  const [selectedTab, setSelectedTab] = useState("전체");
  const navigate = useNavigate();

  // 현재 선택된 탭에 따른 아이콘 필터링
  const filteredIcons =
    selectedTab === "전체"
      ? allIcons
      : allIcons.filter((item) => item.category === selectedTab);

  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>찾는 공간이 있나요?</h3>

      {/* 탭 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2rem" }}>
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              cursor: "pointer",
              borderBottom: selectedTab === tab ? "2px solid #8b5cf6" : "none",
              color: selectedTab === tab ? "#8b5cf6" : "#333",
              fontWeight: selectedTab === tab ? "bold" : "normal",
              paddingBottom: "0.25rem",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* 아이콘 필터 리스트 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "2rem",
          padding: "1rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {filteredIcons.map((item) => (
          <div
            key={item.label}
            onClick={() => navigate(`/category/${item.label}`)}
            style={{
              width: "22%",
              minWidth: "120px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                background: "#eee",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                lineHeight: "60px",
                margin: "0 auto",
              }}
            >
              {item.icon}
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconFilters;
