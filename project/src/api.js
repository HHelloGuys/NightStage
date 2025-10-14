// src/api.js
import axios from "axios";

// 백엔드는 4000 포트
const api = axios.create({ 
  baseURL: "http://localhost:4000/api",
  withCredentials: true // ★ 쿠키/세션 자동 포함 (필수!)
});

export default api;