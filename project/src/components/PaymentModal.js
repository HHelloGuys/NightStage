// src/components/PaymentModal.js
import React, { useEffect, useRef } from "react";

export default function PaymentModal({ open, item, onClose }) {
  const scriptLoadedRef = useRef(false);

  // 결제 스크립트 (예: Toss/포트원 등) 한 번만 로드
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    // 필요 시 외부 스크립트 로드 (예시는 주석)
    // const s = document.createElement("script");
    // s.src = "https://example-payments-cdn.js";
    // s.async = true;
    // s.onload = () => { scriptLoadedRef.current = true; };
    // document.body.appendChild(s);

    scriptLoadedRef.current = true; // 데모용
  }, []);

  // 모달 열릴 때 포커스 등 사이드 이펙트 (Hook은 항상 호출, 내부 가드만)
  useEffect(() => {
    if (!open) return;
    // 열릴 때 스크롤 잠그기 (선택)
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePay = async () => {
    if (!item) return;
    // TODO: 여기에서 실제 PG 결제창 호출 코드 작성
    // 예) tossPayments.requestPayment({...}) / PortOne.requestPayment({...})
    alert(
      `결제를 시도합니다.\n\n상품: ${item?.name}\n금액: ${Number(
        item?.price || 0
      ).toLocaleString()}원\n날짜: ${item?.meta?.date}\n시간: ${item?.meta?.startTime} ~ ${item?.meta?.endTime}\n인원: ${item?.meta?.people}`
    );
    // 결제 성공/실패 결과 후 onClose() 호출
    onClose?.();
  };

  if (!open) return null;

  const price = Number(item?.price || 0);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>결제</h3>
          <button onClick={onClose} style={closeBtnStyle} aria-label="close">
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
          {item?.image ? (
            <img
              src={item.image}
              alt={item?.name || "item"}
              style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
            />
          ) : null}

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{item?.name || "상품"}</div>
            <div style={{ color: "#666", marginTop: 4, fontSize: 14 }}>
              {item?.meta?.date} · {item?.meta?.startTime}~{item?.meta?.endTime} · 인원 {item?.meta?.people}명
            </div>
            <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
              ₩{price.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12, fontSize: 14, color: "#666" }}>
          아래 버튼을 누르면 결제사 창이 이 화면 위에 열립니다.
        </div>

        <button onClick={handlePay} style={payBtnStyle}>
          결제하기
        </button>
      </div>
    </div>
  );
}

/* ---- styles ---- */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
};

const modalStyle = {
  width: "min(560px, 92vw)",
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
};

const closeBtnStyle = {
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
  lineHeight: 1,
};

const payBtnStyle = {
  marginTop: 16,
  width: "100%",
  padding: "0.9rem 1rem",
  borderRadius: 10,
  border: "1px solid #8b5cf6",
  background: "#8b5cf6",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};
