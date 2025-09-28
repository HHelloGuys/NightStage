// src/components/Header.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const [q, setQ] = useState("");

  const goSearch = () => {
    const keyword = q.trim();
    if (keyword) navigate(`/category?q=${encodeURIComponent(keyword)}`);
    else navigate("/category");
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
      <div style={{ fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", flex: "1" }}>
        ☰
      </div>

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

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1", justifyContent: "flex-end" }}>
        <input
          type="text"
          placeholder="어떤 공간을 찾으시나요?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); goSearch(); } }}
          style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", borderRadius: "20px", width: "200px" }}
        />
        {!isLoginPage && (
          <button
            onClick={() => navigate("/login")}
            style={{ padding: "0.5rem 1rem", border: "none", backgroundColor: "#eee", borderRadius: "20px", cursor: "pointer" }}
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
