// src/hooks/useVenues.js
import { useCallback, useEffect, useState } from "react";
import api from "../api"; // baseURL: http://localhost:4000/api

// VenueCard가 기대하는 형태로 매핑
const toCardShape = (r = {}) => ({
  id: r.id ?? r.stageId ?? r._id,
  name: r.name ?? r.stageName ?? "공간",
  image: r.image ?? r.stagePicture ?? "",
  address: r.address ?? r.location ?? "",
  price: r.price ?? 0,
});

// env 토글 (백엔드 준비 전에는 모의 데이터 강제 사용)
const USE_MOCK = String(process.env.REACT_APP_USE_MOCK || "").toLowerCase() === "true";

export default function useVenues(initialCategoryId = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const fetchFromBackend = useCallback(async (categoryId = null) => {
    const params = { page: 0, size: 10 };
    if (categoryId != null) params.categoryId = categoryId;

    const res = await api.get("/stages", { params });
    const page = res?.data?.data || res?.data;
    const list = Array.isArray(page?.content) ? page.content : (Array.isArray(page) ? page : []);
    return list.map(toCardShape);
  }, []);

  const fetchFromMock = useCallback(async () => {
    const res = await fetch("/mock/venues.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(toCardShape);
  }, []);

  const refresh = useCallback(async (categoryId = null) => {
    setLoading(true);
    setErrMsg("");
    try {
      let list = [];
      if (USE_MOCK) {
        list = await fetchFromMock();
      } else {
        try {
          list = await fetchFromBackend(categoryId);
        } catch {
          list = await fetchFromMock(); // 백엔드 준비 전 자동 폴백
        }
      }
      setItems(list);
    } catch (e) {
      console.error("venues fetch failed:", e);
      setItems([]);
      setErrMsg("공간 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [fetchFromBackend, fetchFromMock]);

  useEffect(() => {
    refresh(initialCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, errMsg, refresh };
}
