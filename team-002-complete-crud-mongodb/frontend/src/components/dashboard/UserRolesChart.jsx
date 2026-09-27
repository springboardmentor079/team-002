import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { useState, useEffect } from "react";
import api from "../../services/api";

// ================= ROLE CONFIGURATION =================

const rolesConfig = [
  {
    name: "Administrators",
    apiRole: "admin",
    color: "#3b82f6",
  },
  {
    name: "Project Managers",
    apiRole: "project_manager",
    color: "#22c55e",
  },
  {
    name: "Site Engineers",
    apiRole: "site_engineer",
    color: "#f59e0b",
  },
  {
    name: "Contractors",
    apiRole: "contractor",
    color: "#8b5cf6",
  },
  {
    name: "Workers",
    apiRole: "worker",
    color: "#ef4444",
  },
  {
    name: "Clients",
    apiRole: "client",
    color: "#14b8a6",
  },
];

// ================= COMPONENT =================

function UserRolesChart({ roleDistribution, totalUsers, loading }) {
  const [data, setData] = useState(roleDistribution || {});
  const [count, setCount] = useState(totalUsers || 0);
  const [selfLoading, setSelfLoading] = useState(Boolean(loading));

  useEffect(() => {
    // If no props passed, fetch the data ourselves
    if (roleDistribution === undefined) {
      const fetchData = async () => {
        try {
          setSelfLoading(true);
          const response = await api.get("/admin/dashboard");
          if (response.data.success) {
            setData(response.data.roleDistribution || {});
            setCount(response.data.stats?.totalUsers || 0);
          }
        } catch (error) {
          console.error(
            "Failed to fetch user roles:",
            error.response?.data || error.message
          );
        } finally {
          setSelfLoading(false);
        }
      };
      fetchData();
    } else {
      setData(roleDistribution);
      setCount(totalUsers || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleDistribution, totalUsers]);

  const isLoading = roleDistribution === undefined ? selfLoading : Boolean(loading);

  // API data ko chart format mein convert karna
  const rolesData = rolesConfig.map((role) => ({
    name: role.name,
    value: data[role.apiRole] || 0,
    color: role.color,
  }));

  return (
    <div className="dashboard-card user-roles-card">
      <div className="card-header">
        <h3>User Roles Distribution</h3>
      </div>

      <div className="roles-content">
        {isLoading ? (
          <div
            style={{
              height: "180px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading user roles...
          </div>
        ) : (
          <>
            <div className="roles-chart">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={rolesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {rolesData.map((role) => (
                      <Cell
                        key={role.name}
                        fill={role.color}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="roles-center-text">
                <strong>{count}</strong>
                <span>Total Users</span>
              </div>
            </div>

            <div className="roles-legend">
              {rolesData.map((role) => (
                <div
                  className="role-legend-item"
                  key={role.name}
                >
                  <span
                    className="role-dot"
                    style={{
                      backgroundColor: role.color,
                    }}
                  />

                  <span className="role-name">
                    {role.name}
                  </span>

                  <strong>{role.value}</strong>

                  <span className="role-percent">
                    (
                    {count > 0
                      ? Math.round(
                          (role.value / count) * 100
                        )
                      : 0}
                    %)
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

export default UserRolesChart;