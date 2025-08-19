import React from "react";
import Header from "../components/Header";
import IconFilters from "../components/IconFilters";
import VenueCard from "../components/VenueCard";
import ReviewCard from "../components/ReviewCard";
import Footer from "../components/Footer";

const mockVenues = [
  {
    id: "venue1",
    name: "대관의자체지",
    image: "/mock/venue1.jpg",
    address: "서울 강남구 대로 123",
    price: 17000
  },
  {
    id: "venue2",
    name: "힙한 셀프촬영 스튜디오",
    image: "/mock/venue2.jpg",
    address: "서울 마포구 연남동",
    price: 15000
  },
  {
    id: "venue3",
    name: "광명동 연습실 대관스튜디오",
    image: "/mock/venue3.jpg",
    address: "경기도 광명시",
    price: 5000
  },
  {
    id: "venue4",
    name: "감성 버스킹홀",
    image: "/mock/venue4.jpg",
    address: "서울 성동구 성수동",
    price: 20000
  },
  {
    id: "venue5",
    name: "댄스연습 특화 스튜디오",
    image: "/mock/venue5.jpg",
    address: "서울 동대문구",
    price: 12000
  },
  {
    id: "venue6",
    name: "인디밴드 전용 연습실",
    image: "/mock/venue6.jpg",
    address: "서울 마포구 합정",
    price: 9000
  }
];

const mockReviews = [
  {
    image: "/mock/review1.jpg",
    title: "누구집 같았지만, 정말 좋았어",
    description: "편하게 연습하고 찍을 수 있었어요!",
    tags: ["분위기좋음", "조용한동네"],
  },
  {
    image: "/mock/review2.jpg",
    title: "편안한 분위기였어요",
    description: "공간도 깔끔해서 마음에 들었습니다.",
    tags: ["연습용", "친절한사장님"],
  },
  {
    image: "/mock/review3.jpg",
    title: "너무 조용해서 연습에 집중했어요",
    description: "피아노 연습에 최적!",
    tags: ["조용함", "장비좋음"],
  },
  {
    image: "/mock/review4.jpg",
    title: "예상보다 훨씬 좋은 공간!",
    description: "인테리어 감성도 최고!",
    tags: ["인스타감성", "조명좋음"],
  }
];

function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <IconFilters onSelect={(type) => console.log("필터 선택:", type)} />

      {/* 신규 등록 공간 */}
      <section style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>새로 등록됐어요</h2>
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
          {mockVenues.map((venue, i) => (
            <VenueCard key={i} venue={venue} />
          ))}
        </div>
      </section>

      {/* 사용자 후기 */}
      <section style={{ padding: "2rem", flexGrow: 1 }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>방금 올라온 후기에요</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {mockReviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
