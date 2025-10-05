// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import VenueDetail from "./pages/VenueDetail";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import KakaoCallback from "./pages/KakaoCallback";
import NaverCallback from "./pages/NaverCallback";
import ArtistList from "./pages/ArtistList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<Home />} />
        <Route path="/artists" element={<ArtistList />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/venue/:id" element={<VenueDetail />} />

        {/* 계정/콜백 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/kakao" element={<KakaoCallback />} />
        <Route path="/auth/naver" element={<NaverCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
