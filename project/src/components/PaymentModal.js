// src/components/PaymentModal.js
import React, { useEffect } from "react";
import api from "../api";

export default function PaymentModal({ open, onClose, order }) {
  // order: { orderId, itemName, quantity, totalAmount }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handlePay = async () => {
    try {
      const payload = {
        orderId: order?.orderId || Date.now(),
        itemName: order?.itemName || "NightStage 예약",
        quantity: order?.quantity || 1,
        totalAmount: order?.totalAmount || 1000,
        approvalUrl: process.env.REACT_APP_KAKAO_PAY_APPROVAL_URL,
        cancelUrl: process.env.REACT_APP_KAKAO_PAY_CANCEL_URL,
        failUrl: process.env.REACT_APP_KAKAO_PAY_FAIL_URL,
      };

      const { data } = await api.post("/pay/kakao/ready", payload);
      if (data?.ok && data?.next_redirect_pc_url) {
        window.location.href = data.next_redirect_pc_url; // 카카오 결제창 이동
      } else {
        alert("결제 준비에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("결제 준비 중 오류가 발생했습니다.");
    }
  };

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>결제</h3>
        <p>주문상품: {order?.itemName || "NightStage 예약"}</p>
        <p>금액: {(order?.totalAmount ?? 1000).toLocaleString()}원</p>
        <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose}>닫기</button>
          <button onClick={handlePay}>카카오페이 결제하기</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "min(520px, 92vw)",
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
};
