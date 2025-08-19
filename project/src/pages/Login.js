import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div>
      <Header />

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",  // Header/Footer 공간 제외
        backgroundColor: "#f8f8f8"
      }}>
        <div style={{
          width: "400px",
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: "1.5rem" }}>게스트 로그인</h2>

          {/* 네이버 로그인 */}
          <div style={btnStyle}>
            <img src="/naver_logo.png" alt="네이버" style={iconStyle} />
            <span>네이버로 로그인</span>
          </div>

          {/* 카카오 로그인 */}
          <div style={btnStyle}>
            <img src="/kakao_logo.png" alt="카카오" style={iconStyle} />
            <span>카카오로 로그인</span>
          </div>

          <div style={{ margin: "1.5rem 0", color: "#888" }}>또는</div>

          <input type="email" placeholder="이메일" style={inputStyle} />
          <input type="password" placeholder="비밀번호" style={inputStyle} />

          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: "0.8rem", marginBottom: "1rem"
          }}>
            <label>
              <input type="checkbox" /> 로그인 기억하기
            </label>
            <Link to="/forgot-password" style={{ color: "#666", fontSize: "0.85rem" }}>
              비밀번호 찾기
            </Link>
          </div>

          <button style={{
            backgroundColor: "#facc15", border: "none", padding: "0.7rem",
            borderRadius: "4px", width: "100%", fontWeight: "bold"
          }}>
            이메일로 로그인
          </button>

          <div style={{ fontSize: "0.85rem", marginTop: "1rem", color: "#666" }}>
            아직 NightStage 회원이 아니신가요?{" "}
            <Link to="/SignUp" style={{ fontWeight: "bold", textDecoration: "underline" }}>
              회원가입
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const btnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "0.5rem",
  marginBottom: "0.8rem",
  cursor: "pointer"
};

const iconStyle = {
  width: "20px",
  height: "20px"
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  marginBottom: "0.8rem",
  borderRadius: "4px",
  border: "1px solid #ccc"
};

export default Login;
