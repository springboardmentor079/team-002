import {
  LayoutDashboard,
  Map,
  ClipboardCheck,
  Flag,
  TriangleAlert,
  HardHat,
  Truck,
  Bell,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  {
    section: "MAIN",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/site-engineer/dashboard",
      },
      {
        name: "Site Progress",
        icon: Map,
        path: "/site-engineer/site-progress",
      },
      {
        name: "Daily Reports",
        icon: ClipboardCheck,
        path: "/site-engineer/daily-reports",
      },
    ],
  },
  {
    section: "FIELD OPERATIONS",
    items: [
      {
        name: "Milestones",
        icon: Flag,
        path: "/site-engineer/milestones",
      },
      {
        name: "Site Inspections",
        icon: HardHat,
        path: "/site-engineer/inspections",
      },
      {
        name: "Delay Tracking",
        icon: TriangleAlert,
        path: "/site-engineer/delays",
      },
    ],
  },
  {
    section: "MACHINERY & RESOURCES",
    items: [
      {
        name: "Equipment Status",
        icon: Truck,
        path: "/site-engineer/equipment",
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        name: "Notifications",
        icon: Bell,
        path: "/site-engineer/notifications",
      },
      {
        name: "Settings",
        icon: Settings,
        path: "/site-engineer/settings",
      },
    ],
  },
];

function SiteEngineerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>BUILDTRACK</h2>
        <span>SITE MONITORING</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((group) => (
          <div className="menu-group" key={group.section}>
            <p className="menu-title">{group.section}</p>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  className={`menu-item ${isActive ? "active" : ""}`}
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
export { menuItems as siteEngineerMenu };

export default SiteEngineerSidebar;

