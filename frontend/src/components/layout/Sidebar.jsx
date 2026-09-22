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
  Files,
} from "lucide-react";

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  {
    section: "MAIN",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin/dashboard",
      },
      {
        name: "Projects",
        icon: FolderKanban,
        path: "/admin/projects",
      },
      {
        name: "Site Progress",
        icon: Map,
        path: "/admin/site-progress",
      },
    ],
  },

  {
    section: "MANAGEMENT",
    items: [
      {
        name: "Resources",
        icon: HardHat,
        path: "/admin/resources",
      },
      {
        name: "Inventory",
        icon: Package,
        path: "/admin/inventory",
      },
      {
        name: "Workforce",
        icon: Users,
        path: "/admin/workforce",
      },
      {
        name: "Procurement",
        icon: ShoppingCart,
        path: "/admin/procurement",
      },
      {
        name: "Documents",
        icon: Files,
        path: "/admin/documents",
      },
    ],
  },

  {
    section: "INSIGHTS",
    items: [
      {
        name: "Reports",
        icon: FileBarChart,
        path: "/admin/reports",
      },
      {
        name: "Analytics",
        icon: ChartNoAxesCombined,
        path: "/admin/analytics",
      },
      {
        name: "Notifications",
        icon: Bell,
        path: "/admin/notifications",
      },
    ],
  },

  {
    section: "SYSTEM",
    items: [
      {
        name: "Settings",
        icon: Settings,
        path: "/admin/settings",
      },
    ],
  },
];

function Sidebar({
  collapsed = false,
  drawerOpen = false,
  onClose = () => {},
  menu = menuItems,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, onClose]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const sidebarClass = [
    "sidebar",
    collapsed ? "collapsed" : "",
    drawerOpen ? "drawer-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {drawerOpen && (
        <div
          className="sidebar-overlay show"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClass} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-mark" aria-hidden="true">
            <HardHat size={20} strokeWidth={2} />
          </span>
          <div className="sidebar-logo-text">
            <h2>BUILDTRACK</h2>
            <span>PROJECT MANAGEMENT</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menu.map((group) => (
            <div className="menu-group" key={group.section}>
              <p className="menu-title">{group.section}</p>

              {group.items.map((item) => {
                const Icon = item.icon;

                // Current active page check
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.name}
                    className={`menu-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => handleSelect(item.path)}
                    data-label={item.name}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export { menuItems as adminMenu };

export default Sidebar;