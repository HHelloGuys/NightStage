// src/pages/VenueDetail.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

// 백엔드 정적 파일 호스트 (이미지 경로 보정용)
const ASSET_BASE = process.env.REACT_APP_ASSET_BASE || "http://localhost:4000";

// 상대/루트/절대 경로 모두 안전 처리
const toImageUrl = (p) => {
  if (!p) return (process.env.PUBLIC_URL || "") + "/mock/detail.jpg";
  const norm = String(p).replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(norm)) return norm;
  if (norm.startsWith("/mock/")) return (process.env.PUBLIC_URL || "") + norm;
  if (norm.startsWith("/")) return ASSET_BASE + norm;
  return ASSET_BASE + "/" + norm.replace(/^\/+/, "");
};

export default function VenueDetail() {
  const { id } = useParams();

  // 공간 상세
  const [venue, setVenue] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  // 탭
  const [activeTab, setActiveTab] = useState("공간소개");

  // 후기
  const [reviews, setReviews] = useState([]);
  const [rLoading, setRLoading] = useState(false);
  const [rErr, setRErr] = useState("");

  // 예약폼 상태
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [people, setPeople] = useState(1);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 상세 불러오기
  useEffect(() => {
    if (!id) return;
    setErrMsg("");
    axios
      .get(`/api/stages/${id}`)
      .then((res) => setVenue(res?.data?.data ?? res?.data))
      .catch((err) => {
        console.error("공연장 불러오기 실패:", err);
        setErrMsg("공연장 정보를 불러오지 못했습니다.");
      });
  }, [id]);

  // 후기 불러오기
  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setRLoading(true);
    setRErr("");
    try {
      const res = await axios.get(`/api/reviews`, {
        params: { stageId: id, page: 0, size: 6 },
      });
      const page = res?.data?.data ?? res?.data;
      const rows = Array.isArray(page?.content) ? page.content : [];
      const mapped = rows.map((r) => ({
        id: r.reviewId,
        image: toImageUrl(r.reviewPicture || r.review_picture),
        rating: r.rating,
        content: r.content || "",
      }));
      setReviews(mapped);
    } catch (e) {
      console.error("[GET] /api/reviews 실패:", e);
      setRErr("후기를 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setRLoading(false);
    }
  }, [id]);

  // 후기 탭 들어왔을 때만 호출
  useEffect(() => {
    if (activeTab === "후기") fetchReviews();
  }, [activeTab, fetchReviews]);

  // 지도
  const hasCoords =
    venue && Number.isFinite(venue.lat) && Number.isFinite(venue.lng);

  const loadMap = useCallback(() => {
    if (!hasCoords) return;
    if (window.kakao?.maps) {
      const el = document.getElementById("map");
      if (!el) return;
      new window.kakao.maps.Map(el, {
        center: new window.kakao.maps.LatLng(venue.lat, venue.lng),
        level: 3,
      });
    }
  }, [venue, hasCoords]);

  useEffect(() => {
    if (activeTab === "시설안내" && hasCoords && window.kakao?.maps) {
      window.kakao.maps.load(loadMap);
    }
  }, [activeTab, hasCoords, loadMap]);

  /* ========= 💡 훅들은 여기(early return 이전)에서 항상 호출 ========= */

  // 시간당 가격 값을 훅들에서 쓰기 위해 미리 뽑아둠
  const price = venue?.price ?? null;

  // 오늘 날짜(최솟값) – 렌더마다 동일, 훅으로 한 번 계산
  const todayStr = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, []);

  // 이용 시간(시간 단위)
  const durationHours = useMemo(() => {
    if (!date || !startTime || !endTime) return 0;
    const s = new Date(`${date}T${startTime}:00`);
    const e = new Date(`${date}T${endTime}:00`);
    const ms = e.getTime() - s.getTime();
    if (isNaN(ms) || ms <= 0) return 0;
    return ms / (1000 * 60 * 60);
  }, [date, startTime, endTime]);

  // 총 금액
  const totalPrice = useMemo(() => {
    if (!Number.isFinite(price) || durationHours <= 0) return 0;
    const hours = Math.round(durationHours * 2) / 2; // 0.5 시간 단위 반올림
    return Math.max(0, Math.round(hours * Number(price)));
  }, [price, durationHours]);

  /* ========================= early returns ========================= */
  if (errMsg) return <div style={{ padding: "2rem", color: "#b91c1c" }}>{errMsg}</div>;
  if (!venue) return <div style={{ padding: "2rem" }}>로딩 중...</div>;

  // StageEntity 매핑(표시용)
  const stageName = venue.stageName || "공연장";
  const imageSrc = toImageUrl(venue.stagePicture);
  const introduction = venue.stageIntroduction || "";
  const facility = venue.stageFacility || "";
  const rules = venue.stageNotice || "";
  const refund = venue.refundPolicy || "";
  const location = venue.location || "";
  const capacity = venue.capacity;
  const rating = venue.stageRating;
  const openHours = venue.openHours || "";
  const contact = venue.contactInfo || "";

  // 예약 요청
  const submitReservation = async () => {
    if (!date) return alert("날짜를 선택해 주세요.");
    if (!startTime || !endTime) return alert("시간을 선택해 주세요.");
    if (durationHours <= 0) return alert("종료 시간이 시작 시간보다 뒤여야 합니다.");
    if (people <= 0) return alert("인원수를 입력해 주세요.");
    if (capacity && people > capacity) return alert(`최대 수용 인원은 ${capacity}명입니다.`);

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    try {
      setSubmitting(true);
      const payload = {
        stageId: id,
        date, // YYYY-MM-DD
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        people,
        memo,
      };
      await axios.post("/api/reservations", payload);
      alert("예약 요청이 접수되었습니다. (관리자 확인 후 확정)");
    } catch (e) {
      console.error("예약 요청 실패:", e?.response?.data || e.message);
      alert("예약 요청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* 좌측: 상세/탭 */}
          <div style={{ flex: 2 }}>
            <img
              src={imageSrc}
              alt={stageName}
              style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 8 }}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = (process.env.PUBLIC_URL || "") + "/mock/detail.jpg";
              }}
            />

            <h2 style={{ marginTop: "1rem" }}>{stageName}</h2>
            <p style={{ color: "#666", marginTop: 4 }}>
              {location}
              {capacity != null ? ` · ${capacity}석` : ""}
              {price != null ? ` · ₩${Number(price).toLocaleString()}/시간` : ""}
              {rating != null ? ` · ★ ${rating}` : ""}
            </p>
            {openHours && <p style={{ color: "#666" }}>⏰ {openHours}</p>}
            {contact && <p style={{ color: "#666" }}>☎️ {contact}</p>}

            {/* 탭 */}
            <div style={{ display: "flex", borderBottom: "1px solid #eee", marginTop: "2rem" }}>
              {["공간소개", "시설안내", "이용규칙", "환불정책", "Q&A", "후기"].map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "1rem",
                    cursor: "pointer",
                    borderBottom: activeTab === tab ? "3px solid #8b5cf6" : "none",
                    fontWeight: activeTab === tab ? "bold" : "normal",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* 탭 콘텐츠 */}
            <div style={{ padding: "1.5rem 0" }}>
              {activeTab === "공간소개" && (
                <div style={{ whiteSpace: "pre-wrap" }}>{introduction || "소개 정보가 없습니다."}</div>
              )}

              {activeTab === "시설안내" && (
                <>
                  {hasCoords ? (
                    <div id="map" style={{ width: "100%", height: 400 }} />
                  ) : (
                    <div style={{ color: "#666" }}>지도 좌표 정보가 없습니다.</div>
                  )}
                  {facility && (
                    <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>{facility}</div>
                  )}
                </>
              )}

              {activeTab === "이용규칙" && (
                <div style={{ whiteSpace: "pre-wrap" }}>{rules || "이용 규칙 정보가 없습니다."}</div>
              )}

              {activeTab === "환불정책" && (
                <div style={{ whiteSpace: "pre-wrap" }}>{refund || "환불 정책 정보가 없습니다."}</div>
              )}

              {activeTab === "Q&A" && <div>Q&A 콘텐츠는 준비 중입니다.</div>}

              {activeTab === "후기" && (
                <div>
                  {rLoading && <div style={{ color: "#666" }}>불러오는 중…</div>}
                  {!rLoading && rErr && <div style={{ color: "#b91c1c" }}>{rErr}</div>}
                  {!rLoading && !rErr && reviews.length === 0 && (
                    <div style={{ color: "#666" }}>표시할 후기가 없습니다.</div>
                  )}
                  {!rLoading && !rErr && reviews.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
                        gap: 16,
                      }}
                    >
                      {reviews.map((rv) => (
                        <div
                          key={rv.id}
                          style={{
                            border: "1px solid #eee",
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#fff",
                          }}
                        >
                          {rv.image && (
                            <img
                              src={rv.image}
                              alt="리뷰 이미지"
                              style={{ width: "100%", height: 150, objectFit: "cover" }}
                              onError={(e) => {
                                if (e.currentTarget.dataset.fallback) return;
                                e.currentTarget.dataset.fallback = "1";
                                e.currentTarget.src =
                                  (process.env.PUBLIC_URL || "") + "/mock/detail.jpg";
                              }}
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <div style={{ padding: 12 }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>
                              {Number.isFinite(rv.rating) ? `★ ${rv.rating}/5` : "리뷰"}
                            </div>
                            <div style={{ color: "#444", whiteSpace: "pre-wrap" }}>{rv.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 우측 예약 패널 */}
          <div
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "1rem",
              maxHeight: 640,
              minWidth: 300,
              position: "sticky",
              top: 20,
              alignSelf: "flex-start",
              background: "#fff",
            }}
          >
            <strong
              style={{
                borderBottom: "2px solid #8b5cf6",
                display: "inline-block",
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              🎟️ 예약하기
            </strong>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>날짜</label>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={labelStyle}>시작</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>종료</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  인원수 {venue?.capacity ? <span style={{ color: "#6b7280" }}>(최대 {venue.capacity}명)</span> : null}
                </label>
                <input
                  type="number"
                  min={1}
                  max={venue?.capacity || undefined}
                  value={people}
                  onChange={(e) => setPeople(Math.max(1, Number(e.target.value || 1)))}
                  style={inputStyle}
                  placeholder="인원수를 입력하세요"
                />
              </div>

              <div>
                <label style={labelStyle}>요청사항 (선택)</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="예: 악기 대여 필요"
                />
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>이용 시간</span>
                  <strong>{durationHours > 0 ? `${durationHours.toFixed(1)}시간` : "-"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>예상 결제 금액</span>
                  <strong>
                    {totalPrice > 0 ? `₩${totalPrice.toLocaleString()}` : "금액 계산 불가"}
                  </strong>
                </div>
                {price != null && (
                  <div style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>
                    (시간당 요금: ₩{Number(price).toLocaleString()})
                  </div>
                )}
              </div>

              <button
                onClick={submitReservation}
                disabled={submitting}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  background: "#8b5cf6",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: submitting ? "default" : "pointer",
                }}
                title="예약 요청"
              >
                {submitting ? "요청 중…" : "예약 요청"}
              </button>

              <div style={{ color: "#6b7280", fontSize: 12 }}>
                ※ 관리자 확인 후 확정됩니다. 결제/환불 정책은 ‘환불정책’ 탭을 확인하세요.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* --- styles --- */
const labelStyle = { display: "block", marginBottom: 6, fontWeight: 600 };
const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};
