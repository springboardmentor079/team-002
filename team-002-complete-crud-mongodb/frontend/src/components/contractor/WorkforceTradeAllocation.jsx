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
  let workforceData = Array.isArray(data) ? data : [];

  // If no data passed, build zeroed default categories so the UI never crashes
  if (workforceData.length === 0) {
    workforceData = defaultLabels.map((name, idx) => ({
      name,
      value: 0,
      color: defaultColors[idx],
    }));
  }

  const totalCrew = workforceData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="dashboard-card workforce-trade-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} color="#f59e0b" />
          <h3>Workforce by Trade</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
          Today's Roster
        </span>
      </div>

      <div className="project-overview-content">
        <div className="project-chart">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={workforceData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {workforceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
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
          {workforceData.map((item) => (
            <div className="legend-item" key={item.name}>
              <span
                className="legend-dot"
                style={{ backgroundColor: item.color }}
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
      </div>
    </div>
  );
}

export default WorkforceTradeAllocation;