import { useEffect, useState } from "react";

import StatCard from "../../components/dashboard/StatCard";
import ProjectOverview from "../../components/dashboard/ProjectOverview";
import SystemAnalytics from "../../components/dashboard/SystemAnalytics";
import RecentActivity from "../../components/dashboard/RecentActivity";
import UserRolesChart from "../../components/dashboard/UserRolesChart";
import ProjectStatus from "../../components/dashboard/ProjectStatus";
import QuickActions from "../../components/dashboard/QuickActions";

import api from "../../services/api";

function AdminDashboard() {
  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // GET USER NAME
  // =========================

  const getUserName = () => {
    try {
      const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      const user = storedUser
        ? JSON.parse(storedUser)
        : null;

      if (user && user.name) {
        return user.name;
      }
    } catch (error) {
      console.error(
        "User data error:",
        error
      );
    }

    return "Admin";
  };

  const userName = getUserName();

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboardData =
    async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/admin/dashboard"
          );

        if (response.data.success) {
          setDashboardData(
            response.data
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error.response?.data ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  // =========================
  // DEFAULT STATS
  // =========================

  const stats =
    dashboardData?.stats || {
      totalUsers: 0,
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      pendingApprovals: 0,
      systemAlerts: 0,
    };

  return (
    <>
      {/* WELCOME SECTION */}

      <div className="welcome-section">
        <div>
          <h1>
            Welcome back, {userName}! 👋
          </h1>

          <p>
            Here's an overview of the
            system and all projects.
          </p>
        </div>

        <button className="date-button">
          📅 Today,{" "}
          {new Date().toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          )}
        </button>
      </div>

      {/* STATISTICS */}

      <div className="stats-grid">
        <StatCard
          title="TOTAL USERS"
          value={stats.totalUsers}
          change="Live"
          type="users"
        />

        <StatCard
          title="TOTAL PROJECTS"
          value={stats.totalProjects}
          change="Live"
          type="projects"
        />

        <StatCard
          title="ACTIVE PROJECTS"
          value={stats.activeProjects}
          change="Live"
          type="active"
        />

        <StatCard
          title="PENDING APPROVALS"
          value={stats.pendingApprovals}
          change="Live"
          type="pending"
        />

        <StatCard
          title="SYSTEM ALERTS"
          value={stats.systemAlerts}
          change="Live"
          type="alerts"
        />
      </div>

      {/* DASHBOARD COMPONENTS */}

      <div className="dashboard-grid">
        <ProjectOverview />

        <SystemAnalytics
  analyticsData={dashboardData?.analyticsData || []}
  loading={loading}
/>

       <RecentActivity
  activities={dashboardData?.recentActivities || []}
  loading={loading}
/>

        <UserRolesChart
  roleDistribution={
    dashboardData?.roleDistribution || {}
  }
  totalUsers={
    dashboardData?.stats?.totalUsers || 0
  }
  loading={loading}
/>

        <ProjectStatus
  projectStatusDistribution={
    dashboardData?.projectStatusDistribution || {}
  }
  totalProjects={
    dashboardData?.stats?.totalProjects || 0
  }
  loading={loading}
/>

        <QuickActions />
      </div>
    </>
  );
}

export default AdminDashboard;