// src/api.js
import axios from "axios";

// 개발 환경: 백엔드(local:4000)로 직통
const api = axios.create({ baseURL: "http://localhost:4000/api" });

export default api;
