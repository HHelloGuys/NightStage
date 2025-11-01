// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";

import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import VenueDetail from "./pages/VenueDetail";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import KakaoCallback from "./pages/KakaoCallback";
import NaverCallback from "./pages/NaverCallback";
import ArtistList from "./pages/ArtistList";

import KakaoPayApprove from "./pages/KakaoPayApprove"; // ✅ 추가

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<ArtistList />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/venue/:id" element={<VenueDetail />} />

          {/* 결제 결과 라우트 (신규) */}
          <Route path="/pay/kakao/approve" element={<KakaoPayApprove />} />
          <Route path="/pay/kakao/cancel" element={<div style={{ padding: 24 }}>결제가 취소되었습니다.</div>} />
          <Route path="/pay/kakao/fail" element={<div style={{ padding: 24 }}>결제에 실패했습니다.</div>} />

          {/* 계정/콜백 (그대로 유지) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/kakao" element={<KakaoCallback />} />
          <Route path="/auth/naver" element={<NaverCallback />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
