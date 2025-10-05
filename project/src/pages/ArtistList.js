import React, { useCallback, useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api"; // baseURL: http://localhost:4000/api

const toCard = (r = {}) => ({
  id: r.artistId ?? r.id ?? Math.random().toString(36).slice(2),
  name: r.artistName ?? r.name ?? "이름 미상",
  image: r.profilePicture || r.image || "",
  genre: r.genre || r.tagline || "",
  location: r.location || r.city || "",
  rate: r.rate ?? r.hourlyRate ?? r.price ?? null,
});

function ArtistCard({ artist }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      {artist.image && (
        <img
          src={artist.image}
          alt={artist.name}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = (process.env.PUBLIC_URL || "") + "/mock/detail.jpg";
          }}
        />
      )}
      <div style={{ padding: "0.9rem" }}>
        <h4 style={{ margin: 0 }}>{artist.name}</h4>
        <p style={{ color: "#6b7280", margin: "6px 0 0", fontSize: 14 }}>
          {artist.genre || "장르 정보 없음"}
        </p>
        <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: 13 }}>
          {artist.location}
        </p>
        {artist.rate != null && (
          <p style={{ margin: "8px 0 0", fontWeight: 700 }}>
            ₩{Number(artist.rate).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ArtistList() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    try {
      // 백엔드가 있다면: GET /api/artists
      const res = await api.get("/artists", { params: { page: 0, size: 24 } });
      const page = res?.data?.data ?? res?.data;
      const rows = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : [];
      setArtists(rows.map(toCard));
    } catch {
      // 백엔드 없으면 public/mock/artists.json 사용 (선택)
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

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  return (
    <div>
      <Header />

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 18, fontWeight: 700 }}>
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
        {loading && <div style={{ color: "#666", gridColumn: "1 / -1" }}>불러오는 중…</div>}
        {!loading && errMsg && (
          <div style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>{errMsg}</div>
        )}
        {!loading && !errMsg && artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
        {!loading && !errMsg && artists.length === 0 && (
          <div style={{ color: "#666", gridColumn: "1 / -1" }}>표시할 아티스트가 없습니다.</div>
        )}
      </main>

      <Footer />
    </div>
  );
}
