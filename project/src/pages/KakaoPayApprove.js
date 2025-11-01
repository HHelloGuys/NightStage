// src/pages/KakaoPayApprove.js
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function KakaoPayApprove() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("결제 승인 중...");

  useEffect(() => {
    (async () => {
      try {
        const pg_token = params.get("pg_token");
        if (!pg_token) {
          setMsg("pg_token이 없습니다.");
          return;
        }
        const { data } = await api.get("/pay/kakao/approve", { params: { pg_token } });
        if (data?.ok) {
          setMsg("결제가 완료되었습니다. 감사합니다!");
          // TODO: 필요 시 주문완료 페이지로 이동
          setTimeout(() => navigate("/"), 1500);
        } else {
          setMsg("결제 승인 실패");
        }
      } catch (e) {
        console.error(e);
        setMsg("결제 승인 오류");
      }
    })();
  }, [params, navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>{msg}</h2>
    </div>
  );
}
