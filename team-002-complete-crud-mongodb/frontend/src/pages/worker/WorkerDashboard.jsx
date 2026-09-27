import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import WorkerShiftInfo from "../../components/worker/WorkerShiftInfo";
import WorkerDailyTasks from "../../components/worker/WorkerDailyTasks";
import WorkerSafetyChecklist from "../../components/worker/WorkerSafetyChecklist";
import { LogOut, AlertOctagon, Wallet, Calendar } from "lucide-react";
import api from "../../services/api";

function WorkerDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserName = () => {
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user && user.role === "worker" && user.name) {
        return user.name;
      }
    } catch {
      // fallback
    }
    return "Site Worker";
  };
  const userName = getUserName();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await api.get("/dashboard/worker");

        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch Worker dashboard:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardData?.stats || {};
  const todayRecord = dashboardData?.todayRecord || null;

  const shiftInfo = {
    site: todayRecord?.site || stats.assignedSite || "Assigned Site",
    checkIn: todayRecord?.checkIn || stats.checkIn || "--",
    checkOut: todayRecord?.checkOut || "--",
    shift: todayRecord?.shift || stats.shift || "Day Shift",
    trade: todayRecord?.trade || "Site Duty",
    punchedIn: Boolean(todayRecord?.checkIn && todayRecord.checkIn !== "--"),
  };

  return (
    <>
      {/* WELCOME SECTION */}
      <div className="welcome-section">
        <div>
          <h1>Welcome back, {userName}! 🔨</h1>
          <p>Daily shift assignments, task checklists, and site safety protocols.</p>
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
          title="ASSIGNED SITE"
          value={stats.assignedSite || "Assigned Site"}
          change="Active"
          type="projects"
        />
        <StatCard
          title="TODAY'S STATUS"
          value={shiftInfo.punchedIn ? "Punched In" : "Not Punched"}
          change={shiftInfo.checkIn}
          type="active"
        />
        <StatCard
          title="PENDING TASKS"
          value={stats.pendingTasks ?? 0}
          change={`${stats.completedTasks ?? 0} completed`}
          type="users"
        />
        <StatCard
          title="ATTENDANCE TODAY"
          value={shiftInfo.punchedIn ? "Punched" : "Pending"}
          change={`${stats.attendanceRate ?? 0}% rate`}
          type="pending"
        />
        <StatCard
          title="SAFETY COMPLIANCE"
          value={`${stats.safetyCompliance ?? 0}%`}
          change="Pending"
          type="alerts"
        />
      </div>

      {/* MAIN WIDGETS GRID */}
      <div className="dashboard-grid role-grid">
        {/* 1. Shift & Duty Details */}
        <WorkerShiftInfo data={shiftInfo} />

        {/* 2. Daily Tasks Checklist */}
        <WorkerDailyTasks tasks={dashboardData?.tasks || []} />

        {/* 3. Safety Clearance & PPE */}
        <WorkerSafetyChecklist clearedPercent={stats.safetyCompliance ?? 0} />

        {/* 4. Worker Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>Worker Actions</h3>
          </div>

          <div className="quick-actions-list">
            <button
              className="quick-action-item"
              onClick={() => navigate("/worker/attendance")}
            >
              <div className="quick-action-icon user">
                <LogOut size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Clock-in / Punch Out</h4>
                <p>Record daily punch in or end of shift clock-out</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/worker/safety")}
            >
              <div className="quick-action-icon alerts">
                <AlertOctagon size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Safety & PPE Rules</h4>
                <p>View mandatory safety rules and emergency contacts</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/worker/wages")}
            >
              <div className="quick-action-icon project">
                <Wallet size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Wage Slips & Hours</h4>
                <p>View daily wage earnings and payout history</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/worker/shifts")}
            >
              <div className="quick-action-icon manage">
                <Calendar size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Weekly Schedule</h4>
                <p>View upcoming assigned shifts and worksites</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WorkerDashboard;