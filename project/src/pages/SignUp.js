// src/pages/SignUp.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";

function SignUp() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirm || !phone) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, phone);
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
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
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="tel"
            placeholder="전화번호 (선택사항)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
            disabled={loading}
          />

          {error && (
            <div style={{ 
              color: "red", 
              fontSize: "0.85rem", 
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...buttonStyle,
              backgroundColor: loading ? "#999" : "#4B3EFF",
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
          >
            {loading ? "가입 중..." : "회원가입 완료"}
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
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold"
};

export default SignUp;