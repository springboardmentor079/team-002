import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import WorkforceTradeAllocation from "../../components/contractor/WorkforceTradeAllocation";
import ContractorWorkOrders from "../../components/contractor/ContractorWorkOrders";
import MaterialRequestsWidget from "../../components/contractor/MaterialRequestsWidget";
import { UserCheck, PackagePlus, HardHat, ClipboardCheck } from "lucide-react";
import api from "../../services/api";

function ContractorDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserName = () => {
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user && user.role === "contractor" && user.name) {
        return user.name;
      }
    } catch {
      // fallback
    }
    return "Contractor";
  };
  const userName = getUserName();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await api.get("/dashboard/contractor");

        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch Contractor dashboard:",
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
          <h1>Welcome back, {userName}! 🏗️</h1>
          <p>Workforce deployment, work package status, and material requisitions.</p>
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
          title="ACTIVE CREW ON-SITE"
          value={stats.totalCrew ?? 0}
          change={loading ? "Loading" : "Live"}
          type="users"
        />
        <StatCard
          title="ATTENDANCE RATE"
          value={`${stats.attendanceRate ?? 0}%`}
          change={loading ? "Loading" : "Live"}
          type="active"
        />
        <StatCard
          title="ACTIVE WORK ORDERS"
          value={stats.activeWork ?? 0}
          change={`${stats.onSchedule ?? 0} on time`}
          type="projects"
        />
        <StatCard
          title="MATERIAL REQUISITIONS"
          value={stats.totalMaterialRequests ?? 0}
          change={`${stats.pendingMaterialRequests ?? 0} pending`}
          type="pending"
        />
        <StatCard
          title="MACHINERY DEPLOYED"
          value={`${stats.equipmentDeployed ?? 0} Units`}
          change="Active"
          type="alerts"
        />
      </div>

      {/* MAIN WIDGETS GRID */}
      <div className="dashboard-grid role-grid">
        {/* 1. Workforce Allocation by Trade */}
        <WorkforceTradeAllocation data={dashboardData?.workforceData || []} />

        {/* 2. Active Work Orders */}
        <ContractorWorkOrders workOrders={dashboardData?.workOrders || []} />

        {/* 3. Material Requests & Requisitions */}
        <MaterialRequestsWidget requests={dashboardData?.materialRequests || []} />

        {/* 4. Contractor Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>Contractor Actions</h3>
          </div>

          <div className="quick-actions-list">
            <button
              className="quick-action-item"
              onClick={() => navigate("/contractor/attendance")}
            >
              <div className="quick-action-icon user">
                <UserCheck size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Log Daily Attendance</h4>
                <p>Mark crew presence and shifts</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/contractor/material-requests")}
            >
              <div className="quick-action-icon project">
                <PackagePlus size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Request Materials</h4>
                <p>Order cement, steel, or aggregate</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/contractor/work-orders")}
            >
              <div className="quick-action-icon manage">
                <ClipboardCheck size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Update Work Order</h4>
                <p>Log milestone completion percentages</p>
              </div>
            </button>

            <button
              className="quick-action-item"
              onClick={() => navigate("/contractor/equipment")}
            >
              <div className="quick-action-icon alerts">
                <HardHat size={18} />
              </div>
              <div className="quick-action-content">
                <h4>Report Incident / Equipment</h4>
                <p>Notify Site Engineer of machinery or stoppages</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContractorDashboard;