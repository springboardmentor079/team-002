import { useState, useEffect } from "react";
import { Plus, Search, FolderKanban, CheckCircle2, AlertTriangle, Clock, Trash2, Edit2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";

function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [clients, setClients] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    client: "",
    clientId: "",
    budget: "",
    status: "On Track",
    progress: 0,
    startDate: "",
    endDate: "",
  });

  const isAuthorized = canEdit("projects");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/projects");
      if (res.data && res.data.data) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    API.get("/users/clients").then(res => setClients(res.data?.data || [])).catch(err => console.error("Failed to fetch clients:", err));
  }, []);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      code: "PRJ-" + Math.floor(1000 + Math.random() * 9000),
      client: "",
      clientId: "",
      budget: "",
      status: "On Track",
      progress: 0,
      startDate: "",
      endDate: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      code: proj.code,
      client: proj.client,
      clientId: proj.clientId || "",
      budget: proj.budget,
      status: proj.status,
      progress: proj.progress,
      startDate: proj.startDate,
      endDate: proj.endDate,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await API.put(`/projects/${editingProject._id}`, formData);
      } else {
        await API.post("/projects", formData);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* HEADER SECTION */}
      <div className="welcome-section" style={{ marginBottom: "20px" }}>
        <div>
          <h1>Projects Management 📁</h1>
          <p>Active infrastructure, residential towers, and commercial developments.</p>
        </div>

        {isAuthorized && (
          <button
            className="date-button"
            style={{
              background: "#d97706",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            Add Project
          </button>
        )}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div
        className="dashboard-card"
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "14px 18px",
        }}
      >
        <div className="search-box" style={{ width: "280px" }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search projects by name, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "On Track", "Delayed", "At Risk", "Completed"].map((status) => (
            <button
              key={status}
              className={`menu-item ${filterStatus === status ? "active" : ""}`}
              style={{
                width: "auto",
                height: "32px",
                padding: "0 12px",
                borderRadius: "6px",
                fontSize: "11px",
              }}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECTS GRID */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No projects found matching the criteria.
        </div>
      ) : (
        <div className="dashboard-grid role-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
          {filtered.map((proj) => (
            <div className="dashboard-card" key={proj._id} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>{proj.code}</span>
                  <h3 style={{ margin: "2px 0 4px", fontSize: "14px", color: "#1e293b" }}>{proj.name}</h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Client: {proj.client}</span>
                </div>
                <span
                  className={`status-pill ${
                    proj.status === "On Track" ? "good" : proj.status === "Delayed" ? "warning" : "danger"
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "#64748b" }}>Progress</span>
                  <strong style={{ color: "#1e293b" }}>{proj.progress}%</strong>
                </div>
                <div className="progress-track" style={{ height: "6px" }}>
                  <div className="progress-fill" style={{ width: `${proj.progress}%` }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                <span>Budget: <strong style={{ color: "#1e293b" }}>{proj.budget}</strong></span>
                <span>Deadline: <strong style={{ color: "#1e293b" }}>{proj.endDate}</strong></span>
              </div>

              {isAuthorized && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                  <button
                    className="menu-item"
                    style={{ width: "auto", height: "28px", padding: "0 8px", fontSize: "11px" }}
                    onClick={() => handleOpenEdit(proj)}
                  >
                    <Edit2 size={13} style={{ marginRight: "4px" }} /> Edit
                  </button>
                  <button
                    className="menu-item"
                    style={{ width: "auto", height: "28px", padding: "0 8px", fontSize: "11px", color: "#ef4444" }}
                    onClick={() => handleDelete(proj._id)}
                  >
                    <Trash2 size={13} style={{ marginRight: "4px" }} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="dashboard-card" style={{ width: "420px", maxWidth: "95%" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>
              {editingProject ? "Edit Project" : "Create New Project"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Assign Client</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => { const c = clients.find(x => x._id === e.target.value); setFormData({ ...formData, clientId: e.target.value, client: c?.name || "" }); }}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                >
                  <option value="">Select client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} — {c.email}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Budget</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                  >
                    <option value="On Track">On Track</option>
                    <option value="Delayed">Delayed</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Target End Date</label>
                  <input
                    type="text"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="date-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="date-button"
                  style={{ background: "#d97706", color: "#ffffff", border: "none" }}
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminProjects;
