// src/pages/Home.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import IconFilters from "../components/IconFilters";
import VenueCard from "../components/VenueCard";
import ReviewCard from "../components/ReviewCard";
import Footer from "../components/Footer";
import api from "../api"; // baseURL: http://localhost:4000/api

// 🔑 Google OAuth 클라이언트 ID (네 값으로 교체 가능)
const GOOGLE_CLIENT_ID =
  "913446817762-5knrr2vm42199tkma0f0beq4e1gu1r12.apps.googleusercontent.com";

// Google Calendar 설정
const GOOGLE_DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const GOOGLE_SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly";

// 외부 스크립트 1회 로더
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

// public 경로 보정
const toPublic = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return (process.env.PUBLIC_URL || "") + p;
};

export default function Home() {
  const navigate = useNavigate();

  // ===== 장소 =====
  const [venues, setVenues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // ===== 후기 =====
  const [reviews, setReviews] = useState([]);
  const [rLoading, setRLoading] = useState(false);
  const [rErrMsg, setRErrMsg] = useState("");

  // ===== Google Calendar =====
  const [gapiReady, setGapiReady] = useState(false); // ✅ UI에서 사용
  const [gcAuthed, setGcAuthed] = useState(
    () => localStorage.getItem("gc_authed") === "1"
  ); // ✅ UI/로직에서 사용
  const [busy, setBusy] = useState(false); // ✅ 버튼 disabled에 사용
  const tokenClientRef = useRef(null);

  // API -> 카드 형태
  const toCardShape = (r = {}) => ({
    id: r.stageId,
    name: r.stageName,
    image: r.stagePicture || "",
    address: r.location || "",
    price: r.price ?? 0,
  });

  // 장소 조회 (초기/카테고리 변경시)
  const fetchVenues = useCallback(
    async (categoryId = null) => {
      setLoading(true);
      setErrMsg("");
      try {
        const params = { page: 0, size: 10 };
        if (categoryId != null) params.categoryId = categoryId;

        const res = await api.get("/stages", { params });
        const page = res?.data?.data;
        const list = Array.isArray(page?.content) ? page.content : [];
        setVenues(list.map(toCardShape));
      } catch (e) {
        console.error(
          "[GET] /stages 실패:",
          e?.response?.status,
          e?.response?.data || e.message
        );
        setVenues([]);
        setErrMsg("공간 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 후기
  const fetchReviews = useCallback(async () => {
    setRLoading(true);
    setRErrMsg("");
    try {
      const res = await fetch("/mock/reviews.json", { cache: "no-store" });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      const safe = (Array.isArray(data) ? data : []).map((r) => ({
        ...r,
        image: toPublic(r.image),
      }));
      setReviews(safe);
    } catch (e) {
      console.error("[GET] /mock/reviews.json 실패:", e.message);
      setReviews([]);
      setRErrMsg("후기를 불러오지 못했습니다.");
    } finally {
      setRLoading(false);
    }
  }, []);

  // 최초 로드
  useEffect(() => {
    fetchVenues(null);
    fetchReviews();
  }, [fetchVenues, fetchReviews]);

  // 🔎 헤더 검색 → CategoryPage로 이동
  const handleSearch = (keyword = "") => {
    const q = (keyword || "").trim();
    if (q) {
      navigate(`/category?q=${encodeURIComponent(q)}`);
    } else {
      navigate(`/category`);
    }
  };

  // ===== Google Calendar 스크립트 로드
  useEffect(() => {
    (async () => {
      try {
        await loadScriptOnce("https://apis.google.com/js/api.js", "google-api");
        await loadScriptOnce(
          "https://accounts.google.com/gsi/client",
          "google-identity"
        );
        setGapiReady(true); // ✅ 읽히므로 경고 없음
      } catch (e) {
        console.error("Google scripts load failed:", e);
        setGapiReady(false);
      }
    })();
  }, []);

  // gapi client 준비
  const ensureGapiClient = async () => {
    if (!window.gapi) throw new Error("gapi not loaded");
    await new Promise((resolve) => window.gapi.load("client", resolve));
    if (!window.gapi.client.calendar) {
      await window.gapi.client.init({ discoveryDocs: GOOGLE_DISCOVERY_DOCS });
    }
  };

  // GIS token client 준비
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

  // 캘린더 연결
  const connectCalendar = async () => {
    try {
      setBusy(true);
      if (!gapiReady) throw new Error("Google scripts not ready");
      await ensureGapiClient(); // ✅ 사용
      const tokenClient = ensureTokenClient(); // ✅ 사용
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

  // 예시 이벤트 추가
  const addQuickEvent = async () => {
    try {
      setBusy(true);
      await ensureGapiClient(); // ✅ 사용
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

  // 캘린더 열기 / 연동 해제
  const openCalendar = () => {
    window.open(
      "https://calendar.google.com/calendar/u/0/r",
      "_blank",
      "noopener,noreferrer"
    );
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

  // ===== UI =====
  const fabDisabled = busy || (!gapiReady && !gcAuthed); // ✅ gapiReady가 실제로 사용됨

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header는 그대로, 검색 시 CategoryPage로 이동 */}
      <Header onSearch={handleSearch} />

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
            {venues.length === 0 && (
              <div style={{ color: "#666" }}>표시할 공간이 없습니다.</div>
            )}
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
            {reviews.map((rv) => (
              <ReviewCard key={rv.id} review={rv} />
            ))}
            {reviews.length === 0 && (
              <div style={{ color: "#666" }}>표시할 후기가 없습니다.</div>
            )}
          </div>
        )}
      </section>

      <Footer />

      {/* Google Calendar FAB */}
      <div style={fabWrapStyle}>
        <button
          aria-label="Google Calendar Connect"
          onClick={gcAuthed ? openCalendar : connectCalendar}
          disabled={fabDisabled}
          style={{
            ...fabStyle,
            background: gcAuthed ? "#34a853" : "#8b5cf6",
            cursor: fabDisabled ? "default" : "pointer",
            opacity: fabDisabled ? 0.7 : 1,
          }}
          title={
            gcAuthed
              ? "구글 캘린더 열기"
              : gapiReady
              ? "구글 캘린더 연동"
              : "Google 스크립트 로딩 중…"
          }
        >
          {gcAuthed ? "📅" : "+"}
        </button>

        {gcAuthed && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={addQuickEvent} disabled={busy} style={miniBtnStyle} title="예시 이벤트 추가">
              {busy ? "처리 중…" : "이벤트 추가"}
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

/* --- styles --- */
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
