// src/pages/NaverCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // baseURL: http://localhost:3000/api

export default function NaverCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        alert(`네이버 로그인 실패: ${error}`);
        navigate("/login", { replace: true });
        return;
      }
      // state 검증 (직전에 저장한 값과 일치해야 함)
      const expected = sessionStorage.getItem("naver_oauth_state");
      if (!state || state !== expected) {
        alert("네이버 state 검증 실패");
        navigate("/login", { replace: true });
        return;
      }
      if (!code) {
        alert("네이버 로그인 코드가 없습니다.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 백엔드에서 code → access_token 교환 & 사용자 정보 확인
        const res = await api.post("/auth/naver", {
          code,
          state,
          redirectUri: process.env.REACT_APP_NAVER_REDIRECT_URI,
        });

        const token = res?.data?.token;
        if (token) {
          localStorage.setItem("auth_token", token);
          if (res.data.user) {
            localStorage.setItem("auth_user", JSON.stringify(res.data.user));
          }
          navigate("/", { replace: true });
        } else {
          throw new Error("서버 토큰이 없습니다.");
        }
      } catch (e) {
        console.error("Naver callback error:", e);
        alert("네이버 로그인 처리 중 오류가 발생했습니다.");
        navigate("/login", { replace: true });
      }
    };
    run();
  }, [navigate]);

  return <div style={{ padding: "2rem" }}>네이버 로그인 처리 중…</div>;
}
