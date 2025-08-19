// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VenueDetail from "./pages/VenueDetail";
import CategoryPage from "./pages/CategoryPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/venue/:id" element={<VenueDetail />} />
      <Route path="/category/:label" element={<CategoryPage />} />
      {/* 추가적인 라우팅은 여기 */}
    </Routes>
  );
}

export default App;
