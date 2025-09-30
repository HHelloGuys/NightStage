// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VenueDetail from "./pages/VenueDetail";
import CategoryPage from "./pages/CategoryPage";
import KakaoCallback from "./pages/KakaoCallback";
import NaverCallback from "./pages/NaverCallback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/venue/:id" element={<VenueDetail />} />
      {/* ✅ 카테고리는 숫자 ID 파라미터로 */}
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
      <Route path="/auth/naver/callback" element={<NaverCallback />} />
      <Route path="/category" element={<CategoryPage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
    </Routes>
  );
}

