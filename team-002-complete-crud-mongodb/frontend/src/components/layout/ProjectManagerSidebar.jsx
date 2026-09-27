import {
  LayoutDashboard,
  FolderKanban,
  Map,
  HardHat,
  Package,
  Users,
  ShoppingCart,
  FileBarChart,
  ChartNoAxesCombined,
  Bell,
  Settings,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    section: "MAIN",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/project-manager/dashboard",
      },
      {
        name: "Projects",
        icon: FolderKanban,
        path: "/project-manager/projects",
      },
      {
        name: "Site Progress",
        icon: Map,
        path: "/project-manager/site-progress",
      },
    ],
  },

  {
    section: "MANAGEMENT",
    items: [
      {
        name: "Resources",
        icon: HardHat,
        path: "/project-manager/resources",
      },
      {
        name: "Inventory",
        icon: Package,
        path: "/project-manager/inventory",
      },
      {
        name: "Workforce",
        icon: Users,
        path: "/project-manager/workforce",
      },
      {
        name: "Procurement",
        icon: ShoppingCart,
        path: "/project-manager/procurement",
      },
    ],
  },

  {
    section: "INSIGHTS",
    items: [
      {
        name: "Reports",
        icon: FileBarChart,
        path: "/project-manager/reports",
      },
      {
        name: "Analytics",
        icon: ChartNoAxesCombined,
        path: "/project-manager/analytics",
      },
    ],
  },

  {
    section: "SYSTEM",
    items: [
      {
        name: "Notifications",
        icon: Bell,
        path: "/project-manager/notifications",
      },
      {
        name: "Settings",
        icon: Settings,
        path: "/project-manager/settings",
      },
    ],
  },
];

function ProjectManagerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="pm-sidebar">
      <div className="pm-sidebar-logo">
        <h2>BUILDTRACK</h2>
        <span>PROJECT MANAGEMENT</span>
      </div>

      <nav className="pm-sidebar-nav">
        {menuItems.map((group) => (
          <div
            className="pm-menu-group"
            key={group.section}
          >
            <p className="pm-menu-title">
              {group.section}
            </p>

            {group.items.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  className={`pm-menu-item ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon size={18} strokeWidth={1.8} />

                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export { menuItems as projectManagerMenu };

export default ProjectManagerSidebar;