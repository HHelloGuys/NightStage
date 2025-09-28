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

export default function CategoryPage() {
  const { categoryId } = useParams();
  const location = useLocation();

  // ?q= 또는 ?keyword= 지원
  const q = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return (sp.get("q") || sp.get("keyword") || "").trim();
  }, [location.search]);

  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  /* ------------------------- 목록 로딩 (경고 없음) ------------------------- */
  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const base = { page: 0, size: 24 };
      if (categoryId) base.categoryId = Number(categoryId);

      // 🔥 별도 함수 없이 여기서 바로 variant 반복 (ESLint 경고 제거)
      const variants = [
        base,
        q ? { ...base, keyword: q } : base,
        q ? { ...base, q } : base,
        q ? { ...base, name: q } : base,
        q ? { ...base, stageName: q } : base,
      ];

      let list = [];
      for (const params of variants) {
        try {
          const res = await api.get("/stages", { params });
          const page = res?.data?.data;
          if (page && Array.isArray(page.content)) {
            list = page.content;
            break;
          }
        } catch {
          // 다음 variant 시도
        }
      }

      // 서버가 검색을 무시하는 경우 프론트에서 보정
      if (q && list.length > 0) {
        const k = q.toLowerCase();
        list = list.filter((r) => {
          const name = (r.stageName || r.name || "").toLowerCase();
          const addr = (r.location || r.address || "").toLowerCase();
          return name.includes(k) || addr.includes(k);
        });
      }

      setVenues(list.map(toCard));
    } catch (e) {
      console.error("[CategoryPage] 목록 불러오기 실패:", e);
      setErrMsg("공간을 불러오지 못했습니다.");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, q]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ------------------------------- 지도 ------------------------------- */
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markersRef = useRef([]);

  const ensureKakao = async () => {
    if (window.kakao?.maps) return;
    const key =
      process.env.REACT_APP_KAKAO_MAP_KEY || "664f6627af84ac9dcac04b76afbafbd5";
    await new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
      s.onload = () => window.kakao.maps.load(resolve);
      document.head.appendChild(s);
    });
  };

  useEffect(() => {
    if (!showMap) return;

    (async () => {
      await ensureKakao();

      if (!mapObjRef.current && mapRef.current) {
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
        .map((v) => ({
          v,
          pos: new window.kakao.maps.LatLng(Number(v.lat), Number(v.lng)),
        }));

      // 마커 추가 + 인포윈도우
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

      // 범위 맞추기
      if (coords.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();
        coords.forEach(({ pos }) => bounds.extend(pos));
        map.setBounds(bounds);
      }
    })();
  }, [showMap, venues]);

  /* ----------------------------- 렌더 ----------------------------- */
  return (
    <div>
      <Header /> 

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px" }}>
        {/* 상단 상태 표기 */}
        <div style={{ color: "#666", marginBottom: 12 }}>
          {categoryId && <b>카테고리 #{categoryId}</b>}
          {categoryId && q && " · "}
          {q && <>검색: "<b>{q}</b>"</>}
          {!categoryId && !q && "전체 공간"}
        </div>

        {/* 상단 버튼들 */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: 12 }}>
          <button onClick={() => setShowFilters(true)} style={btn}>
            <span role="img" aria-label="filter">⚙️</span>&nbsp;필터
          </button>
          <button onClick={() => setShowMap((v) => !v)} style={btn}>
            <span role="img" aria-label="map">🗺</span>&nbsp;{showMap ? "지도 숨기기" : "지도 보기"}
          </button>
        </div>

        {/* 지도 */}
        {showMap && (
          <div
            ref={mapRef}
            id="category-map"
            style={{ width: "100%", height: 420, border: "1px solid #eee", borderRadius: 8, marginBottom: 16 }}
          />
        )}

        {/* 목록 */}
        {loading && <div style={{ color: "#666" }}>불러오는 중…</div>}
        {!loading && errMsg && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{errMsg}</div>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {!loading && !errMsg &&
            venues.map((v) => (
              <div key={v.id}>
                <VenueCard venue={v} />
              </div>
            ))}
        </div>

        {!loading && !errMsg && venues.length === 0 && (
          <div style={{ color: "#666", marginTop: 16 }}>
            표시할 공간이 없습니다{q ? ` (검색어: "${q}")` : ""}.
          </div>
        )}
      </div>

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
