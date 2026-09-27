import { useState, useEffect } from "react";
import { Flag, CheckCircle2, Clock, Calendar, Edit2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function SiteEngineerMilestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newProgress, setNewProgress] = useState(0);

  const isAuthorized = canEdit("milestones");

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await API.get("/milestones");
      if (res.data?.data) {
        setMilestones(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleOpenEdit = (m) => {
    setEditingMilestone(m);
    setNewProgress(m.progress);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const p = Number(newProgress);
      const status = p === 100 ? "Verified & Approved" : p > 0 ? `${p}% On Track` : "Upcoming";
      await API.put(`/milestones/${editingMilestone._id}`, { progress: p, status });
      setEditingMilestone(null);
      fetchMilestones();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Site Milestones & Sign-offs 🚩</h1>
          <p>Track stage completion percentages, verify structural checks, and authorize milestone certificates.</p>
        </div>
        <button className="date-button">
          📅{" "}
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL MILESTONES" value={String(milestones.length)} change="Roadmap" type="projects" />
        <StatCard
          title="COMPLETED & SIGNED"
          value={String(milestones.filter((m) => m.progress === 100).length)}
          change="Verified"
          type="active"
        />
        <StatCard
          title="IN PROGRESS"
          value={String(milestones.filter((m) => m.progress > 0 && m.progress < 100).length)}
          change="No data"
          type="users"
        />
        <StatCard title="UPCOMING PHASES" value="0 Phases" change="No data" type="pending" />
        <StatCard title="INSPECTION PASS" value="0%" change="No data" type="alerts" />
      </div>

      <div className="dashboard-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Flag size={18} color="#7c3aed" />
            <h3>Milestone Execution List</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Sign-off Track</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading milestones...</div>
        ) : (
          <div className="client-timeline-list">
            {milestones.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No milestones available.</div>
            ) : (
            milestones.map((m, idx) => (
              <div className="timeline-row" key={m._id} style={{ alignItems: "center" }}>
                <div className={`timeline-marker ${m.badge || "progress"}`}>
                  {m.progress === 100 ? <CheckCircle2 size={14} /> : <span>{idx + 1}</span>}
                </div>

                <div className="timeline-content" style={{ flex: 1 }}>
                  <div className="timeline-header">
                    <strong>{m.phase}</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`timeline-badge ${m.badge || "progress"}`}>{m.status}</span>
                      {isAuthorized && (
                        <button
                          className="menu-item"
                          style={{ width: "auto", height: "24px", padding: "0 6px" }}
                          onClick={() => handleOpenEdit(m)}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="timeline-track" style={{ margin: "6px 0" }}>
                    <div className={`timeline-fill ${m.badge || "progress"}`} style={{ width: `${m.progress}%` }} />
                  </div>

                  <div className="timeline-footer">
                    <span className="timeline-date">
                      <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
                      {m.date}
                    </span>
                    <span className="timeline-pct">{m.progress}%</span>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        )}
      </div>

      {editingMilestone && (
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
          <div className="dashboard-card" style={{ width: "380px" }}>
            <h3 style={{ margin: "0 0 16px" }}>Update Milestone Progress</h3>
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#1e293b", fontWeight: 600 }}>{editingMilestone.phase}</p>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Progress: {newProgress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  style={{ width: "100%", margin: "10px 0" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="date-button" onClick={() => setEditingMilestone(null)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Save Sign-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteEngineerMilestones;
