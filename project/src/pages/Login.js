// src/pages/Login.js
import React, { useState, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const KAKAO_CLIENT_ID = process.env.REACT_APP_KAKAO_CLIENT_ID;
  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const KAKAO_REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
  const NAVER_REDIRECT_URI = process.env.REACT_APP_NAVER_REDIRECT_URI;

  const onClickKakao = () => {
    const params = new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: "code",
    });
    window.location.assign(`https://kauth.kakao.com/oauth/authorize?${params.toString()}`);
  };

  const onClickNaver = () => {
    const state = `${Date.now()}_naver`;
    sessionStorage.setItem("naver_oauth_state", state);

    const params = new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      redirect_uri: NAVER_REDIRECT_URI,
      response_type: "code",
      state,
    });
    window.location.assign(`https://nid.naver.com/oauth2.0/authorize?${params.toString()}`);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("이메일과 비밀번호를 입력해주세요.");
      }

      await login(email, password);
      
      if (rememberMe) {
        // 브라우저 저장 기능은 선택사항
        sessionStorage.setItem("ns_email", email);
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
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
          <div style={btnStyle} onClick={onClickNaver}>
            <img src="/naver_logo.png" alt="네이버" style={iconStyle} />
            <span>네이버로 로그인</span>
          </div>

          {/* 카카오 로그인 */}
          <div style={btnStyle} onClick={onClickKakao}>
            <img src="/kakao_logo.png" alt="카카오" style={iconStyle} />
            <span>카카오로 로그인</span>
          </div>

          <div style={{ margin: "1.5rem 0", color: "#888" }}>또는</div>

          <form onSubmit={handleEmailLogin}>
            <input 
              type="email" 
              placeholder="이메일" 
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input 
              type="password" 
              placeholder="비밀번호" 
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {error && (
              <div style={{ color: "red", fontSize: "0.85rem", marginBottom: "0.8rem" }}>
                {error}
              </div>
            )}

            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "0.8rem", marginBottom: "1rem"
            }}>
              <label>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> 로그인 기억하기
              </label>
              <Link to="/forgot-password" style={{ color: "#666", fontSize: "0.85rem" }}>
                비밀번호 찾기
              </Link>
            </div>

            <button 
              type="submit"
              style={{
                backgroundColor: loading ? "#ccc" : "#facc15", 
                border: "none", 
                padding: "0.7rem",
                borderRadius: "4px", 
                width: "100%", 
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer"
              }}
              disabled={loading}
            >
              {loading ? "로그인 중..." : "이메일로 로그인"}
            </button>
          </form>

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