import { useEffect, useState } from "react";

// Utility for authentication, session user extraction, and role permission checks

// Fired whenever the stored user changes so headers/sidebars can re-render
// immediately after a profile update (no logout/login required).
export const USER_UPDATED_EVENT = "buildtrack:user-updated";

export const getCurrentUser = () => {
  try {
    const stored =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Persist the authenticated user and notify listeners. Called after login and
// after any profile update.
export const setCurrentUser = (user) => {
  if (!user) return;

  try {
    const serialized = JSON.stringify(user);
    localStorage.setItem("user", serialized);
    sessionStorage.setItem("user", serialized);
  } catch {
    // Ignore storage failures (private mode / quota)
  }

  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
};

// React hook: returns the current user and re-renders when it changes.
export const useCurrentUser = () => {
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());

    // Keep tabs in sync
    window.addEventListener(USER_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
};

// Profile photos are stored as server-relative paths (e.g.
// /uploads/avatars/x.png). Resolving them in one place keeps the header and
// the profile screen showing the same picture.
export const resolveProfileImageUrl = (src) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;

  const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");
  return `${base}${src}`;
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || "client";
};

export const hasRole = (...allowedRoles) => {
  const currentRole = getUserRole();
  return allowedRoles.includes(currentRole);
};

// Check if current user has write / edit permission for a given module
export const canEdit = (module) => {
  const role = getUserRole();

  // Admin has full read/write access across all modules
  if (role === "admin") return true;

  switch (module) {
    case "projects":
      return role === "project_manager";

    case "resources":
    case "inventory":
    case "workforce":
    case "procurement":
    case "reports":
      return role === "project_manager";

    case "site_progress":
    case "daily_reports":
    case "inspections":
    case "delays":
    case "equipment":
      return role === "site_engineer" || role === "project_manager";

    case "work_orders":
    case "material_requests":
      return role === "contractor" || role === "project_manager";

    case "attendance":
      return role === "contractor" || role === "worker";

    case "milestones":
      // Site engineer can update progress; client can approve
      return role === "site_engineer" || role === "client" || role === "project_manager";

    case "payments":
      return role === "client" || role === "project_manager";

    case "worker_tasks":
    case "clock_in":
      return role === "worker";

    default:
      return false;
  }
};
