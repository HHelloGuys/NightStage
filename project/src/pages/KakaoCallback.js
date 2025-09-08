// src/pages/KakaoCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // baseURL: http://localhost:4000/api

export default function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) {
        alert(`카카오 로그인 실패: ${error}`);
        navigate("/login", { replace: true });
        return;
      }
      if (!code) {
        alert("카카오 로그인 코드가 없습니다.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 백엔드에서 code → access_token 교환 & 사용자 정보 확인
        // 예시 엔드포인트는 필요에 맞게 수정 (/auth/kakao 등)
        const res = await api.post("/auth/kakao", {
          code,
          redirectUri: process.env.REACT_APP_KAKAO_REDIRECT_URI,
        });

        // res.data 안에 우리 서버의 세션 토큰(예: JWT) 있다고 가정
        const token = res?.data?.token;
        if (token) {
          localStorage.setItem("auth_token", token);
          // (옵션) 사용자 정보 캐시
          if (res.data.user) {
            localStorage.setItem("auth_user", JSON.stringify(res.data.user));
          }
          navigate("/", { replace: true });
        } else {
          throw new Error("서버 토큰이 없습니다.");
        }
      } catch (e) {
        console.error("Kakao callback error:", e);
        alert("카카오 로그인 처리 중 오류가 발생했습니다.");
        navigate("/login", { replace: true });
      }
    };
    run();
  }, [navigate]);

  return <div style={{ padding: "2rem" }}>카카오 로그인 처리 중…</div>;
}
