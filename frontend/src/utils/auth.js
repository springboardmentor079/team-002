import { useEffect, useState } from "react";
import API from "../services/api";

// Utility for authentication, session user extraction, and role permission checks

// Fired whenever the stored user changes so headers/sidebars can re-render
// immediately after a profile update (no logout/login required).
export const USER_UPDATED_EVENT = "buildtrack:user-updated";

// The JWT lives in localStorage for "remember me" sessions and in
// sessionStorage otherwise. Both are read here so every caller agrees on
// whether a session exists.
export const getStoredToken = () => {
  try {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || ""
    );
  } catch {
    return "";
  }
};

export const hasStoredSession = () => Boolean(getStoredToken());

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

// A login/register payload is only a complete user record when the server sent
// the public profile shape, which always carries a `profileImage` string.
// Anything else is treated as a partial identity record that still has to be
// refreshed from GET /auth/profile.
const isCompleteUserPayload = (user) =>
  Boolean(user) && typeof user.profileImage === "string";

// Shared between the app boot sync and the login flow so a single page load
// never fires the same request twice (React StrictMode double-invokes effects).
let inFlightProfileRequest = null;

const requestUserProfile = () => {
  if (!inFlightProfileRequest) {
    inFlightProfileRequest = API.get("/auth/profile")
      .then((response) => response.data?.user || null)
      .finally(() => {
        inFlightProfileRequest = null;
      });
  }

  return inFlightProfileRequest;
};

// Pull the authenticated user's authoritative record (name, email, role and
// `profileImage`) from the backend and publish it to the global user state.
// This is the single place that turns a stored token into a complete user, so
// the avatar is never left waiting on the settings screen.
//
// Best effort by design: a failed request resolves to null instead of
// throwing, because it must never block login or break an already working app.
export const fetchCurrentUserProfile = async () => {
  if (!hasStoredSession()) return null;

  try {
    const user = await requestUserProfile();

    if (user) setCurrentUser(user);

    return user;
  } catch {
    return null;
  }
};

// Called right after a successful login/register. The token is already in
// storage, so the axios interceptor attaches it and the profile request is
// authenticated. Returns the user that should drive the redirect.
export const syncUserProfile = async (authUser) => {
  // Publish what the login response gave us straight away so the dashboard
  // never renders a blank header, even if the profile call is slow.
  if (authUser) setCurrentUser(authUser);

  if (isCompleteUserPayload(authUser)) return authUser;

  return (await fetchCurrentUserProfile()) || authUser || null;
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

    // Maintenance: managers plan and reschedule, workers and
    // contractors may only progress a job assigned to them
    case "maintenance":
      return role === "project_manager" || role === "site_engineer";

    case "maintenance_delete":
      return role === "project_manager";

    case "maintenance_status":
      return (
        role === "contractor" ||
        role === "worker" ||
        role === "project_manager" ||
        role === "site_engineer"
      );

    // Payroll: an admin or project manager raises and edits the
    // runs. A worker can read their own payslips but must never be
    // able to write one, so they are absent here - the API rejects
    // a worker write anyway.
    case "payroll":
      return role === "project_manager";

    // Cancellation is kept for the audit trail, so removing a run
    // outright is admin only.
    case "payroll_delete":
      return false;

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
