// src/pages/VenueDetail.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PaymentModal from "../components/PaymentModal";
import axios from "axios";

// 백엔드 정적 파일 호스트 (이미지 경로 보정용)
const ASSET_BASE = process.env.REACT_APP_ASSET_BASE || "http://localhost:4000";

// 상대/루트/절대 경로 모두 안전 처리
const toImageUrl = (p) => {
  if (!p) return (process.env.PUBLIC_URL || "") + "/mock/detail.jpg";
  const norm = String(p).replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(norm)) return norm; // 절대 URL
  if (norm.startsWith("/mock/")) return (process.env.PUBLIC_URL || "") + norm; // 프론트 public
  if (norm.startsWith("/")) return ASSET_BASE + norm; // 백엔드 루트
  return ASSET_BASE + "/" + norm.replace(/^\/+/, ""); // 상대경로 → 백엔드 기준
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

  // 예약 폼
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [people, setPeople] = useState(1);

  // 결제 모달
  const [payOpen, setPayOpen] = useState(false);
  const [payItem, setPayItem] = useState(null);

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

  // 후기 탭 들어왔을 때만 호출 (id 바뀌어도 다시 호출)
  useEffect(() => {
    if (activeTab === "후기") fetchReviews();
  }, [activeTab, fetchReviews]);

  // 지도
  const hasCoords =
    venue && Number.isFinite(Number(venue.lat)) && Number.isFinite(Number(venue.lng));

  const loadMap = useCallback(() => {
    if (!hasCoords) return;
    if (window.kakao?.maps) {
      const el = document.getElementById("map");
      if (!el) return;
      new window.kakao.maps.Map(el, {
        center: new window.kakao.maps.LatLng(Number(venue.lat), Number(venue.lng)),
        level: 3,
      });
    }
  }, [venue, hasCoords]);

  useEffect(() => {
    if (activeTab === "시설안내" && hasCoords && window.kakao?.maps) {
      window.kakao.maps.load(loadMap);
    }
  }, [activeTab, hasCoords, loadMap]);

  if (errMsg) return <div style={{ padding: "2rem", color: "#b91c1c" }}>{errMsg}</div>;
  if (!venue) return <div style={{ padding: "2rem" }}>로딩 중...</div>;

  // StageEntity 매핑
  const stageName = venue.stageName || "공연장";
  const imageSrc = toImageUrl(venue.stagePicture);
  const introduction = venue.stageIntroduction || "";
  const facility = venue.stageFacility || "";
  const rules = venue.stageNotice || "";
  const refund = venue.refundPolicy || "";
  const location = venue.location || "";
  const capacity = venue.capacity;
  const price = Number(venue.price ?? 0);
  const rating = venue.stageRating;
  const openHours = venue.openHours || "";
  const contact = venue.contactInfo || "";

  // 간단한 금액 계산 (시간 차 * 시간당 금액 가정)
  const timeDiffHours = (() => {
    if (!startTime || !endTime) return 0;
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    const start = sH * 60 + sM;
    const end = eH * 60 + eM;
    const diff = Math.max(0, end - start);
    return Math.ceil(diff / 60);
  })();
  const estimatedTotal = price > 0 ? price * Math.max(1, timeDiffHours) : 0;

  const onClickReserve = () => {
    if (!date || !startTime || !endTime) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }
    setPayItem({
      stageId: venue.stageId || id,
      name: stageName,
      // 실제 결제 금액: 예시로 계산값 사용
      price: estimatedTotal,
      image: imageSrc,
      meta: { date, startTime, endTime, people: Number(people) },
    });
    setPayOpen(true);
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
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "1rem",
              maxHeight: 620,
              minWidth: 300,
              position: "sticky",
              top: 16,
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
              <label style={labelStyle}>
                <span>날짜</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={inputStyle}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <label style={labelStyle}>
                  <span>시작</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  <span>종료</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={labelStyle}>
                <span>인원</span>
                <input
                  type="number"
                  min={1}
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  style={inputStyle}
                />
              </label>

              <div style={{ marginTop: 4, color: "#555", fontSize: 14 }}>
                시간당 금액: {price > 0 ? `₩${price.toLocaleString()}` : "문의"}
                {timeDiffHours > 0 && price > 0 ? (
                  <div style={{ marginTop: 4, fontWeight: 600 }}>
                    예상 결제금액: ₩{estimatedTotal.toLocaleString()}
                  </div>
                ) : null}
              </div>

              <button
                onClick={onClickReserve}
                style={{
                  marginTop: 8,
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  border: "1px solid #8b5cf6",
                  background: "#8b5cf6",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 모달 (페이지 위 오버레이) */}
      <PaymentModal open={payOpen} item={payItem} onClose={() => setPayOpen(false)} />

      <Footer />
    </div>
  );
}

/* ----- styles ----- */
const inputStyle = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid #ddd",
  borderRadius: 8,
  outline: "none",
};

const labelStyle = {
  display: "grid",
  gap: 6,
  fontSize: 14,
  color: "#333",
};
