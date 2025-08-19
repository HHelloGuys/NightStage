import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FilterDrawer from "../components/FilterDrawer";
import VenueCard from "../components/VenueCard";

function CategoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const venues = []; // API 연동 후 교체 예정

  const loadMap = useCallback(() => {
    if (window.kakao && window.kakao.maps) {
      const container = document.getElementById("category-map");
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울시청 좌표
        level: 4,
      };
      new window.kakao.maps.Map(container, options);
    }
  }, []);

  useEffect(() => {
    if (showMap) {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(loadMap);
      } else {
        const script = document.createElement("script");
        script.src =
          "//dapi.kakao.com/v2/maps/sdk.js?appkey=664f6627af84ac9dcac04b76afbafbd5&autoload=false";
        script.onload = () => {
          window.kakao.maps.load(loadMap);
        };
        document.head.appendChild(script);
      }
    }
  }, [showMap, loadMap]);

  return (
    <div>
      <Header />

      {/* 상단 필터 입력 영역 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1rem auto" }}>
        <input type="text" placeholder="지역" style={inputStyle} />
        <input type="text" placeholder="인원" style={inputStyle} />
        <input type="text" placeholder="날짜" style={inputStyle} />
        <button style={buttonStyle} onClick={() => setShowFilters(true)}>⚙️ 필터</button>
        <button style={buttonStyle} onClick={() => setShowMap(!showMap)}>🗺 지도</button>
      </div>

      {/* 정렬 탭 */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>베스트 공간 순 ▾</div>

      {/* Kakao Map 표시 영역 */}
      {showMap && (
        <div
          id="category-map"
          style={{ width: "90%", height: "400px", margin: "0 auto 2rem", borderRadius: "8px", border: "1px solid #eee" }}
        ></div>
      )}

      {/* 공간 카드 리스트 */}
      <div style={gridStyle}>
        {venues.map((venue, index) => (
          <VenueCard key={index} venue={venue} />
        ))}
      </div>

      {/* 필터 사이드 패널 */}
      {showFilters && (
        <FilterDrawer
          onClose={() => setShowFilters(false)}
          onApply={(filters) => {
            console.log("적용된 필터:", filters);
            setShowFilters(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

const inputStyle = {
  padding: "0.5rem",
  borderRadius: "6px",
  border: "1px solid #ddd",
  width: "150px",
};

const buttonStyle = {
  padding: "0.5rem 1rem",
  border: "1px solid #8b5cf6",
  background: "white",
  borderRadius: "999px",
  color: "#8b5cf6",
  cursor: "pointer",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1rem",
  padding: "1rem 2rem",
};

export default CategoryPage;
