import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

const defaultColors = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#64748b"];
const defaultLabels = [
  "Supervisors & Engineers",
  "Masons & Structural",
  "Electricians & MEP",
  "Carpenters & Riggers",
  "General Site Labor",
];

function WorkforceTradeAllocation({ data = [] }) {
  const rawData = Array.isArray(data) ? data : [];
  // Filter to active trades with crew assigned
  const activeTrades = rawData.filter((item) => (item.value || 0) > 0);
  const totalCrew = activeTrades.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="dashboard-card workforce-trade-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} color="#f59e0b" />
          <h3>Workforce by Trade</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
          Live Database Roster
        </span>
      </div>

      <div className="project-overview-content">
        {totalCrew === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", width: "100%" }}>
            <p style={{ margin: 0, fontSize: "13px" }}>No trade check-ins logged yet.</p>
            <span style={{ fontSize: "11px" }}>Workers will appear here once attendance or trade tasks are recorded.</span>
          </div>
        ) : (
          <>
            <div className="project-chart">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={activeTrades}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {activeTrades.map((entry) => (
                      <Cell key={entry.name} fill={entry.color || "#3b82f6"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-center-text">
                <strong>{totalCrew}</strong>
                <span>Active Crew</span>
              </div>
            </div>

            <div className="project-legend">
              {activeTrades.map((item) => (
                <div className="legend-item" key={item.name}>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: item.color || "#3b82f6" }}
                  />
                  <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                  <span className="percentage">
                    ({totalCrew > 0 ? Math.round(((item.value || 0) / totalCrew) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WorkforceTradeAllocation;