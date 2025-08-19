// src/pages/ForgotPassword.js
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("비밀번호 찾기 요청 이메일:", email);
    alert("입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다.");
    // 실제 API 연동 시 여기에 요청 추가
  };

  return (
    <div>
      <Header />

      <div style={{
        maxWidth: "400px",
        margin: "3rem auto",
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>비밀번호 찾기</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="가입한 이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.7rem",
              marginBottom: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#4B3EFF",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold"
            }}
          >
            이메일 전송
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default ForgotPassword;
