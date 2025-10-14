// src/components/Header.js
import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useContext(AuthContext);
  const isLoginPage = location.pathname === "/login";

  const [q, setQ] = useState("");

  const goSearch = () => {
    const keyword = q.trim();
    if (keyword) navigate(`/category?q=${encodeURIComponent(keyword)}`);
    else navigate("/category");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem 2rem",
      borderBottom: "1px solid #eee",
      position: "relative"
    }}>
      {/* ✅ 메뉴 */}
      <div
        onClick={() => navigate("/artists")}
        style={{ fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", flex: "1" }}
      >
        ☰
      </div>

      {/* ✅ 로고 */}
      <div
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "1.8rem",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        NightStage
      </div>

      {/* ✅ 검색, 로그인/로그아웃 */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1", justifyContent: "flex-end" }}>
        <input
          type="text"
          placeholder="어떤 공간을 찾으시나요?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); goSearch(); } }}
          style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", borderRadius: "20px", width: "200px" }}
        />

        {loading ? (
          <span style={{ fontSize: "0.9rem", color: "#666" }}>로딩 중...</span>
        ) : user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#333" }}>
              {user.name}님
            </span>
            <button
              onClick={handleLogout}
              style={{ 
                padding: "0.5rem 1rem", 
                border: "none", 
                backgroundColor: "#ff6b6b", 
                color: "white",
                borderRadius: "20px", 
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          !isLoginPage && (
            <button
              onClick={() => navigate("/login")}
              style={{ 
                padding: "0.5rem 1rem", 
                border: "none", 
                backgroundColor: "#eee", 
                borderRadius: "20px", 
                cursor: "pointer" 
              }}
            >
              로그인
            </button>
          )
        )}
      </div>
    </header>
  );
}

export default Header;