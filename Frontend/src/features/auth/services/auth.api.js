import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  timeout: 120000,
});

export async function register(payload) {
  return (await api.post("/api/auth/register", payload)).data;
}
export async function login(payload) {
  return (await api.post("/api/auth/login", payload)).data;
}
export async function logout() {
  return (await api.post("/api/auth/logout")).data;
}
export async function getMe() {
  return (await api.get("/api/auth/get-me")).data;
}
