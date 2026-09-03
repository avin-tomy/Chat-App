import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { connectSocket, disconnectSocket } from "../socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        connectSocket();
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    return () => disconnectSocket();
  }, []);

  async function signup(username, password) {
    const res = await api.post("/auth/signup", { username, password });
    setUser(res.data);
    connectSocket();
  }

  async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    setUser(res.data);
    connectSocket();
  }

  async function logout() {
    await api.post("/auth/logout");
    disconnectSocket();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
