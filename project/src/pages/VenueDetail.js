import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios"; // 또는 api 인스턴스 쓰면 교체

function VenueDetail() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [activeTab, setActiveTab] = useState("공간소개");

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/stages/${id}`)
      .then((res) => setVenue(res?.data?.data ?? res?.data))
      .catch((err) => console.error("공연장 불러오기 실패:", err));
  }, [id]);

  const hasCoords =
    venue && Number.isFinite(venue.lat) && Number.isFinite(venue.lng);

  const loadMap = useCallback(() => {
    if (!hasCoords) return;
    if (window.kakao?.maps) {
      const container = document.getElementById("map");
      if (!container) return;
      const options = {
        center: new window.kakao.maps.LatLng(venue.lat, venue.lng),
        level: 3,
      };
      new window.kakao.maps.Map(container, options);
    }
  }, [venue, hasCoords]);

  useEffect(() => {
    if (activeTab === "시설안내" && hasCoords && window.kakao?.maps) {
      window.kakao.maps.load(loadMap);
    }
  }, [activeTab, hasCoords, loadMap]);

  if (!venue) return <div style={{ padding: "2rem" }}>로딩 중...</div>;

  const stageName = venue.stageName || "공연장";
  const imageSrc = venue.stagePicture || "/mock/detail.jpg";
  const introduction = venue.stageIntroduction || "";
  const facility = venue.stageFacility || "";
  const rules = venue.stageNotice || "";
  const refund = venue.refundPolicy || "";
  const location = venue.location || "";
  const capacity = venue.capacity;
  const price = venue.price;
  const rating = venue.stageRating;
  const openHours = venue.openHours || "";
  const contact = venue.contactInfo || "";

  return (
    <>
      <Header />
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ flex: 2 }}>
            <img
              src={imageSrc}
              alt={stageName}
              style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 8 }}
              loading="lazy"
              decoding="async"
            />
            <h2 style={{ marginTop: "1rem" }}>{stageName}</h2>
            <p style={{ color: "#666", marginTop: 4 }}>
              {location}
              {capacity != null ? ` · ${capacity}석` : ""}
              {price != null ? ` · ₩${Number(price).toLocaleString()}` : ""}
              {rating != null ? ` · ★ ${rating}` : ""}
            </p>
            {openHours && <p style={{ color: "#666" }}>⏰ {openHours}</p>}
            {contact && <p style={{ color: "#666" }}>☎️ {contact}</p>}

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
              {activeTab === "후기" && <div>후기 콘텐츠는 준비 중입니다. (리뷰 API 연결 시 표시)</div>}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "1rem",
              maxHeight: 520,
              minWidth: 280,
            }}
          >
            <strong
              style={{
                borderBottom: "2px solid #8b5cf6",
                display: "inline-block",
                paddingBottom: "0.5rem",
              }}
            >
              🎟️ 예약하기
            </strong>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VenueDetail; // ⬅️ 이 줄이 반드시 있어야 함
