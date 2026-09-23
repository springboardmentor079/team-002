// Utility for authentication, session user extraction, and role permission checks

export const getCurrentUser = () => {
  try {
    const stored =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.email) return parsed;
    }

    // Auto-detect portal from current URL path if user visited directly
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith("/worker")) {
        return {
          _id: "worker-demo",
          name: "Ramesh Kumar (Worker)",
          email: "worker@buildtrack.com",
          role: "worker",
        };
      }
      if (path.startsWith("/contractor")) {
        return {
          _id: "contractor-demo",
          name: "Master Contractor",
          email: "contractor@buildtrack.com",
          role: "contractor",
        };
      }
      if (path.startsWith("/site-engineer")) {
        return {
          _id: "engineer-demo",
          name: "Site Engineer",
          email: "engineer@buildtrack.com",
          role: "site_engineer",
        };
      }
      if (path.startsWith("/project-manager")) {
        return {
          _id: "pm-demo",
          name: "Project Manager",
          email: "pm@buildtrack.com",
          role: "project_manager",
        };
      }
      if (path.startsWith("/client")) {
        return {
          _id: "client-demo",
          name: "Skyline Client",
          email: "client@buildtrack.com",
          role: "client",
        };
      }
    }

    return {
      _id: "admin-demo",
      name: "Admin Administrator",
      email: "admin@buildtrack.com",
      role: "admin",
    };
  } catch {
    return {
      _id: "admin-demo",
      name: "Admin Administrator",
      email: "admin@buildtrack.com",
      role: "admin",
    };
  }
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || "admin";
};

export const hasRole = (...allowedRoles) => {
  const currentRole = getUserRole();
  return currentRole === "admin" || allowedRoles.includes(currentRole);
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
      return role === "project_manager" || role === "admin" || role === "site_engineer";

    case "site_progress":
    case "daily_reports":
    case "inspections":
    case "delays":
    case "equipment":
      return role === "site_engineer" || role === "project_manager" || role === "admin";

    case "work_orders":
    case "material_requests":
      return role === "contractor" || role === "project_manager" || role === "admin";

    case "attendance":
      return role === "contractor" || role === "worker" || role === "admin";

    case "milestones":
      return role === "site_engineer" || role === "client" || role === "project_manager" || role === "admin";

    case "payments":
      return role === "client" || role === "project_manager" || role === "admin";

    case "worker_tasks":
    case "clock_in":
    case "wages":
      return role === "worker" || role === "admin";

    default:
      return true;
  }
};
