import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FilterDrawer from "../components/FilterDrawer";
import VenueCard from "../components/VenueCard";
import api from "../api"; // baseURL: http://localhost:4000/api

function CategoryPage() {
  const { categoryId } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // StageEntity -> VenueCard가 읽는 형태로 변환
  const toCard = (r = {}) => ({
    id: r.stageId,
    name: r.stageName,
    image: r.stagePicture || "",
    address: r.location || "",
    price: r.price ?? 0,
  });

  // 목록 불러오기
  const fetchList = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    setErrMsg("");
    try {
      const res = await api.get("/stages", {
        params: { page: 0, size: 20, categoryId: Number(categoryId) },
      });
      const page = res?.data?.data;
      const list = Array.isArray(page?.content) ? page.content : [];
      setVenues(list.map(toCard));
    } catch (e) {
      console.error("[GET] /stages(category) 실패:", e?.response?.status, e?.response?.data || e.message);
      setVenues([]);
      setErrMsg("공간을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Kakao 지도
  const loadMap = useCallback(() => {
    if (!window.kakao?.maps) return;
    const container = document.getElementById("category-map");
    if (!container) return;
    new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 4,
    });
  }, []);
  useEffect(() => {
    if (showMap) {
      if (window.kakao?.maps) {
        window.kakao.maps.load(loadMap);
      } else {
        const script = document.createElement("script");
        script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=664f6627af84ac9dcac04b76afbafbd5&autoload=false";
        script.onload = () => window.kakao.maps.load(loadMap);
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
        <button style={buttonStyle} onClick={() => setShowMap(!showMap)}>{showMap ? "리스트" : "🗺 지도"}</button>
      </div>

      {/* 정렬 탭 */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>베스트 공간 순 ▾</div>

      {/* 지도 */}
      {showMap && (
        <div id="category-map" style={{ width: "90%", height: 400, margin: "0 auto 2rem", borderRadius: 8, border: "1px solid #eee" }} />
      )}

      {/* 리스트 */}
      <div style={gridStyle}>
        {loading && <div style={{ color: "#666" }}>불러오는 중…</div>}
        {!loading && errMsg && <div style={{ color: "#b91c1c" }}>{errMsg}</div>}
        {!loading && !errMsg && venues.map((v) => <VenueCard key={v.id} venue={v} />)}
        {!loading && !errMsg && venues.length === 0 && <div style={{ color: "#666" }}>표시할 공간이 없습니다.</div>}
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <FilterDrawer
          onClose={() => setShowFilters(false)}
          onApply={(filters) => {
            console.log("적용된 필터:", filters);
            setShowFilters(false);
            // TODO: filters를 fetchList 파라미터에 반영
          }}
        />
      )}

      <Footer />
    </div>
  );
}

const inputStyle = {
  padding: "0.5rem",
  borderRadius: 6,
  border: "1px solid #ddd",
  width: 150,
};

const buttonStyle = {
  padding: "0.5rem 1rem",
  border: "1px solid #8b5cf6",
  background: "white",
  borderRadius: 999,
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
