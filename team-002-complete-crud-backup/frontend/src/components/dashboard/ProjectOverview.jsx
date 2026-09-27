import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { ChevronDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const chartConfig = [
  {
    name: "Planning",
    color: "#8b5cf6",
  },
  {
    name: "On Track",
    color: "#1f9d70",
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

function ProjectOverview() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    const fetchProjectOverview = async () => {
      try {
        const response = await api.get("/admin/dashboard");

        if (response.data.success) {
          const projectDistribution =
            response.data.projectStatusDistribution || {};

          const formattedData = chartConfig.map((item) => ({
            name: item.name,
            value: projectDistribution[item.name] || 0,
            color: item.color,
          }));

          setData(formattedData);

          setTotalProjects(
            response.data.stats?.totalProjects || 0
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch project overview:",
          error.response?.data || error.message
        );
      }
    };

    fetchProjectOverview();
  }, []);

  return (
    <div className="dashboard-card project-overview-card">
      <div className="card-header">
        <h3>Project Overview</h3>

        <button className="card-filter">
          All Projects
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="project-overview-content">
        <div className="project-chart">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-center-text">
            <strong>{totalProjects}</strong>
            <span>Total Projects</span>
          </div>
        </div>

        <div className="project-legend">
          {data.map((item) => (
            <div
              className="legend-item"
              key={item.name}
            >
              <span
                className="legend-dot"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span>{item.name}</span>

              <strong>{item.value}</strong>

              <span className="percentage">
                (
                {totalProjects > 0
                  ? Math.round(
                      (item.value / totalProjects) * 100
                    )
                  : 0}
                %)
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="view-projects-btn"
        onClick={() => navigate("/admin/projects")}
      >
        View all projects
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default ProjectOverview;