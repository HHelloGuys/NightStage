// src/pages/VenueDetail.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

/* ---------- 유틸 ---------- */
const toPublic = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return (process.env.PUBLIC_URL || "") + p;
};
const fmtDate = (d) => d.toISOString().slice(0, 10);

/* ---------- 예약 패널 ---------- */
const MOCK_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "19:00", "20:00"];

function ReservationPanel({ stageId, basePrice = 15000 }) {
  const [date, setDate] = useState(() => fmtDate(new Date()));
  const [people, setPeople] = useState(1);
  const [duration, setDuration] = useState(1);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const total = useMemo(() => basePrice * duration, [basePrice, duration]);

  const fetchSlots = useCallback(
    async (d) => {
      setLoading(true);
      setErr("");
      try {
        // 실제 백엔드가 준비되면 엔드포인트를 맞춰주세요.
        // 예: GET /stages/:id/availability?date=YYYY-MM-DD
        const res = await api.get(`/stages/${stageId}/availability`, { params: { date: d } });
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setSlots(list.length ? list : MOCK_SLOTS);
      } catch (e) {
        console.warn("availability 실패 → MOCK 사용:", e?.message);
        setSlots(MOCK_SLOTS);
      } finally {
        setLoading(false);
      }
    },
    [stageId]
  );

  useEffect(() => {
    if (stageId) fetchSlots(date);
  }, [stageId, date, fetchSlots]);

  const onReserve = async () => {
    if (!selected) return alert("시간을 선택해 주세요.");
    try {
      // 실제 스펙에 맞게 수정하세요.
      await api.post("/reservations", {
        stageId,
        date,
        startTime: selected,
        durationHours: duration,
        people,
      });
      alert("예약 요청이 접수되었습니다.");
    } catch (e) {
      console.error("예약 실패:", e);
      alert("예약 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="reservation-panel" style={box}>
      <div style={boxHeader}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={dot} /> 예약하기
        </span>
      </div>

      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        {/* 날짜 */}
        <label style={label}>
          <span style={labelText}>날짜</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
        </label>

        {/* 인원/시간 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={label}>
            <span style={labelText}>인원</span>
            <input
              type="number"
              min={1}
              value={people}
              onChange={(e) => setPeople(+e.target.value || 1)}
              style={input}
            />
          </label>
          <label style={label}>
            <span style={labelText}>이용시간(시간)</span>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(+e.target.value || 1)}
              style={input}
            />
          </label>
        </div>

        {/* 시간 선택 */}
        <div style={label}>
          <span style={labelText}>시간 선택</span>
          {loading && <div style={muted}>가용 시간 불러오는 중…</div>}
          {err && !loading && <div style={{ color: "#b91c1c" }}>{err}</div>}
          {!loading && !err && (
            slots.length ? (
              <div className="slot-grid">
                {slots.map((t) => (
                  <button
                    key={t}
                    style={{ ...slotBtn, ...(selected === t ? slotBtnActive : {}) }}
                    onClick={() => setSelected(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div style={muted}>선택한 날짜에 예약 가능한 시간이 없습니다.</div>
            )
          )}
        </div>

        {/* 가격 / 예약 버튼 */}
        <div style={priceRow}>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>예상 금액</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {total.toLocaleString()} 원
              <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}> / {duration}시간</span>
            </div>
          </div>
          <button style={reserveBtn} onClick={onReserve} disabled={!selected}>
            {selected ? `${date} ${selected} 예약` : "시간 선택 후 예약"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 상세 페이지 ---------- */
export default function VenueDetail() {
  const { id } = useParams(); // 라우트: /venue/:id
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const toStage = (r = {}) => ({
    id: r.stageId ?? r.id,
    name: r.stageName ?? r.name ?? "공간",
    picture: toPublic(r.stagePicture || r.image || ""),
    location: r.location || r.address || "",
    price: r.price ?? 15000,
    phone: r.phone || "010-1234-5678",
    hours: r.hours || "09:00-22:00",
    rating: r.rating ?? 4.5,
    desc: r.description || "강성 셀프방음에 적절한 소형 스튜디오.",
  });

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErr("");
    try {
      const res = await api.get(`/stages/${id}`);
      const data = res?.data?.data || res?.data;
      setStage(toStage(data || {}));
    } catch (e) {
      console.warn("[GET] /stages/:id 실패 → mock 폴백:", e?.message);
      try {
        const r = await fetch("/mock/venues.json", { cache: "no-store" });
        const arr = (await r.json()) || [];
        const found = Array.isArray(arr) ? arr.find((v) => String(v.id ?? v.stageId) === String(id)) : null;
        setStage(found ? toStage(found) : null);
        if (!found) setErr("공간 정보를 불러오지 못했습니다.");
      } catch {
        setErr("공간 정보를 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <div>
      <Header />

      {/* 이 스타일 블록이 반응형 레이아웃/슬롯 그리드를 책임집니다 */}
      <style>{`
        .detail-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1rem 1.25rem 2rem;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
          gap: 24px;
          box-sizing: border-box;
        }
        @media (max-width: 980px) {
          .detail-layout {
            grid-template-columns: 1fr; /* 좁아지면 세로 스택 */
          }
        }
        .reservation-panel { width: 100%; box-sizing: border-box; }

        /* 시간 슬롯: 기본 3열 → 모바일 2열 */
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        @media (max-width: 480px) {
          .slot-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <main className="detail-layout">
        {loading && <div style={{ color: "#666" }}>불러오는 중…</div>}
        {!loading && err && <div style={{ color: "#b91c1c" }}>{err}</div>}

        {!loading && !err && stage && (
          <>
            {/* 왼쪽: 상세 정보 */}
            <div>
              {stage.picture && (
                <img
                  src={stage.picture}
                  alt={stage.name}
                  style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "16 / 9" }}
                />
              )}

              <h1 style={{ fontSize: 22, margin: "14px 0 6px" }}>{stage.name}</h1>
              <div style={{ color: "#666", fontSize: 14, marginBottom: 6 }}>
                {stage.location} · ★ {stage.rating}
              </div>
              <div style={{ color: "#666", fontSize: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span>⏰ {stage.hours}</span>
                <span>📞 {stage.phone}</span>
              </div>

              {/* 간단 탭 */}
              <div style={{ display: "flex", gap: 16, marginTop: 16, borderBottom: "1px solid #eee" }}>
                {["공간소개", "시설안내", "이용규칙", "환불정책", "Q&A", "후기"].map((t) => (
                  <div key={t} style={{ padding: "10px 4px", fontSize: 14 }}>{t}</div>
                ))}
              </div>

              <div style={{ padding: "14px 4px", color: "#444", lineHeight: 1.6 }}>{stage.desc}</div>
            </div>

            {/* 오른쪽: 예약 패널 (반응형, 절대 안 잘림) */}
            <ReservationPanel stageId={stage.id} basePrice={stage.price} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ---------- 스타일 객체 ---------- */
const box = { border: "1px solid #eee", borderRadius: 10, background: "#fff", overflow: "hidden", minHeight: 260 };
const boxHeader = { borderBottom: "1px solid #eee", padding: "12px 16px", fontWeight: 600, fontSize: 14 };
const dot = { width: 8, height: 8, background: "#e11d48", borderRadius: 999, display: "inline-block" };
const label = { display: "grid", gap: 6 };
const labelText = { fontSize: 12, color: "#666" };
const input = { height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #ddd" };
const muted = { color: "#666", fontSize: 13 };
const slotBtn = { height: 40, borderRadius: 10, border: "1px solid #ddd", background: "#fafafa", cursor: "pointer" };
const slotBtnActive = { borderColor: "#8b5cf6", background: "#f5f3ff", color: "#6d28d9", fontWeight: 600 };
const priceRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 4 };
const reserveBtn = {
  height: 44,
  padding: "0 16px",
  borderRadius: 10,
  border: "none",
  background: "#8b5cf6",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
