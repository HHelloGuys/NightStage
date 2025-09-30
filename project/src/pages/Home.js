// src/pages/Home.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../components/Header";
import IconFilters from "../components/IconFilters";
import VenueCard from "../components/VenueCard";
import ReviewCard from "../components/ReviewCard";
import Footer from "../components/Footer";
import api from "../api"; // baseURL: http://localhost:4000/api

// (선택) Google Calendar 연동 - 기존 유지
const GOOGLE_CLIENT_ID =
  "913446817762-5knrr2vm42199tkma0f0beq4e1gu1r12.apps.googleusercontent.com";
const GOOGLE_DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const GOOGLE_SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly";

function loadScriptOnce(src, id) {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    if (id) s.id = id;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// 백엔드 static/절대 URL 모두 대응
const ASSET_BASE = process.env.REACT_APP_ASSET_BASE || ""; // 예: http://localhost:4000
const toImageUrl = (p) => {
  if (!p) return "";
  const norm = String(p).replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(norm)) return norm;                // 절대 URL
  if (norm.startsWith("/")) return (ASSET_BASE || "") + norm;  // /images/... → http://localhost:4000/images/...
  return (ASSET_BASE ? ASSET_BASE + "/" : (process.env.PUBLIC_URL || "") + "/") + norm.replace(/^\/+/, "");
};

export default function Home() {
  // ====== 장소 목록 ======
  const [venues, setVenues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // ====== 후기 목록 (DB 전용) ======
  const [reviews, setReviews] = useState([]);
  const [rLoading, setRLoading] = useState(false);
  const [rErrMsg, setRErrMsg] = useState("");

  // ====== (선택) 구글 캘린더 ======
  const [gapiReady, setGapiReady] = useState(false);
  const [gcAuthed, setGcAuthed] = useState(
    () => localStorage.getItem("gc_authed") === "1"
  );
  const [busy, setBusy] = useState(false);
  const tokenClientRef = useRef(null);

  // StageEntity → VenueCard 매핑
  const toCardShape = (r = {}) => ({
    id: r.stageId,
    name: r.stageName,
    image: toImageUrl(r.stagePicture || ""),
    address: r.location || "",
    price: r.price ?? 0,
  });

  // 장소 목록
  const fetchVenues = useCallback(async (categoryId = null) => {
    setLoading(true);
    setErrMsg("");
    try {
      const params = { page: 0, size: 10 };
      if (categoryId != null) params.categoryId = categoryId;

      const res = await api.get("/stages", { params });
      const page = res?.data?.data ?? res?.data;
      const list = Array.isArray(page?.content) ? page.content : [];
      setVenues(list.map(toCardShape));
    } catch (e) {
      console.error("[GET] /stages 실패:", e?.response?.status, e?.response?.data || e.message);
      setVenues([]);
      setErrMsg("공간 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 후기 목록: DB에서만 가져옴 (목 폴백 완전 제거)
  const fetchReviews = useCallback(async () => {
    setRLoading(true);
    setRErrMsg("");
    try {
      const res = await api.get("/reviews", {
        params: { page: 0, size: 4, sort: "reviewId,desc" },
      });

      console.log("[/api/reviews] response:", res?.data);

      // ApiResponse<T> 또는 Page 그대로 오는 경우 모두 지원
      const payload = res?.data;
      const pageLike =
        (payload && payload.success !== undefined ? payload.data : payload) || {};

      const rows = Array.isArray(pageLike?.content)
        ? pageLike.content
        : Array.isArray(pageLike)
        ? pageLike
        : [];

      const mapped = rows.map((r) => ({
        id: r.reviewId ?? r.id,
        image: toImageUrl(r.reviewPicture || r.review_picture || r.image || ""),
        title: r.title || (r.rating != null ? `★ ${r.rating}` : "후기"),
        description: r.content || r.description || "",
        tags: [],
      }));

      setReviews(mapped);
    } catch (e) {
      console.warn("[GET] /api/reviews 실패:", e?.response?.status, e?.message);
      setRErrMsg("후기를 불러오지 못했습니다.");
      setReviews([]); // 목 폴백 없음
    } finally {
      setRLoading(false);
    }
  }, []);

  // 최초 로드
  useEffect(() => {
    fetchVenues();
    fetchReviews();
  }, [fetchVenues, fetchReviews]);

  // ====== (선택) 구글 캘린더 연동 ======
  useEffect(() => {
    (async () => {
      try {
        await loadScriptOnce("https://apis.google.com/js/api.js", "google-api");
        await loadScriptOnce("https://accounts.google.com/gsi/client", "google-identity");
        setGapiReady(true);
      } catch (e) {
        console.error("Google scripts load failed:", e);
      }
    })();
  }, []);

  const ensureGapiClient = async () => {
    if (!window.gapi) throw new Error("gapi not loaded");
    await new Promise((resolve) => window.gapi.load("client", resolve));
    if (!window.gapi.client.calendar) {
      await window.gapi.client.init({ discoveryDocs: GOOGLE_DISCOVERY_DOCS });
    }
  };

  const ensureTokenClient = () => {
    if (!window.google || !window.google.accounts?.oauth2) {
      throw new Error("Google Identity Services not loaded");
    }
    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: () => {},
      });
    }
    return tokenClientRef.current;
  };

  useEffect(() => {
    (async () => {
      if (!gapiReady || !gcAuthed) return;
      try {
        await ensureGapiClient();
        const tokenClient = ensureTokenClient();
        tokenClient.callback = (res) => {
          if (res && res.access_token) {
            setGcAuthed(true);
            localStorage.setItem("gc_authed", "1");
          } else {
            setGcAuthed(false);
            localStorage.removeItem("gc_authed");
          }
        };
        tokenClient.requestAccessToken({ prompt: "" });
      } catch (e) {
        console.warn("Silent token refresh failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gapiReady]);

  const connectCalendar = async () => {
    try {
      setBusy(true);
      if (!gapiReady) throw new Error("Google scripts not ready yet");
      await ensureGapiClient();
      const tokenClient = ensureTokenClient();
      tokenClient.callback = (res) => {
        if (res && res.access_token) {
          setGcAuthed(true);
          localStorage.setItem("gc_authed", "1");
        }
        setBusy(false);
      };
      const hasToken = window.gapi.client.getToken() != null;
      tokenClient.requestAccessToken({ prompt: hasToken ? "" : "consent" });
    } catch (e) {
      console.error("Calendar connect failed:", e);
      alert("구글 캘린더 연동에 실패했습니다.");
      setBusy(false);
    }
  };

  const addQuickEvent = async () => {
    try {
      setBusy(true);
      await ensureGapiClient();
      if (!window.gapi.client.getToken()) {
        await connectCalendar();
        return;
      }
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const event = {
        summary: "NightStage - 테스트 예약",
        description: "예시로 추가된 이벤트입니다.",
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      };
      await window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      alert("구글 캘린더에 예시 이벤트가 추가되었습니다.");
    } catch (e) {
      console.error("Add event failed:", e);
      alert("이벤트 추가에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const openCalendar = () => {
    window.open("https://calendar.google.com/calendar/u/0/r", "_blank", "noopener,noreferrer");
  };

  const disconnectCalendar = async () => {
    try {
      const t = window.gapi?.client?.getToken();
      if (t?.access_token && window.google?.accounts?.oauth2?.revoke) {
        window.google.accounts.oauth2.revoke(t.access_token);
      }
    } catch {}
    try {
      window.gapi?.client?.setToken(null);
    } catch {}
    localStorage.removeItem("gc_authed");
    setGcAuthed(false);
    alert("구글 캘린더 연동이 해제되었습니다.");
  };

  // ====== UI ======
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <IconFilters
        onSelect={(categoryId) => {
          setSelectedCategory(categoryId);
          fetchVenues(categoryId);
        }}
      />

      {/* 새로 등록됐어요 */}
      <section style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          {selectedCategory ? `선택한 카테고리 (${selectedCategory})` : "새로 등록됐어요"}
        </h2>

        {loading && <div style={{ color: "#666" }}>불러오는 중…</div>}
        {!loading && errMsg && <div style={{ color: "#b91c1c" }}>{errMsg}</div>}

        {!loading && !errMsg && (
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
            {venues.length === 0 && <div style={{ color: "#666" }}>표시할 공간이 없습니다.</div>}
          </div>
        )}
      </section>

      {/* 방금 올라온 후기예요 */}
      <section style={{ padding: "0 2rem 2rem" }}>
        <h2 style={{ fontSize: "1.5rem", margin: "0 0 1rem" }}>방금 올라온 후기예요</h2>

        {rLoading && <div style={{ color: "#666" }}>불러오는 중…</div>}
        {!rLoading && rErrMsg && <div style={{ color: "#b91c1c" }}>{rErrMsg}</div>}

        {!rLoading && !rErrMsg && (
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
            {reviews.map((rv, i) => (
              <ReviewCard key={rv.id ?? i} review={rv} />
            ))}
            {reviews.length === 0 && <div style={{ color: "#666" }}>표시할 후기가 없습니다.</div>}
          </div>
        )}
      </section>

      <Footer />

      {/* (선택) 구글 캘린더 FAB */}
      <div style={fabWrapStyle}>
        <button
          aria-label="Google Calendar Connect"
          onClick={gcAuthed ? openCalendar : connectCalendar}
          disabled={busy}
          style={{
            ...fabStyle,
            background: gcAuthed ? "#34a853" : "#8b5cf6",
            cursor: busy ? "default" : "pointer",
          }}
          title={gcAuthed ? "구글 캘린더 열기" : "구글 캘린더 연동"}
        >
          {gcAuthed ? "📅" : "+"}
        </button>

        {gcAuthed && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={addQuickEvent} disabled={busy} style={miniBtnStyle} title="예시 이벤트 추가">
              이벤트 추가
            </button>
            <button onClick={disconnectCalendar} disabled={busy} style={miniBtnStyle} title="연동 해제">
              연동 해제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const fabWrapStyle = {
  position: "fixed",
  right: 20,
  bottom: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.5rem",
  zIndex: 1000,
};

const fabStyle = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  border: "none",
  color: "#fff",
  fontSize: "1.6rem",
  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
};

const miniBtnStyle = {
  border: "none",
  padding: "0.5rem 0.75rem",
  borderRadius: 999,
  background: "#eee",
  color: "#333",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  cursor: "pointer",
};
