// src/pages/SignUp.js
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    console.log("회원가입 정보:", { email, password });
    // 여기에 회원가입 API 호출 추가 가능
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
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            회원가입 완료
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.7rem",
  marginBottom: "1rem",
  border: "1px solid #ccc",
  borderRadius: "4px"
};

const buttonStyle = {
  width: "100%",
  padding: "0.75rem",
  backgroundColor: "#4B3EFF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold"
};

export default SignUp;
