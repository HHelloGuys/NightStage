// src/pages/NaverCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NaverCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        localStorage.setItem(
          "auth_state",
          JSON.stringify({ accessToken: "mock-naver-" + code, user: { provider: "naver" } })
        );
      }
    } catch {}
    navigate("/", { replace: true });
  }, [navigate]);

  return <div style={{ padding: "2rem" }}>네이버 로그인 처리 중…</div>;
}
