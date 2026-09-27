import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { useState, useEffect } from "react";
import api from "../../services/api";

// ================= PROJECT STATUS CONFIGURATION =================

const projectStatusConfig = [
  {
    name: "On Track",
    color: "#22c55e",
  },
  {
    name: "Delayed",
    color: "#f59e0b",
  },
  {
    name: "At Risk",
    color: "#ef4444",
  },
  {
    name: "Completed",
    color: "#3b82f6",
  },
];

function ProjectStatus({ projectStatusDistribution, totalProjects, loading }) {
  const [data, setData] = useState(projectStatusDistribution || {});
  const [count, setCount] = useState(totalProjects || 0);
  const [selfLoading, setSelfLoading] = useState(Boolean(loading));

  useEffect(() => {
    if (projectStatusDistribution === undefined) {
      const fetchData = async () => {
        try {
          setSelfLoading(true);
          const response = await api.get("/admin/dashboard");
          if (response.data.success) {
            setData(response.data.projectStatusDistribution || {});
            setCount(response.data.stats?.totalProjects || 0);
          }
        } catch (error) {
          console.error(
            "Failed to fetch project status:",
            error.response?.data || error.message
          );
        } finally {
          setSelfLoading(false);
        }
      };
      fetchData();
    } else {
      setData(projectStatusDistribution);
      setCount(totalProjects || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectStatusDistribution, totalProjects]);

  const isLoading =
    projectStatusDistribution === undefined ? selfLoading : Boolean(loading);

  // Convert API data into chart format
  const projectData = projectStatusConfig.map((status) => ({
    name: status.name,
    projects: data[status.name] || 0,
    color: status.color,
  }));

  return (
    <div className="dashboard-card project-status-card">
      <div className="card-header">
        <h3>Projects by Status</h3>
      </div>

      <div className="project-status-chart">
        {isLoading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading project data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={projectData}
              margin={{
                top: 10,
                right: 5,
                left: -20,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 9,
                  fill: "#64748b",
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
              />

              <Tooltip />

              <Bar
                dataKey="projects"
                radius={[5, 5, 0, 0]}
              >
                {projectData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="project-status-summary">
        <span>Total Projects</span>

        <strong>{count}</strong>
      </div>
    </div>
  );
}

export default ProjectStatus;