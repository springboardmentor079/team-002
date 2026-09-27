import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import api from "../../services/api";

function SystemAnalytics({ analyticsData, loading }) {
  const [data, setData] = useState(analyticsData || []);
  const [selfLoading, setSelfLoading] = useState(Boolean(loading));

  useEffect(() => {
    // If no props passed, fetch the data ourselves
    if (analyticsData === undefined) {
      const fetchData = async () => {
        try {
          setSelfLoading(true);
          const response = await api.get("/admin/dashboard");
          if (response.data.success) {
            setData(response.data.analyticsData || []);
          }
        } catch (error) {
          console.error(
            "Failed to fetch analytics:",
            error.response?.data || error.message
          );
        } finally {
          setSelfLoading(false);
        }
      };
      fetchData();
    } else {
      setData(analyticsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsData]);

  const isLoading = analyticsData === undefined ? selfLoading : Boolean(loading);
  const chartData = analyticsData === undefined ? data : analyticsData;

  return (
    <div className="dashboard-card system-analytics-card">
      <div className="card-header">
        <h3>System Analytics</h3>

        <button className="card-filter">
          Last 30 Days
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="analytics-legend">
        <div>
          <span className="legend-color users-color"></span>
          Users
        </div>

        <div>
          <span className="legend-color projects-color"></span>
          Projects
        </div>
      </div>

      <div className="analytics-chart">
        {isLoading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading analytics...
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            No analytics data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 5,
                left: -20,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{
                  r: 3,
                }}
              />

              <Line
                type="monotone"
                dataKey="projects"
                stroke="#1f9d70"
                strokeWidth={2}
                dot={{
                  r: 3,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default SystemAnalytics;