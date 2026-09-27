import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

function amountToNumber(value) {
  if (typeof value === "number") return value;

  if (!value) return 0;

  const n = Number(String(value).replace(/[^\d.]/g, ""));

  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value) {
  const number = amountToNumber(value);

  return `₹ ${number.toLocaleString("en-IN")}`;
}

function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/projects");

        console.log("CLIENT PROJECT API RESPONSE:", response.data);

        if (response.data?.success) {
          setProjects(response.data.data || []);
        } else {
          setProjects([]);
          setError("Unable to load projects.");
        }
      } catch (err) {
        console.error(
          "Client projects error:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            "Unable to load projects. Please login again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const totalBudget = projects.reduce(
    (sum, project) => sum + amountToNumber(project.budget),
    0
  );

  const totalSpent = projects.reduce(
    (sum, project) => sum + amountToNumber(project.spent),
    0
  );

  const progress = projects.length
    ? Math.round(
        projects.reduce(
          (sum, project) => sum + (Number(project.progress) || 0),
          0
        ) / projects.length
      )
    : 0;

  const targetPossession =
    projects
      .map((project) => project.endDate)
      .filter(Boolean)
      .sort()[0] || "--";

  return (
    <>
      {/* HEADER */}
      <div className="welcome-section">
        <div>
          <h1>My Projects Portfolio 🏢</h1>

          <p>
            Real-time construction execution, unit specifications,
            structural sign-offs, and handover timelines.
          </p>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="stats-grid">
        <StatCard
          title="TOTAL DEVELOPMENTS"
          value={String(projects.length)}
          change="From MongoDB"
          type="projects"
        />

        <StatCard
          title="OVERALL COMPLETION"
          value={`${progress}%`}
          change="Calculated live"
          type="active"
        />

        <StatCard
          title="TOTAL INVESTMENT"
          value={`₹ ${(totalBudget / 10000000).toFixed(2)} Cr`}
          change="Contract value"
          type="users"
        />

        <StatCard
          title="DISBURSED AMOUNT"
          value={`₹ ${(totalSpent / 10000000).toFixed(2)} Cr`}
          change="Spent to date"
          type="pending"
        />

        <StatCard
          title="TARGET POSSESSION"
          value={targetPossession}
          change="Earliest project"
          type="alerts"
        />
      </div>

      {/* PROJECTS */}
      <div className="dashboard-grid role-grid">
        {loading && (
          <div
            className="dashboard-card"
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            Loading projects...
          </div>
        )}

        {!loading && error && (
          <div
            className="dashboard-card"
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div
            className="dashboard-card"
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No projects are assigned to this client.
          </div>
        )}

        {!loading &&
          !error &&
          projects.map((project) => (
            <div
              className="dashboard-card"
              key={project._id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* PROJECT HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  {/* PROJECT NAME */}
                  <h3
                    style={{
                      margin: "0 0 5px 0",
                      fontSize: "18px",
                      color: "#ffffff",
                      fontWeight: "600",
                    }}
                  >
                    {project.name || "Unnamed Project"}
                  </h3>

                  {/* PROJECT CODE */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      marginBottom: "6px",
                    }}
                  >
                    Project Code: {project.code || "--"}
                  </div>

                  {/* LOCATION */}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MapPin size={13} />
                    {project.location || "Site"}
                  </span>
                </div>

                {/* STATUS */}
                <span
                  className={`status-pill ${
                    project.status === "Completed"
                      ? "good"
                      : project.status === "Delayed"
                      ? "warning"
                      : "good"
                  }`}
                >
                  {project.status || "On Track"}
                </span>
              </div>

              {/* PROGRESS */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    marginBottom: "6px",
                  }}
                >
                  <span>Completion Status</span>

                  <strong>
                    {Number(project.progress) || 0}%
                  </strong>
                </div>

                <div
                  className="progress-track"
                  style={{
                    height: "8px",
                  }}
                >
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(project.progress) || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                {project.description ||
                  "No description available."}
              </p>

              {/* PROJECT DETAILS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  borderTop: "1px solid #334155",
                  paddingTop: "12px",
                }}
              >
                {/* BUDGET */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginBottom: "4px",
                    }}
                  >
                    Contract Value
                  </div>

                  <strong
                    style={{
                      color: "#ffffff",
                      fontSize: "13px",
                    }}
                  >
                    {formatCurrency(project.budget)}
                  </strong>
                </div>

                {/* HANDOVER */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginBottom: "4px",
                    }}
                  >
                    Handover
                  </div>

                  <strong
                    style={{
                      color: "#ffffff",
                      fontSize: "13px",
                    }}
                  >
                    {project.endDate || "--"}
                  </strong>
                </div>

                {/* PRIORITY */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginBottom: "4px",
                    }}
                  >
                    Priority
                  </div>

                  <strong
                    style={{
                      color: "#ffffff",
                      fontSize: "13px",
                    }}
                  >
                    {project.priority || "--"}
                  </strong>
                </div>

                {/* MANAGER */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginBottom: "4px",
                    }}
                  >
                    Manager
                  </div>

                  <strong
                    style={{
                      color: "#ffffff",
                      fontSize: "13px",
                    }}
                  >
                    {project.manager || "--"}
                  </strong>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default ClientProjects;