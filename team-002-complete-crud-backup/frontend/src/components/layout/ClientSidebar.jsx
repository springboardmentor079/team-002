import {
  LayoutDashboard,
  Building2,
  Milestone,
  Image,
  Receipt,
  FileCheck,
  Bell,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  {
    section: "MAIN",
    items: [
      {
        name: "Overview",
        icon: LayoutDashboard,
        path: "/client/dashboard",
      },
      {
        name: "My Projects",
        icon: Building2,
        path: "/client/projects",
      },
    ],
  },
  {
    section: "PROGRESS & SITE",
    items: [
      {
        name: "Milestone Roadmap",
        icon: Milestone,
        path: "/client/milestones",
      },
      {
        name: "Site Photo Gallery",
        icon: Image,
        path: "/client/gallery",
      },
    ],
  },
  {
    section: "FINANCIALS",
    items: [
      {
        name: "Invoices & Payments",
        icon: Receipt,
        path: "/client/payments",
      },
      {
        name: "Quality & Handover",
        icon: FileCheck,
        path: "/client/reports",
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        name: "Notifications",
        icon: Bell,
        path: "/client/notifications",
      },
      {
        name: "Settings",
        icon: Settings,
        path: "/client/settings",
      },
    ],
  },
];

function ClientSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>BUILDTRACK</h2>
        <span>CLIENT PORTAL</span>
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
export { menuItems as clientMenu };

export default ClientSidebar;

