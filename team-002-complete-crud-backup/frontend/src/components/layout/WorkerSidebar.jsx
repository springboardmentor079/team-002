import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  CalendarDays,
  ShieldCheck,
  Wallet,
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
        path: "/worker/dashboard",
      },
      {
        name: "Assigned Tasks",
        icon: CheckSquare,
        path: "/worker/tasks",
      },
    ],
  },
  {
    section: "ATTENDANCE & SHIFTS",
    items: [
      {
        name: "Clock-in / Punch",
        icon: Clock,
        path: "/worker/attendance",
      },
      {
        name: "Weekly Schedule",
        icon: CalendarDays,
        path: "/worker/shifts",
      },
    ],
  },
  {
    section: "SAFETY & PAYROLL",
    items: [
      {
        name: "Safety & PPE Rules",
        icon: ShieldCheck,
        path: "/worker/safety",
      },
      {
        name: "Wage Slips & Hours",
        icon: Wallet,
        path: "/worker/wages",
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        name: "Notifications",
        icon: Bell,
        path: "/worker/notifications",
      },
      {
        name: "Settings",
        icon: Settings,
        path: "/worker/settings",
      },
    ],
  },
];

function WorkerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>BUILDTRACK</h2>
        <span>WORKER PORTAL</span>
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
export { menuItems as workerMenu };

export default WorkerSidebar;

