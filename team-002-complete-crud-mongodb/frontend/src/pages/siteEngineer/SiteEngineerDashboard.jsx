import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import SiteProgressCategories from "../../components/siteEngineer/SiteProgressCategories";
import SiteDelayTracker from "../../components/siteEngineer/SiteDelayTracker";
import EquipmentStatusWidget from "../../components/siteEngineer/EquipmentStatusWidget";
import SiteActivityLogs from "../../components/siteEngineer/SiteActivityLogs";
import { PlusCircle, FileText, AlertTriangle, HardHat } from "lucide-react";
import api from "../../services/api";

function SiteEngineerDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserName = () => {
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user && user.role === "site_engineer" && user.name) {
        return user.name;
      }
    } catch {
      // fallback
    }
    return "Site Engineer";
  };
  const userName = getUserName();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await api.get("/dashboard/site-engineer");

        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch Site Engineer dashboard:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardData?.stats || {};

  return (
    <>
      {/* WELCOME SECTION */}
      <div className="welcome-section">
        <div>
          <h1>Welcome back, {userName}! 👷</h1>
          <p>Site progress monitoring, inspections, and machinery operations.</p>
        </div>

        <button className="date-button">
          📅 Today,{" "}
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </button>
      </div>

      {/* KPI STATISTICS */}
      <div className="stats-grid">
        <StatCard
          title="ASSIGNED SITES"
          value={`${stats.totalProjects ?? 0} Sites`}
          change="Active"
          type="projects"
        />
        <StatCard
          title="OVERALL COMPLETION"
          value={`${stats.averageCompletion ?? 0}%`}
          change={loading ? "Loading" : "Live"}
          type="active"
        />
        <StatCard
          title="INSPECTIONS TODAY"
          value={stats.inspectionsToday ?? 0}
          change={loading ? "Loading" : "Live"}
          type="users"
        />
        <StatCard
          title="SITE DELAYS / ISSUES"
          value={stats.activeDelays ?? 0}
          change={`${stats.criticalDelays ?? 0} critical`}
          type="alerts"
        />
        <StatCard
          title="MACHINERY ON SITE"
          value={`${stats.machineryOnSite ?? 0} Units`}
          change={loading ? "Loading" : `${stats.equipmentTotal ?? 0} logged`}
          type="pending"
        />
      </div>

      {/* MAIN WIDGETS GRID */}
      <div className="dashboard-grid role-grid">
        {/* 1. Progress by Construction Phase */}
        <SiteProgressCategories 
          milestones={dashboardData?.milestones || []}
          loading={loading}
        />

        {/* 2. Delay & Milestone Tracker */}
        <SiteDelayTracker 
          milestones={dashboardData?.milestones || []}
          activeDelays={stats.activeDelays || 0}
          loading={loading}
        />

        {/* 3. Site Activity & Inspection Logs */}
        <SiteActivityLogs logs={dashboardData?.recentActivities || []} />

        {/* 4. Machinery & Equipment Availability */}
        <EquipmentStatusWidget
          equipment={dashboardData?.equipment || []}
          count={stats.equipmentTotal ?? 0}
        />

        {/* 5. Site Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>Site Quick Actions</h3>
          </div>

          <div className="quick-actions-list">
            <button
              className="quick-action-item"
              onClick={() => navigate("/site-engineer/daily-reports")}
            >
              <div className="quick-action-icon project">
                <FileText size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Log Daily Report</h4>
                <p>Submit daily site progress and workforce counts</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/site-engineer/inspections")}
            >
              <div className="quick-action-icon user">
                <HardHat size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Record Inspection</h4>
                <p>Log rebar, concrete, or safety checks</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/site-engineer/delays")}
            >
              <div className="quick-action-icon alerts">
                <AlertTriangle size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Report Site Delay</h4>
                <p>Log weather, material, or design bottlenecks</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/site-engineer/equipment")}
            >
              <div className="quick-action-icon manage">
                <PlusCircle size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Request Equipment</h4>
                <p>Requisition cranes, transit mixers, or tools</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SiteEngineerDashboard;