// src/context/AuthContext.js
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 현재 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/auth/me");
        const data = res?.data?.data ?? res?.data;
        if (data && data.userId) {
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("세션 없음:", error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res?.data?.data ?? res?.data;
      if (!data) throw new Error("로그인 실패");
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { 
        name, 
        email, 
        password, 
        phone 
      });
      const data = res?.data?.data ?? res?.data;
      if (!data) throw new Error("회원가입 실패");
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log("로그아웃 실패:", error.message);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    login, 
    register,
    logout 
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}