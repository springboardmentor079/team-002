import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { HardHat, Truck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import ProjectStats from "../../components/projectManager/ProjectStats";
import ProjectProgress from "../../components/projectManager/ProjectProgress";
import BudgetUtilization from "../../components/projectManager/BudgetUtilization";
import WorkforceTradeAllocation from "../../components/contractor/WorkforceTradeAllocation";
import EquipmentStatusWidget from "../../components/siteEngineer/EquipmentStatusWidget";
import MaterialRequestsWidget from "../../components/contractor/MaterialRequestsWidget";

import api from "../../services/api";

function ProjectManagerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserName = () => {
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user && user.role === "project_manager" && user.name) {
        return user.name;
      }
    } catch {
      // fallback
    }
    return "Project Manager";
  };
  const userName = getUserName();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [dashRes, attRes, eqRes, matRes] = await Promise.allSettled([
          api.get("/projects/dashboard"),
          api.get("/attendance"),
          api.get("/equipment"),
          api.get("/materials"),
        ]);

        if (dashRes.status === "fulfilled" && dashRes.value?.data?.success) {
          setDashboardData(dashRes.value.data);
        } else if (dashRes.status === "rejected") {
          console.error(
            "Failed to fetch Project Manager dashboard:",
            dashRes.reason?.response?.data || dashRes.reason?.message
          );
        }

        if (attRes.status === "fulfilled" && attRes.value?.data?.data) {
          setAttendanceData(attRes.value.data.data);
        } else if (attRes.status === "rejected") {
          console.error(
            "Failed to fetch attendance for PM dashboard:",
            attRes.reason?.response?.data || attRes.reason?.message
          );
        }

        if (eqRes.status === "fulfilled" && eqRes.value?.data?.data) {
          setEquipmentData(eqRes.value.data.data);
        } else if (eqRes.status === "rejected") {
          console.error(
            "Failed to fetch equipment for PM dashboard:",
            eqRes.reason?.response?.data || eqRes.reason?.message
          );
        }

        if (matRes.status === "fulfilled" && matRes.value?.data?.data) {
          setMaterialData(matRes.value.data.data);
        } else if (matRes.status === "rejected") {
          console.error(
            "Failed to fetch materials for PM dashboard:",
            matRes.reason?.response?.data || matRes.reason?.message
          );
        }
      } catch (error) {
        console.error(
          "Error loading dashboard data:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardData?.stats || {};

  const projectProgressData =
    dashboardData?.projectProgressData || [];

  const budgetData =
    dashboardData?.budgetData || {};

  // Aggregate attendance data by trade category for WorkforceTradeAllocation
  const workforceTradeData = useMemo(() => {
    const counts = {
      "Supervisors & Engineers": 0,
      "Masons & Structural": 0,
      "Electricians & MEP": 0,
      "Carpenters & Riggers": 0,
      "General Site Labor": 0,
    };

    if (Array.isArray(attendanceData)) {
      attendanceData.forEach((record) => {
        // Only count active on-site personnel (Present, Late, Half Day)
        const status = (record.status || "Present").trim().toLowerCase();
        if (status === "absent") return;

        const trade = (record.trade || "").trim().toLowerCase();
        if (trade.includes("supervisor") || trade.includes("engineer")) {
          counts["Supervisors & Engineers"] += 1;
        } else if (
          trade.includes("mason") ||
          trade.includes("structural") ||
          trade.includes("rebar")
        ) {
          counts["Masons & Structural"] += 1;
        } else if (
          trade.includes("electri") ||
          trade.includes("mep") ||
          trade.includes("plumb")
        ) {
          counts["Electricians & MEP"] += 1;
        } else if (
          trade.includes("carpenter") ||
          trade.includes("rigger")
        ) {
          counts["Carpenters & Riggers"] += 1;
        } else {
          // Safely catch "Site Duty", "General Site Labor", empty string, or other trades
          counts["General Site Labor"] += 1;
        }
      });
    }

    return [
      {
        name: "Supervisors & Engineers",
        value: counts["Supervisors & Engineers"],
        color: "#3b82f6",
      },
      {
        name: "Masons & Structural",
        value: counts["Masons & Structural"],
        color: "#f59e0b",
      },
      {
        name: "Electricians & MEP",
        value: counts["Electricians & MEP"],
        color: "#10b981",
      },
      {
        name: "Carpenters & Riggers",
        value: counts["Carpenters & Riggers"],
        color: "#8b5cf6",
      },
      {
        name: "General Site Labor",
        value: counts["General Site Labor"],
        color: "#64748b",
      },
    ];
  }, [attendanceData]);

  // Calculate Resource Utilization & Fleet Readiness metrics
  const resourceMetrics = useMemo(() => {
    const list = Array.isArray(equipmentData) ? equipmentData : [];
    const total = list.length;

    let inUseCount = 0;
    let operationalCount = 0;
    let maintenanceCount = 0;
    let scheduledOrStandbyCount = 0;

    list.forEach((item) => {
      const status = (item.status || "").trim();
      if (status === "In Use") {
        inUseCount++;
      } else if (status === "Operational") {
        operationalCount++;
      } else if (status === "Maintenance") {
        maintenanceCount++;
      } else {
        scheduledOrStandbyCount++;
      }
    });

    const activeFleet = inUseCount + operationalCount;
    const activeFleetPct =
      total > 0 ? Math.round((activeFleet / total) * 100) : 0;
    const fleetReadiness =
      total > 0
        ? Math.round(((total - maintenanceCount) / total) * 100)
        : 0;

    const chartData = [
      { name: "Currently In Use", value: inUseCount, color: "#10b981" },
      { name: "Operational", value: operationalCount, color: "#3b82f6" },
      {
        name: "Standby / Scheduled",
        value: scheduledOrStandbyCount,
        color: "#f59e0b",
      },
      { name: "Maintenance", value: maintenanceCount, color: "#ef4444" },
    ].filter((segment) => segment.value > 0);

    const finalChartData =
      chartData.length > 0
        ? chartData
        : [{ name: "No Equipment", value: 1, color: "#e2e8f0" }];

    return {
      total,
      activeFleet,
      activeFleetPct,
      currentlyInUse: inUseCount,
      operational: operationalCount,
      maintenance: maintenanceCount,
      scheduledOrStandby: scheduledOrStandbyCount,
      fleetReadiness,
      chartData: finalChartData,
    };
  }, [equipmentData]);

  return (
    <>
      <div className="pm-welcome-section">
        <h1>Welcome back, {userName}! 👋</h1>

        <p>
          Here's what's happening with your projects today.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          Loading dashboard...
        </div>
      ) : (
        <>
          <ProjectStats stats={stats} />

          <div className="pm-charts-grid">
            <ProjectProgress
              data={projectProgressData}
            />

            <BudgetUtilization
              data={budgetData}
            />
          </div>

          {/* Workforce Status Section */}
          <div className="pm-section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  Workforce Status
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                  Live on-site crew deployment and trade distribution across active project sites.
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#475569",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}
                title="Reported site-wide across all construction sites"
              >
                Site-Wide Live Attendance
              </span>
            </div>
          </div>

          <div className="pm-charts-grid">
            <WorkforceTradeAllocation data={workforceTradeData} />

            <div
              className="dashboard-card"
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "330px",
              }}
            >
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <HardHat size={18} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
                    Active Duty Personnel
                  </h3>
                </div>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                  {attendanceData.filter((a) => (a.status || "Present").toLowerCase() !== "absent").length} Present
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  overflowY: "auto",
                  maxHeight: "220px",
                  paddingRight: "4px",
                  flex: 1,
                }}
              >
                {attendanceData.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    No personnel currently logged on duty across sites.
                  </div>
                ) : (
                  attendanceData.map((att) => (
                    <div
                      key={att._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: "13px",
                            color: "#1e293b",
                            display: "block",
                          }}
                        >
                          {att.userName}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {att.trade || "General Labor"} • {att.site || "All Sites"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {att.checkIn && att.checkIn !== "--" && (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {att.checkIn}
                          </span>
                        )}
                        <span
                          className={`status-pill ${
                            att.status === "Present" ? "good" : "warning"
                          }`}
                        >
                          {att.status || "Present"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid #f1f5f9",
                  textAlign: "right",
                }}
              >
                <Link
                  to="/project-manager/workforce"
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  View Full Workforce Roster →
                </Link>
              </div>
            </div>
          </div>

          {/* Resource Utilization Section */}
          <div className="pm-section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  Resource Utilization
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                  Heavy machinery allocation, equipment readiness, and operational site telemetry.
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#475569",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}
                title="Telemetry reported across all active construction sites"
              >
                Site-Wide Fleet Telemetry
              </span>
            </div>
          </div>

          <div className="pm-charts-grid">
            <div
              className="dashboard-card"
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "330px",
              }}
            >
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Truck size={18} color="#d97706" />
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
                    Fleet Allocation & Readiness
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#059669",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  {resourceMetrics.fleetReadiness}% Fleet Ready
                </span>
              </div>

              <div className="project-overview-content" style={{ flex: 1 }}>
                <div className="project-chart">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={resourceMetrics.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={1}
                        dataKey="value"
                        stroke="none"
                      >
                        {resourceMetrics.chartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="chart-center-text">
                    <strong>{resourceMetrics.activeFleetPct}%</strong>
                    <span>Active Fleet</span>
                  </div>
                </div>

                <div className="project-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: "#10b981" }} />
                    <span>Currently In Use</span>
                    <strong>{resourceMetrics.currentlyInUse}</strong>
                    <span className="percentage">
                      ({resourceMetrics.total > 0 ? Math.round((resourceMetrics.currentlyInUse / resourceMetrics.total) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: "#3b82f6" }} />
                    <span>Operational</span>
                    <strong>{resourceMetrics.operational}</strong>
                    <span className="percentage">
                      ({resourceMetrics.total > 0 ? Math.round((resourceMetrics.operational / resourceMetrics.total) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: "#f59e0b" }} />
                    <span>Standby / Scheduled</span>
                    <strong>{resourceMetrics.scheduledOrStandby}</strong>
                    <span className="percentage">
                      ({resourceMetrics.total > 0 ? Math.round((resourceMetrics.scheduledOrStandby / resourceMetrics.total) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: "#ef4444" }} />
                    <span>Maintenance</span>
                    <strong>{resourceMetrics.maintenance}</strong>
                    <span className="percentage">
                      ({resourceMetrics.total > 0 ? Math.round((resourceMetrics.maintenance / resourceMetrics.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  textAlign: "center",
                }}
              >
                <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>Active Fleet</span>
                  <strong style={{ fontSize: "13px", color: "#1e293b" }}>
                    {resourceMetrics.activeFleet} Units ({resourceMetrics.activeFleetPct}%)
                  </strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>Fleet Readiness</span>
                  <strong style={{ fontSize: "13px", color: "#059669" }}>
                    {resourceMetrics.fleetReadiness}%
                  </strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>Total Tracked</span>
                  <strong style={{ fontSize: "13px", color: "#1e293b" }}>
                    {resourceMetrics.total} Units
                  </strong>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "330px",
              }}
            >
              <div style={{ flex: 1 }}>
                <EquipmentStatusWidget
                  equipment={equipmentData}
                  count={equipmentData.length}
                />
              </div>

              <div
                style={{
                  marginTop: "8px",
                  textAlign: "right",
                  paddingRight: "6px",
                }}
              >
                <Link
                  to="/project-manager/resources"
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  View Full Fleet Inventory →
                </Link>
              </div>
            </div>
          </div>

          {/* Procurement Overview Section */}
          <div className="pm-section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  Procurement Overview
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                  Latest material requisitions across all active project sites.
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#475569",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}
                title="Material requests are aggregated site-wide"
              >
                Site-Wide Procurement
              </span>
            </div>
          </div>

          <div className="pm-charts-grid" style={{ marginBottom: "32px" }}>
            <MaterialRequestsWidget requests={materialData} />
            <div />
          </div>
        </>
      )}
    </>
  );
}

export default ProjectManagerDashboard;