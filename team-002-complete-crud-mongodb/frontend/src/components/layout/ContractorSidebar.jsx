import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  Package,
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
        path: "/contractor/dashboard",
      },
      {
        name: "Work Orders",
        icon: ClipboardList,
        path: "/contractor/work-orders",
      },
    ],
  },
  {
    section: "WORKFORCE MANAGEMENT",
    items: [
      {
        name: "Crew Attendance",
        icon: Users,
        path: "/contractor/attendance",
      },
      {
        name: "Shift Scheduling",
        icon: Calendar,
        path: "/contractor/shifts",
      },
    ],
  },
  {
    section: "MATERIALS & EQUIPMENT",
    items: [
      {
        name: "Material Requests",
        icon: Package,
        path: "/contractor/material-requests",
      },
      {
        name: "Equipment Allocation",
        icon: Truck,
        path: "/contractor/equipment",
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        name: "Notifications",
        icon: Bell,
        path: "/contractor/notifications",
      },
      {
        name: "Settings",
        icon: Settings,
        path: "/contractor/settings",
      },
    ],
  },
];

function ContractorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>BUILDTRACK</h2>
        <span>CONTRACTOR PORTAL</span>
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
export { menuItems as contractorMenu };

export default ContractorSidebar;

