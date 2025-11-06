// src/components/PaymentModal.js
import React, { useEffect } from "react";
import api from "../api";

export default function PaymentModal({ open, onClose, item }) {
  // item: { stageId, stageName, totalPrice, unitPrice, image, reservation: { date, startTime, endTime, people } }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handlePay = async () => {
    try {
      const payload = {
        orderId: `NSTG-${Date.now()}`,
        itemName: item?.stageName || "NightStage 공연장 예약",
        quantity: 1,
        totalAmount: item?.totalPrice ?? 1000,
        // ✅ .env 파일에서 설정한 redirect URL
        approvalUrl: process.env.REACT_APP_KAKAO_PAY_APPROVAL_URL,
        cancelUrl: process.env.REACT_APP_KAKAO_PAY_CANCEL_URL,
        failUrl: process.env.REACT_APP_KAKAO_PAY_FAIL_URL,
      };

      console.log("📦 결제 요청 payload:", payload);

      const { data } = await api.post("/pay/kakao/ready", payload);

      // ✅ 백엔드 ApiResponse 구조에 맞게 data.data로 접근
      const redirectUrl =
        data?.data?.next_redirect_pc_url || data?.next_redirect_pc_url;

      if (redirectUrl) {
        console.log("➡️ 결제창 이동:", redirectUrl);
        window.location.href = redirectUrl; // 카카오 결제창으로 이동
      } else {
        console.error("결제 준비 실패 응답:", data);
        alert("결제 준비에 실패했습니다. 응답 데이터 확인 필요.");
      }
    } catch (e) {
      console.error("❌ 결제 준비 중 오류:", e);
      alert("결제 준비 중 오류가 발생했습니다.");
    }
  };

  if (!open || !item) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>결제 확인</h3>

        <img
          src={item.image}
          alt={item.stageName}
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
            marginBottom: 12,
          }}
        />

        <p><strong>공연장:</strong> {item.stageName}</p>
        <p><strong>날짜:</strong> {item.reservation?.date}</p>
        <p>
          <strong>시간:</strong>{" "}
          {item.reservation?.startTime} ~ {item.reservation?.endTime}
        </p>
        <p><strong>인원:</strong> {item.reservation?.people}명</p>
        <p>
          <strong>결제 금액:</strong>{" "}
          {item.totalPrice
            ? `₩${item.totalPrice.toLocaleString()}`
            : "정보 없음"}
        </p>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onClose} style={styles.buttonCancel}>
            닫기
          </button>
          <button onClick={handlePay} style={styles.buttonPay}>
            💳 카카오페이 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "min(500px, 92vw)",
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  buttonCancel: {
    background: "#e5e7eb",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
  buttonPay: {
    background: "#fdd835",
    border: "none",
    borderRadius: 8,
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontWeight: 600,
  },
};
