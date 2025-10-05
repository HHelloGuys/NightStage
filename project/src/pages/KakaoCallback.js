// src/pages/KakaoCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      // 백엔드 없이: code가 오면 모의 토큰 저장
      if (code) {
        localStorage.setItem(
          "auth_state",
          JSON.stringify({ accessToken: "mock-kakao-" + code, user: { provider: "kakao" } })
        );
      }
    } catch {}
    navigate("/", { replace: true });
  }, [navigate]);

  return <div style={{ padding: "2rem" }}>카카오 로그인 처리 중…</div>;
}
