import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

import StatCard from "../../components/dashboard/StatCard";
import SiteProgressCategories from "../../components/siteEngineer/SiteProgressCategories";
import SiteDelayTracker from "../../components/siteEngineer/SiteDelayTracker";

import api from "../../services/api";

function AdminSiteProgress() {
  // ==========================================
  // STATES
  // ==========================================

  const [siteProgressData, setSiteProgressData] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const [formData, setFormData] = useState({
    projectId: "",
    phase: "",
    date: "",
    status: "In Progress",
    progress: 0,
    amount: "",
  });

  // ==========================================
  // LOAD SITE PROGRESS
  // ==========================================

  const fetchSiteProgress = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/site-progress");

      if (response.data.success) {
        setSiteProgressData(response.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch site progress:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");

      if (response.data?.success) {
        setProjects(response.data.data || []);
      } else {
        setProjects(response.data?.data || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch projects:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchSiteProgress();
    fetchProjects();
  }, []);

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleAddMilestone = () => {
    setEditingMilestone(null);

    setFormData({
      projectId: "",
      phase: "",
      date: "",
      status: "In Progress",
      progress: 0,
      amount: "",
    });

    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);

    setFormData({
      projectId:
        milestone.projectId?._id ||
        milestone.projectId ||
        "",
      phase: milestone.phase || "",
      date: milestone.date || "",
      status: milestone.status || "In Progress",
      progress: milestone.progress || 0,
      amount: milestone.amount || "",
    });

    setShowModal(true);
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE MILESTONE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectId) {
      alert("Please select a project.");
      return;
    }

    if (!formData.phase.trim()) {
      alert("Please enter a milestone / phase name.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        projectId: formData.projectId,
        phase: formData.phase,
        date: formData.date,
        status: formData.status,
        progress: Number(formData.progress),
        amount: formData.amount,
      };

      if (editingMilestone) {
        await api.put(
          `/milestones/${editingMilestone._id}`,
          {
            phase: formData.phase,
            date: formData.date,
            status: formData.status,
            progress: Number(formData.progress),
            amount: formData.amount,
          }
        );
      } else {
        await api.post("/milestones", payload);
      }

      setShowModal(false);
      setEditingMilestone(null);

      setFormData({
        projectId: "",
        phase: "",
        date: "",
        status: "In Progress",
        progress: 0,
        amount: "",
      });

      await fetchSiteProgress();
    } catch (error) {
      console.error(
        "Failed to save milestone:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to save milestone"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE MILESTONE
  // ==========================================

  const handleDeleteMilestone = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this milestone?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/milestones/${id}`);

      await fetchSiteProgress();
    } catch (error) {
      console.error(
        "Failed to delete milestone:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete milestone"
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading site progress...
      </div>
    );
  }

  // ==========================================
  // SAFE DEFAULT VALUES
  // ==========================================

  const stats = siteProgressData?.stats || {};

  const milestones =
    siteProgressData?.milestones || [];

  const delayedMilestones =
    siteProgressData?.delayedMilestones || [];

  // ==========================================
  // DATE
  // ==========================================

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  // ==========================================
  // INPUT STYLE
  // ==========================================

  const inputStyle = {
    width: "100%",
    padding: "9px 10px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "12px",
    boxSizing: "border-box",
  };

  return (
    <>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="welcome-section">
        <div>
          <h1>
            Site Progress & Monitoring 🗺️
          </h1>

          <p>
            Real-time construction phase progress,
            milestone bottlenecks, and field
            operations.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <button className="date-button">
            📅 Today, {today}
          </button>

          <button
            className="date-button"
            onClick={handleAddMilestone}
            style={{
              background: "#d97706",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
            }}
          >
            <Plus size={15} />
            Add Milestone
          </button>
        </div>
      </div>

      {/* ======================================
          DYNAMIC STATISTICS
      ====================================== */}

      <div className="stats-grid">
        <StatCard
          title="TOTAL ACTIVE SITES"
          value={`${stats.totalActiveSites || 0} Sites`}
          change="On Schedule"
          type="projects"
        />

        <StatCard
          title="AVERAGE COMPLETION"
          value={`${stats.averageCompletion || 0}%`}
          change="Live Progress"
          type="active"
        />

        <StatCard
          title="ACTIVE DELAYS"
          value={stats.activeDelays || 0}
          change={`${stats.criticalDelays || 0} critical`}
          type="alerts"
        />

        <StatCard
          title="FIELD ENGINEERS"
          value={`${stats.fieldEngineers || 0} On Duty`}
          change="Active"
          type="users"
        />

        <StatCard
          title="PHASES IN PROGRESS"
          value={`${stats.phasesInProgress || 0} Phases`}
          change="Verified"
          type="pending"
        />
      </div>

      {/* ======================================
          MILESTONE MANAGEMENT
      ====================================== */}

      <div
        className="dashboard-card"
        style={{
          marginBottom: "20px",
          padding: "20px",
        }}
      >
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>
              Project Milestones
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              Milestones are linked to their selected
              project.
            </p>
          </div>

          <span
            style={{
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            {milestones.length} milestone
            {milestones.length !== 1 ? "s" : ""}
          </span>
        </div>

        {milestones.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            No milestones found.
            <br />
            <button
              onClick={handleAddMilestone}
              style={{
                marginTop: "10px",
                border: "none",
                background: "none",
                color: "#d97706",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Add your first milestone
            </button>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Project
                  </th>

                  <th style={thStyle}>
                    Milestone
                  </th>

                  <th style={thStyle}>
                    Progress
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th style={thStyle}>
                    Date
                  </th>

                  <th style={thStyle}>
                    Amount
                  </th>

                  <th style={thStyle}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {milestones.map((milestone) => (
                  <tr key={milestone._id}>
                    <td style={tdStyle}>
                      <strong>
                        {milestone.project ||
                          milestone.projectId?.name ||
                          "Unknown Project"}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      {milestone.phase}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          minWidth: "100px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span>
                            {milestone.progress || 0}%
                          </span>
                        </div>

                        <div
                          style={{
                            height: "6px",
                            background: "#e2e8f0",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${
                                milestone.progress || 0
                              }%`,
                              height: "100%",
                              background: "#d97706",
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span className="status-pill">
                        {milestone.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {milestone.date || "-"}
                    </td>

                    <td style={tdStyle}>
                      {milestone.amount || "-"}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                        }}
                      >
                        <button
                          className="menu-item"
                          onClick={() =>
                            handleEditMilestone(
                              milestone
                            )
                          }
                          style={{
                            width: "auto",
                            padding: "5px 7px",
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          className="menu-item"
                          onClick={() =>
                            handleDeleteMilestone(
                              milestone._id
                            )
                          }
                          style={{
                            width: "auto",
                            padding: "5px 7px",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================
          EXISTING DASHBOARD CONTENT
      ====================================== */}

      <div className="dashboard-grid role-grid">
        <SiteProgressCategories
          milestones={milestones}
        />

        <SiteDelayTracker
          milestones={delayedMilestones}
          activeDelays={stats.activeDelays || 0}
        />
      </div>

      {/* ======================================
          ADD / EDIT MILESTONE MODAL
      ====================================== */}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="dashboard-card"
            style={{
              width: "500px",
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                margin: "0 0 5px",
              }}
            >
              {editingMilestone
                ? "Edit Milestone"
                : "Add New Milestone"}
            </h3>

            <p
              style={{
                margin: "0 0 18px",
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              Select the project first. The milestone
              will belong to that project.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* PROJECT */}

              <div>
                <label style={labelStyle}>
                  Project *
                </label>

                <select
                  required
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  disabled={!!editingMilestone}
                  style={inputStyle}
                >
                  <option value="">
                    Select project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project._id}
                      value={project._id}
                    >
                      {project.name}{" "}
                      {project.code
                        ? `(${project.code})`
                        : ""}
                    </option>
                  ))}
                </select>

                {editingMilestone && (
                  <small
                    style={{
                      color: "#94a3b8",
                      fontSize: "10px",
                    }}
                  >
                    Project cannot be changed while
                    editing. Delete and recreate it if
                    it belongs to the wrong project.
                  </small>
                )}
              </div>

              {/* PHASE */}

              <div>
                <label style={labelStyle}>
                  Milestone / Phase *
                </label>

                <input
                  required
                  name="phase"
                  type="text"
                  placeholder="e.g. Foundation Complete"
                  value={formData.phase}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* DATE + PROGRESS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Target Date
                  </label>

                  <input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Progress %
                  </label>

                  <input
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* STATUS */}

              <div>
                <label style={labelStyle}>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Not Started">
                    Not Started
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="On Track">
                    On Track
                  </option>

                  <option value="Delayed">
                    Delayed
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Verified & Approved">
                    Verified & Approved
                  </option>
                </select>
              </div>

              {/* AMOUNT */}

              <div>
                <label style={labelStyle}>
                  Amount
                </label>

                <input
                  name="amount"
                  type="text"
                  placeholder="e.g. ₹ 2.5 Cr"
                  value={formData.amount}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  className="date-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="date-button"
                  disabled={saving}
                  style={{
                    background: "#d97706",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingMilestone
                    ? "Update Milestone"
                    : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// TABLE STYLES
// ==========================================

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #e2e8f0",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 600,
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
};

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "11px",
  color: "#64748b",
  fontWeight: 600,
};

export default AdminSiteProgress;