import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api"; // baseURL: http://localhost:4000/api

// ✅ 백엔드에서 받은 데이터를 카드용 형태로 변환
const toCard = (r = {}) => ({
  id: r.artistId ?? r.id ?? Math.random().toString(36).slice(2),
  name: r.artistName ?? r.name ?? "이름 미상",
  image: r.profilePicture || r.image || "",
  genre: r.genre || "",
  location: r.location || "",
  sns: r.snsAccount || r.sns || "", // ✅ sns_account 반영
});

// ✅ 아티스트 카드 컴포넌트
function ArtistCard({ artist }) {
  const ASSET_BASE = process.env.REACT_APP_ASSET_BASE || "http://localhost:4000";
  const placeholder = useMemo(
    () => (process.env.PUBLIC_URL || "") + "/mock/detail.jpg",
    []
  );

  // 백엔드가 절대 경로를 안 내려주는 경우 대비
  const initialSrc = useMemo(() => {
    if (!artist.image) return placeholder;
    if (/^https?:\/\//i.test(artist.image)) return artist.image;
    return ASSET_BASE + artist.image.replace(/^\/+/, "/");
  }, [artist.image, ASSET_BASE, placeholder]);

  const [imgSrc, setImgSrc] = useState(initialSrc);

  // 아티스트 변경 시 이미지 다시 초기화
  useEffect(() => {
    setImgSrc(initialSrc);
  }, [initialSrc]);

  const handleError = useCallback(() => {
    if (imgSrc !== placeholder) setImgSrc(placeholder);
  }, [imgSrc, placeholder]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    >
      <img
        src={imgSrc}
        alt={artist.name}
        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
        loading="lazy"
        decoding="async"
        onError={handleError}
      />

      <div style={{ padding: "0.9rem" }}>
        <h4 style={{ margin: 0 }}>{artist.name}</h4>
        <p style={{ color: "#6b7280", margin: "6px 0 0", fontSize: 14 }}>
          {artist.genre || "장르 정보 없음"}
        </p>
        <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: 13 }}>
          {artist.location}
        </p>

        {/* ✅ 인스타그램 계정 표시 (클릭 시 Instagram으로 이동) */}
        {artist.sns && (
          <a
            href={`https://instagram.com/${artist.sns.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 8,
              display: "block",
              color: "#2563eb",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {artist.sns}
          </a>
        )}
      </div>
    </div>
  );
}

// ✅ 아티스트 목록 페이지
export default function ArtistList() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const fetchArtists = useCallback(async () => {
    console.log("🎯 fetchArtists called");
    setLoading(true);
    setErrMsg("");

    try {
      const res = await api.get("/artists", { params: { page: 0, size: 24 } });
      const page = res?.data?.data ?? res?.data;
      const rows = Array.isArray(page?.content)
        ? page.content
        : Array.isArray(page)
        ? page
        : [];

      // ✅ 중복 제거
      const seen = new Set();
      const unique = rows.map(toCard).filter((r) => !seen.has(r.id) && seen.add(r.id));

      setArtists(unique);
    } catch (err) {
      console.error("❌ Error fetching artists:", err);
      try {
        const r = await fetch("/mock/artists.json", { cache: "no-store" });
        const arr = (await r.json()) || [];
        setArtists(Array.isArray(arr) ? arr.map(toCard) : []);
      } catch {
        setErrMsg("아티스트 목록을 불러오지 못했습니다.");
        setArtists([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ⚙️ React StrictMode 중복 실행 방지
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ignore) await fetchArtists();
    })();
    return () => {
      ignore = true;
    };
  }, [fetchArtists]);

  return (
    <div>
      <Header />

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        아티스트
      </div>

      <style>{`
        .cards-grid {
          width: 100%;
          max-width: 1200px;
          margin: 1rem auto 2rem;
          padding: 0 1.25rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1200px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .cards-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>

      <main className="cards-grid">
        {loading && (
          <div style={{ color: "#666", gridColumn: "1 / -1" }}>불러오는 중…</div>
        )}
        {!loading && errMsg && (
          <div style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>{errMsg}</div>
        )}
        {!loading &&
          !errMsg &&
          artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
        {!loading && !errMsg && artists.length === 0 && (
          <div style={{ color: "#666", gridColumn: "1 / -1" }}>
            표시할 아티스트가 없습니다.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
