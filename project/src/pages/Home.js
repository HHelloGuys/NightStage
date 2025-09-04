// src/pages/Home.js
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import IconFilters from "../components/IconFilters";
import VenueCard from "../components/VenueCard";
import Footer from "../components/Footer";
import api from "../api"; // baseURL: http://localhost:4000/api

function Home() {
  const [venues, setVenues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // StageEntity -> VenueCard가 기대하는 형태(id, name, image, address, price)로 변환
  const toCardShape = (r = {}) => ({
    id: r.stageId,
    name: r.stageName,
    image: r.stagePicture || "",   // 없으면 빈 값
    address: r.location || "",
    price: r.price ?? 0,
  });

  const fetchVenues = async (categoryId = null) => {
    setLoading(true);
    setErrMsg("");
    try {
      const params = { page: 0, size: 10 };
      if (categoryId != null) params.categoryId = categoryId;

      const res = await api.get("/stages", { params });
      const page = res?.data?.data;
      const list = Array.isArray(page?.content) ? page.content : [];
      setVenues(list.map(toCardShape)); // 덮어쓰기
      console.log("[/stages] count:", list.length, list);
    } catch (e) {
      console.error("[GET] /stages 실패:", e?.response?.status, e?.response?.data || e.message);
      setVenues([]);
      setErrMsg("공간 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

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
    </div>
  );
}

export default Home;
