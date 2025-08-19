// src/pages/VenueDetail.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function VenueDetail() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [activeTab, setActiveTab] = useState("공간소개");

  useEffect(() => {
    const mockVenue = {
      id,
      name: "리엠아트센터",
      image: "/mock/detail.jpg", // public 폴더에 위치
      description: "200평 규모의 두 개의 홀과 라운지를 겸비한 공간",
      address: "서울 강남구 도산대로 123",
      lat: 37.517236,
      lng: 127.047325,
    };

    setTimeout(() => setVenue(mockVenue), 800);
  }, [id]);

  const loadMap = useCallback(() => {
    if (window.kakao && window.kakao.maps && venue) {
      const container = document.getElementById("map");
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(venue.lat, venue.lng),
        level: 3,
      };
      new window.kakao.maps.Map(container, options);
    }
  }, [venue]);

  useEffect(() => {
    if (activeTab === "시설안내" && window.kakao && window.kakao.maps) {
      window.kakao.maps.load(loadMap);
    }
  }, [activeTab, loadMap]);

  if (!venue) return <div style={{ padding: "2rem" }}>로딩 중...</div>;

  return (
    <>
      <Header />
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ flex: 2 }}>
            <img
              src={venue.image}
              alt={venue.name}
              style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "8px" }}
            />
            <h2 style={{ marginTop: "1rem" }}>{venue.description}</h2>

            <div style={{ display: "flex", borderBottom: "1px solid #eee", marginTop: "2rem" }}>
              {["공간소개", "시설안내", "이용규칙", "환불정책", "Q&A", "후기"].map(tab => (
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
                <div>
                  강남의 중심지에 위치해있는 리엠아트센터는 A HALL, B HALL, LOUNGE 로 이루어져있는 복합문화공간입니다.
                  최상의 스피커와 악기가 셋팅 되어 있으며 250회의 이상의 LED쇼+콘서트 무대셋팅도 실제로 모든 이벤트가 가능한 공간입니다.
                </div>
              )}
              {activeTab === "시설안내" && (
                <div id="map" style={{ width: "100%", height: "400px" }}></div>
              )}
              {activeTab !== "공간소개" && activeTab !== "시설안내" && (
                <div>{activeTab} 콘텐츠는 준비 중입니다.</div>
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              maxHeight: "520px",
              minWidth: "280px",
            }}
          >
            <strong style={{ borderBottom: "2px solid #8b5cf6", display: "inline-block", paddingBottom: "0.5rem" }}>
              🎟️ 예약하기
            </strong>
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input type="date" style={inputStyle} />
              <select style={inputStyle}>
                <option disabled selected>시작 시간 선택</option>
                {generateTimeOptions("09:00", "22:00", 30).map(time => (
                  <option key={time}>{time}</option>
                ))}
              </select>
              <select style={inputStyle}>
                <option disabled selected>종료 시간 선택</option>
                {generateTimeOptions("09:30", "22:30", 30).map(time => (
                  <option key={time}>{time}</option>
                ))}
              </select>
              <input type="number" placeholder="인원 수" style={inputStyle} />
              <button style={buttonStyle}>예약 확정</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const inputStyle = {
  padding: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  marginTop: "0.5rem",
  padding: "0.75rem",
  background: "#8b5cf6",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold",
};

function generateTimeOptions(start, end, interval) {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  const times = [];

  for (let min = startMinutes; min <= endMinutes; min += interval) {
    const hours = String(Math.floor(min / 60)).padStart(2, "0");
    const minutes = String(min % 60).padStart(2, "0");
    times.push(`${hours}:${minutes}`);
  }

  return times;
}

function parseTimeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export default VenueDetail;
