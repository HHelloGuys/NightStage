// src/components/Header.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem 2rem",
      borderBottom: "1px solid #eee",
      position: "relative"
    }}>
      {/* ☰ 햄버거 */}
      <div style={{
        fontSize: "1.5rem",
        fontWeight: "bold",
        cursor: "pointer",
        flex: "1"
      }}>
        ☰
      </div>

      {/* 로고 (중앙 정렬을 위한 absolute + 50%) */}
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

      {/* 오른쪽 영역: 검색창 + 로그인 버튼 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flex: "1",
        justifyContent: "flex-end"
      }}>
        <input
          type="text"
          placeholder="어떤 공간을 찾으시나요?"
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #ccc",
            borderRadius: "20px",
            width: "200px"
          }}
        />
        {!isLoginPage && (
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
        )}
      </div>
    </header>
  );
}

export default Header;
