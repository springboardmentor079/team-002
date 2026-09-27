import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { workerMenu } from "./WorkerSidebar";
import "../../styles/dashboard.css";
import "../../styles/roleDashboards.css";
import "../../styles/workerDashboard.css";

function WorkerLayout() {
  // Desktop: collapsed (icon-only) vs expanded. Mobile: drawer closed vs open.
  const [collapsed, setCollapsed] = useState(
    () => window.matchMedia("(max-width: 1023px)").matches
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Marks this layout so the floating theme pill is hidden (the header
  // hosts the shared ThemeSwitcher instead).
  useEffect(() => {
    document.body.classList.add("admin-scope");
    return () => document.body.classList.remove("admin-scope");
  }, []);

  // Close the mobile drawer when the viewport grows back to desktop.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setDrawerOpen((open) => !open);
    } else {
      setCollapsed((value) => !value);
    }
  };

  return (
    <div className="dashboard-layout layout-toggled">
      <Sidebar
        menu={workerMenu}
        collapsed={collapsed}
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <main className="dashboard-main">
        <Header
          title="Worker Portal"
          onToggleSidebar={toggleSidebar}
          showTheme
        />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default WorkerLayout;