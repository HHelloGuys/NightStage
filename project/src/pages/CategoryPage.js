// src/pages/CategoryPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FilterDrawer from "../components/FilterDrawer";
import VenueCard from "../components/VenueCard";
import api from "../api"; // baseURL: http://localhost:4000/api

// "/mock/xxx.jpg" → "<PUBLIC_URL>/mock/xxx.jpg"
const toPublic = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return (process.env.PUBLIC_URL || "") + p;
};

// StageEntity → VenueCard props
const toCard = (r = {}) => ({
  id: r.stageId ?? r.id,
  name: r.stageName ?? r.name,
  image: toPublic(r.stagePicture || r.image || ""),
  address: r.location || r.address || "",
  price: r.price ?? 0,
});

export default function CategoryPage() {
  const { categoryId } = useParams(); // /category/:categoryId
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // 목록 불러오기 (백엔드 → mock 폴백)
  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const params = { page: 0, size: 24 };
      if (categoryId) params.categoryId = Number(categoryId);

      const res = await api.get("/stages", { params });
      const page = res?.data?.data;
      const list = Array.isArray(page?.content) ? page.content : [];
      setVenues(list.map(toCard));
    } catch (e) {
      console.warn("[GET] /stages 실패 → mock 폴백:", e?.message);
      try {
        const r = await fetch("/mock/venues.json", { cache: "no-store" });
        let arr = (await r.json()) || [];
        if (!Array.isArray(arr)) arr = [];
        // mock에 categoryId 필드가 있으면 필터
        if (categoryId && arr.length && "categoryId" in (arr[0] || {})) {
          arr = arr.filter((v) => String(v.categoryId) === String(categoryId));
        }
        setVenues(arr.map(toCard));
      } catch {
        setVenues([]);
        setErrMsg("공간을 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Kakao 지도 (옵션)
  const loadMap = useCallback(() => {
    if (!window.kakao?.maps) return;
    const el = document.getElementById("category-map");
    if (!el) return;
    new window.kakao.maps.Map(el, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 4,
    });
  }, []);

  useEffect(() => {
    if (!showMap) return;
    const init = () => window.kakao.maps.load(loadMap);
    if (window.kakao?.maps) {
      init();
    } else {
      const key = process.env.REACT_APP_KAKAO_MAP_KEY || "664f6627af84ac9dcac04b76afbafbd5"; // TODO: .env로 이동
      const s = document.createElement("script");
      s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
      s.onload = init;
      document.head.appendChild(s);
    }
  }, [showMap, loadMap]);

  return (
    <div>
      <Header />

      {/* 상단 필터/지도 토글 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1rem auto" }}>
        <input type="text" placeholder="지역" style={inputStyle} />
        <input type="text" placeholder="인원" style={inputStyle} />
        <input type="text" placeholder="날짜" style={inputStyle} />
        <button style={buttonStyle} onClick={() => setShowFilters(true)}>⚙️ 필터</button>
        <button style={buttonStyle} onClick={() => setShowMap((v) => !v)}>{showMap ? "리스트" : "🗺 지도"}</button>
      </div>

      {/* 정렬 탭 자리 */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>베스트 공간 순 ▾</div>

      {/* 지도 (옵션) */}
      {showMap && (
        <div
          id="category-map"
          style={{ width: "90%", height: 400, margin: "0 auto 1.5rem", borderRadius: 8, border: "1px solid #eee" }}
        />
      )}

      {/* 그리드 CSS (컴포넌트에 포함) */}
      <style>{`
        .cards-grid {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto 2rem;
          padding: 0 1.25rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* 기본 3열 */
          gap: 24px; /* 가로/세로 간격 */
        }
        .cards-grid__item { display: flex; }
        .cards-grid__item > * { flex: 1; } /* VenueCard 동일 높이 */

        @media (max-width: 1200px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr); } /* 2열 */
        }
        @media (max-width: 640px) {
          .cards-grid { grid-template-columns: 1fr; gap: 16px; } /* 1열 */
        }
      `}</style>

      {/* 리스트: 3열 그리드(반응형) */}
      <main className="cards-grid">
        {loading && <div style={{ color: "#666" }}>불러오는 중…</div>}
        {!loading && errMsg && <div style={{ color: "#b91c1c" }}>{errMsg}</div>}

        {!loading && !errMsg && venues.length === 0 && (
          <div style={{ color: "#666" }}>표시할 공간이 없습니다.</div>
        )}

        {!loading && !errMsg &&
          venues.map((v) => (
            <div key={v.id} className="cards-grid__item">
              <VenueCard venue={v} />
            </div>
          ))}
      </main>

      {/* 필터 패널 */}
      {showFilters && (
        <FilterDrawer
          onClose={() => setShowFilters(false)}
          onApply={(filters) => {
            console.log("적용된 필터:", filters);
            setShowFilters(false);
            // TODO: fetchList 파라미터에 filters 반영 (가격/지역/인원 등)
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
