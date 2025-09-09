// src/hooks/useReviews.js
import { useCallback, useEffect, useState } from "react";

// public 경로 보정(PUBLIC_URL 접두) + 외부 URL은 그대로 사용
const toPublic = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return (process.env.PUBLIC_URL || "") + p;
};

const toReviewShape = (r = {}) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  image: toPublic(r.image),
  tags: Array.isArray(r.tags) ? r.tags : [],
});

export default function useReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    try {
      // 나중에 백엔드가 준비되면 /api/reviews 로 교체
      const res = await fetch("/mock/reviews.json", { cache: "no-store" });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setItems((Array.isArray(data) ? data : []).map(toReviewShape));
    } catch (e) {
      console.error("reviews fetch failed:", e);
      setItems([]);
      setErrMsg("후기를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { items, loading, errMsg, refresh };
}
