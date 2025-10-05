// src/pages/CategoryPage.js
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FilterDrawer from "../components/FilterDrawer";
import VenueCard from "../components/VenueCard";
import api from "../api";

// 서버 응답 → 카드 형태로 변환 (이미지 경로 가공 없이 그대로 사용)
const toCard = (r = {}) => ({
  id: r.stageId ?? r.id ?? Math.random().toString(36).slice(2),
  name: r.stageName ?? r.name ?? "(이름 없음)",
  image: r.stagePicture || r.image || "",
  address: r.location || r.address || "",
  price: r.price ?? 0,
  lat: r.lat ?? r.latitude ?? null,
  lng: r.lng ?? r.longitude ?? null,
});

// slug("작업실" 또는 "1") → 실제 categoryId(숫자)로 변환
const resolveCategoryId = async (raw) => {
  if (!raw) return null;
  const s = decodeURIComponent(String(raw));
  if (/^\d+$/.test(s)) return Number(s);
  const res = await api.get("/categories");
  const list = res?.data?.data ?? res?.data ?? [];
  const found = Array.isArray(list) ? list.find((c) => c.categoryName === s) : null;
  return found?.categoryId ?? null;
};

export default function CategoryPage() {
  const { slug: categorySlug } = useParams(); // /category/:slug
  const { search } = useLocation();
  const q = useMemo(() => new URLSearchParams(search).get("q") || "", [search]);

  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [title, setTitle] = useState("");

  // 지도 관련 ref
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markersRef = useRef([]);

  /* ------------------------- 목록 로딩 ------------------------- */
  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const cid = await resolveCategoryId(categorySlug);
      if (!cid) {
        setVenues([]);
        setTitle("");
        setErrMsg("카테고리를 찾을 수 없습니다.");
        return;
      }

      // 제목용
      try {
        const cRes = await api.get("/categories");
        const cats = cRes?.data?.data ?? cRes?.data ?? [];
        const found = Array.isArray(cats) ? cats.find((c) => c.categoryId === cid) : null;
        setTitle(found?.categoryName || "");
      } catch {
        setTitle("");
      }

      // 리스트
      const params = { page: 0, size: 24, categoryId: cid };
      const res = await api.get("/stages", { params });
      const page = res?.data?.data ?? res?.data;
      const list = Array.isArray(page?.content) ? page.content : [];
      setVenues(list.map(toCard));
    } catch (e) {
      console.warn("[GET] /stages 실패 → mock 폴백:", e?.message);
      try {
        const r = await fetch("/mock/venues.json", { cache: "no-store" });
        let arr = (await r.json()) || [];
        if (!Array.isArray(arr)) arr = [];
        const cid = await resolveCategoryId(categorySlug);
        if (cid && arr.length && "categoryId" in (arr[0] || {})) {
          arr = arr.filter((v) => String(v.categoryId) === String(cid));
        }
        setVenues(arr.map(toCard));
      } catch {
        setVenues([]);
        setErrMsg("공간을 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ------------------------- Kakao 지도 로더 ------------------------- */
  const loadMapOnce = useCallback(() => {
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
    const init = () => window.kakao.maps.load(loadMapOnce);
    if (window.kakao?.maps) {
      init();
    } else {
      const key = process.env.REACT_APP_KAKAO_MAP_KEY || "664f6627af84ac9dcac04b76afbafbd5";
      const s = document.createElement("script");
      s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    }
  }, [showMap, loadMapOnce]);

  const ensureKakao = useCallback(() => {
    if (window.kakao?.maps) return Promise.resolve();
    return new Promise((resolve) => {
      const key = process.env.REACT_APP_KAKAO_MAP_KEY || "664f6627af84ac9dcac04b76afbafbd5";
      const s = document.createElement("script");
      s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
      s.async = true;
      s.onload = () => window.kakao.maps.load(resolve);
      document.head.appendChild(s);
    });
  }, []);

  useEffect(() => {
    if (!showMap) return;

    (async () => {
      await ensureKakao();

      if (!mapRef.current) {
        mapRef.current = document.getElementById("category-map");
      }
      if (!mapRef.current) return;

      if (!mapObjRef.current) {
        mapObjRef.current = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        });
      }

      const map = mapObjRef.current;
      if (!map) return;

      // 기존 마커 제거
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const coords = venues
        .filter((v) => v.lat != null && v.lng != null)
        .map((v) => ({ v, pos: new window.kakao.maps.LatLng(Number(v.lat), Number(v.lng)) }));

      coords.forEach(({ v, pos }) => {
        const marker = new window.kakao.maps.Marker({ position: pos, clickable: true });
        marker.setMap(map);
        markersRef.current.push(marker);

        const iw = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:8px 10px; font-size:12px; max-width:200px;">
                      <b>${v.name}</b><br/>
                      <span style="color:#666">${v.address || ""}</span>
                    </div>`,
        });
        window.kakao.maps.event.addListener(marker, "click", () => iw.open(map, marker));
      });

      if (coords.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();
        coords.forEach(({ pos }) => bounds.extend(pos));
        map.setBounds(bounds);
      }
    })();
  }, [showMap, venues, ensureKakao]);

  /* ----------------------------- 렌더 ----------------------------- */
  return (
    <div>
      <Header />

      {/* 타이틀 */}
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 18, fontWeight: 600 }}>
        {title ? `${title} 공간` : loading ? "로딩 중…" : "카테고리"}
      </div>

      {/* 상단 필터/지도 토글 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1rem auto" }}>
        <input type="text" placeholder="지역" style={inputStyle} />
        <input type="text" placeholder="인원" style={inputStyle} />
        <input type="text" placeholder="날짜" style={inputStyle} />
        <button style={buttonStyle} onClick={() => setShowFilters(true)}>⚙️ 필터</button>
        <button style={buttonStyle} onClick={() => setShowMap((v) => !v)}>
          {showMap ? "리스트" : "🗺 지도"}
        </button>
      </div>

      {/* 상단 버튼들 (보조) */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: 12 }}>
        <button onClick={() => setShowFilters(true)} style={btn}>
          <span role="img" aria-label="filter">⚙️</span>&nbsp;필터
        </button>
        <button onClick={() => setShowMap((v) => !v)} style={btn}>
          <span role="img" aria-label="map">🗺</span>&nbsp;{showMap ? "지도 숨기기" : "지도 보기"}
        </button>
      </div>

      {/* 지도 (옵션) */}
      {showMap && (
        <div
          id="category-map"
          style={{
            width: "90%",
            height: 400,
            margin: "0 auto 1.5rem",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
      )}

      {/* 그리드 CSS */}
      <style>{`
        .cards-grid {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto 2rem;
          padding: 0 1.25rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .cards-grid__item { display: flex; }
        .cards-grid__item > * { flex: 1; }

        @media (max-width: 1200px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .cards-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>

      {/* 리스트 (✔ 단 한 번만 렌더) */}
      <main className="cards-grid">
        {loading && <div style={{ color: "#666" }}>불러오는 중…</div>}
        {!loading && errMsg && <div style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>{errMsg}</div>}

        {!loading && !errMsg && venues.map((v) => (
          <div key={v.id} className="cards-grid__item">
            <VenueCard venue={v} />
          </div>
        ))}

        {!loading && !errMsg && venues.length === 0 && (
          <div style={{ color: "#666", marginTop: 16, gridColumn: "1 / -1" }}>
            표시할 공간이 없습니다{q ? ` (검색어: "${q}")` : ""}.
          </div>
        )}
      </main>

      {showFilters && (
        <FilterDrawer
          onClose={() => setShowFilters(false)}
          onApply={(filters) => {
            console.log("적용된 필터:", filters);
            setShowFilters(false);
            // TODO: fetchList 파라미터에 filters 반영
          }}
        />
      )}

      <Footer />
    </div>
  );
}

/* --- styles --- */
const btn = {
  padding: "0.5rem 1rem",
  border: "1px solid #8b5cf6",
  background: "#fff",
  color: "#8b5cf6",
  borderRadius: 999,
  cursor: "pointer",
};
const inputStyle = {
  padding: "0.5rem 0.75rem",
  border: "1px solid #ddd",
  borderRadius: 8,
};
const buttonStyle = {
  padding: "0.5rem 0.75rem",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};
