// Utility for authentication, session user extraction, and role permission checks

export const getCurrentUser = () => {
  try {
    const stored =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
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
