import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Automatically token send
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Detect role to ensure unauthenticated sessions route to correct demo context
  try {
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    let role = "admin";
    if (stored) {
      role = JSON.parse(stored).role || "admin";
    } else if (typeof window !== "undefined") {
      const p = window.location.pathname.toLowerCase();
      if (p.startsWith("/worker")) role = "worker";
      else if (p.startsWith("/contractor")) role = "contractor";
      else if (p.startsWith("/site-engineer")) role = "site_engineer";
      else if (p.startsWith("/project-manager")) role = "project_manager";
      else if (p.startsWith("/client")) role = "client";
    }
    config.headers["x-user-role"] = role;
  } catch (e) {
    config.headers["x-user-role"] = "admin";
  }

  return config;
});

export default api;