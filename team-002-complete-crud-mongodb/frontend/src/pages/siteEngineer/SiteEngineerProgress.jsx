import { useState, useEffect } from "react";
import { Layers, CheckCircle2, Edit2 } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";
import { canEdit } from "../../utils/auth";

function SiteEngineerProgress() {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPhase, setEditingPhase] = useState(null);
  const [progressVal, setProgressVal] = useState(50);

  const isAuthorized = canEdit("site_progress");

  const fetchPhases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/site-progress");
      if (res.data?.milestones) {
        setPhases(
          res.data.milestones.map((m) => ({
            id: m._id,
            name: m.phase || "Untitled Phase",
            progress: m.progress || 0,
            status: m.status || (m.progress > 0 ? "In Progress" : "Starting"),
            statusClass: getStatusClass(m.status, m.progress),
            targetDate: m.date,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status, progress) => {
    const s = (status || "").toLowerCase();
    if (progress >= 95 || s.includes("completed") || s.includes("approved")) return "completed";
    if (progress > 0) return "in-progress";
    return "pending";
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const handleOpenEdit = (phase) => {
    setEditingPhase(phase);
    setProgressVal(phase.progress);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingPhase) return;
    const val = Number(progressVal);
    const newStatus = val >= 95 ? "Completed" : val > 20 ? "In Progress" : "Starting";

    try {
      await API.put(`/milestones/${editingPhase.id}`, { progress: val, status: newStatus });
      setEditingPhase(null);
      fetchPhases();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const activeZones = phases.filter((p) => p.progress > 0).length;
  const averageCompletion = phases.length
    ? Math.round(phases.reduce((sum, p) => sum + (p.progress || 0), 0) / phases.length)
    : 0;

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Site Construction Progress 🗺️</h1>
          <p>Phase-by-phase structural tracking, zone milestones, and progress certification.</p>
        </div>
        <button className="date-button">📅 Active Zones: {activeZones}</button>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL PHASES" value={`${phases.length} Phases`} change="Active" type="projects" />
        <StatCard title="OVERALL COMPLETION" value={`${averageCompletion}%`} change="Live" type="active" />
        <StatCard title="FOUNDATION" value="0%" change="No data" type="users" />
        <StatCard title="SUPERSTRUCTURE" value="0%" change="No data" type="pending" />
        <StatCard title="QUALITY CLEARANCE" value="0%" change="No data" type="alerts" />
      </div>

      <div className="dashboard-card site-categories-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} color="#d97706" />
            <h3>Phase Execution Progress</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Phase Data</span>
        </div>

        <div className="categories-list">
          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading site progress...</div>
          ) : phases.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No progress phases available.</div>
          ) : (
            phases.map((cat) => (
              <div className="category-item" key={cat.id} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div className="category-info">
                  <span className="category-name" style={{ fontSize: "13px" }}>{cat.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`category-status ${cat.statusClass}`}>{cat.status}</span>
                    {isAuthorized && (
                      <button
                        className="menu-item"
                        style={{ width: "auto", height: "24px", padding: "0 6px", fontSize: "11px" }}
                        onClick={() => handleOpenEdit(cat)}
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="progress-track" style={{ height: "7px", margin: "6px 0" }}>
                  <div className="progress-fill" style={{ width: `${cat.progress}%` }} />
                </div>

                <div className="category-footer">
                  <span className="category-target">Target Completion: {cat.targetDate}</span>
                  <span className="category-percent">{cat.progress}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingPhase && (
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
          <div className="dashboard-card" style={{ width: "360px" }}>
            <h3 style={{ margin: "0 0 16px" }}>Update {editingPhase.name}</h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Completion Percentage ({progressVal}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(e.target.value)}
                  style={{ width: "100%", margin: "10px 0" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="date-button" onClick={() => setEditingPhase(null)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Update Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteEngineerProgress;