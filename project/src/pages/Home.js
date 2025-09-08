// src/pages/Home.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../components/Header";
import IconFilters from "../components/IconFilters";
import VenueCard from "../components/VenueCard";
import Footer from "../components/Footer";
import api from "../api"; // baseURL: http://localhost:4000/api

// 🔑 네 OAuth 클라이언트 ID로 교체
const GOOGLE_CLIENT_ID = "913446817762-5knrr2vm42199tkma0f0beq4e1gu1r12.apps.googleusercontent.com";

// Google Calendar 설정
const GOOGLE_DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const GOOGLE_SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly";

// 외부 스크립트 로더(중복 방지)
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

function Home() {
  // ====== 기존 공간 목록 로직 ======
  const [venues, setVenues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const toCardShape = (r = {}) => ({
    id: r.stageId,
    name: r.stageName,
    image: r.stagePicture || "",
    address: r.location || "",
    price: r.price ?? 0,
  });

  const fetchVenues = useCallback(async (categoryId = null) => {
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
      console.error("[GET] /stages 실패:", e?.response?.status, e?.response?.data || e.message);
      setVenues([]);
      setErrMsg("공간 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // ====== Google Calendar 연동 ======
  const [gapiReady, setGapiReady] = useState(false); // gapi+GIS 로드 여부
  const [gcAuthed, setGcAuthed] = useState(
    () => localStorage.getItem("gc_authed") === "1" // 지속성 플래그
  );
  const [busy, setBusy] = useState(false);
  const tokenClientRef = useRef(null);

  // 스크립트 로드
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

  // gapi client 준비
  const ensureGapiClient = async () => {
    if (!window.gapi) throw new Error("gapi not loaded");
    await new Promise((resolve) => window.gapi.load("client", resolve));
    if (!window.gapi.client.calendar) {
      await window.gapi.client.init({ discoveryDocs: GOOGLE_DISCOVERY_DOCS });
    }
  };

  // GIS 토큰 클라이언트 준비 (callback은 매 요청 직전에 할당)
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

  // 최초 로드 시: 이미 연동된 사용자면 silent 재인증(토큰 재발급) 시도
  useEffect(() => {
    (async () => {
      if (!gapiReady) return;
      try {
        await ensureGapiClient();
        // 이전에 연동한 적이 있다면 조용히 토큰 요청 (팝업/동의창 없이)
        if (gcAuthed) {
          const tokenClient = ensureTokenClient();
          tokenClient.callback = (res) => {
            if (res && res.access_token) {
              setGcAuthed(true);
              localStorage.setItem("gc_authed", "1");
            } else {
              // 실패하면 플래그만 내려놓고, 사용자가 다시 누르면 됨
              setGcAuthed(false);
              localStorage.removeItem("gc_authed");
            }
          };
          tokenClient.requestAccessToken({ prompt: "" });
        }
      } catch (e) {
        console.warn("Silent token refresh failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gapiReady]);

  // + 버튼: 명시적 연동
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
        } else {
          console.warn("No access token received:", res);
        }
        setBusy(false);
      };

      const hasToken = window.gapi.client.getToken() != null;
      tokenClient.requestAccessToken({ prompt: hasToken ? "" : "consent" });
    } catch (e) {
      console.error("Calendar connect failed:", e);
      alert("구글 캘린더 연동에 실패했습니다. 콘솔을 확인해 주세요.");
      setBusy(false);
    }
  };

  // 예시 이벤트 추가 (없으면 먼저 연동)
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

  // 캘린더 열기
  const openCalendar = () => {
    window.open("https://calendar.google.com/calendar/u/0/r", "_blank", "noopener,noreferrer");
  };

  // 연동 해제(토큰 폐기 + 상태 초기화)
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
      <Footer />

      {/* Floating Action Buttons */}
      <div style={fabWrapStyle}>
        {/* 메인 FAB: 인증 전에는 +, 인증 후에는 📅 (캘린더 열기) */}
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

        {/* 인증 후 보조 액션 */}
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

export default Home;
