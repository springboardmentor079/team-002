import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import ClientMilestoneTimeline from "../../components/client/ClientMilestoneTimeline";
import ClientFinancialOverview from "../../components/client/ClientFinancialOverview";
import ClientSiteUpdates from "../../components/client/ClientSiteUpdates";
import { Download, Receipt, PhoneCall, Eye } from "lucide-react";
import api from "../../services/api";

function ClientDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserName = () => {
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user && user.role === "client" && user.name) {
        return user.name;
      }
    } catch {
      // fallback
    }
    return "Client";
  };
  const userName = getUserName();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await api.get("/dashboard/client");

        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch Client dashboard:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardData?.stats || {};
  const milestones = dashboardData?.milestones || [];
  const projectName =
    dashboardData?.projects?.[0]?.name || "Your Project";

  return (
    <>
      {/* WELCOME SECTION */}
      <div className="welcome-section">
        <div>
          <h1>Welcome back, {userName}! 🏢</h1>
          <p>Real-time construction progress, milestone disbursements, and site verification.</p>
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
          title="MY PROJECTS"
          value={`${stats.totalProjects ?? 0} Sites`}
          change={loading ? "Loading" : `${stats.activeProjects ?? 0} active`}
          type="projects"
        />
        <StatCard
          title="OVERALL COMPLETION"
          value={`${stats.overallProgress ?? 0}%`}
          change={loading ? "Loading" : "Live"}
          type="active"
        />
        <StatCard
          title="TOTAL DISBURSED"
          value={stats.totalSpentLabel || "₹ 0.0 Cr"}
          change={`${stats.budgetUtilization ?? 0}% utilized`}
          type="users"
        />
        <StatCard
          title="MILESTONES SIGNED"
          value={`${stats.signedMilestones ?? 0} / ${stats.totalMilestones ?? 0}`}
          change="Quality pass"
          type="pending"
        />
        <StatCard
          title="NEXT HANDOVER"
          value={stats.nextHandover || "--"}
          change="On track"
          type="alerts"
        />
      </div>

      {/* MAIN WIDGETS GRID */}
      <div className="dashboard-grid role-grid">
        {/* 1. Milestone Timeline Roadmap */}
        <ClientMilestoneTimeline milestones={milestones} projectName={projectName} />

        {/* 2. Financial Overview & Expenditure */}
        <ClientFinancialOverview data={dashboardData?.financialData} />

        {/* 3. Site Updates & Inspection Logs */}
        <ClientSiteUpdates updates={dashboardData?.siteUpdates || []} />

        {/* 4. Client Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>Client Services</h3>
          </div>

          <div className="quick-actions-list">
            <button
              className="quick-action-item"
              onClick={() => navigate("/client/reports")}
            >
              <div className="quick-action-icon project">
                <Download size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Progress Reports</h4>
                <p>View verified monthly progress summaries</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/client/payments")}
            >
              <div className="quick-action-icon user">
                <Receipt size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Milestone Invoices</h4>
                <p>Review and download verified payment receipts</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/client/gallery")}
            >
              <div className="quick-action-icon manage">
                <Eye size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Site Photo Gallery</h4>
                <p>View drone imagery and high-res progress photos</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/client/notifications")}
            >
              <div className="quick-action-icon alerts">
                <PhoneCall size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Project Notifications</h4>
                <p>Track milestone clearances and status alerts</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClientDashboard;