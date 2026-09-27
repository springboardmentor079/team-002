import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, FileText, CheckCircle2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function SiteEngineerDailyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Daily Progress",
    location: "",
    summary: "",
    snagsFound: 0,
  });

  const isAuthorized = canEdit("daily_reports");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports?type=Daily Progress");
      if (res.data?.data) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/reports", formData);
      setShowModal(false);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to log daily report");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Daily Site Reports 📋</h1>
          <p>Submit daily shift progress, workforce muster counts, weather stoppages, and site activities.</p>
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
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Log Daily Report
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="DAILY LOGS FILED" value={String(reports.length)} change="No data" type="projects" />
        <StatCard title="SITE CREW LOGGED" value="0" change="No data" type="users" />
        <StatCard title="WEATHER CONDITIONS" value="N/A" change="No data" type="active" />
        <StatCard title="DAILY CONCRETE CAST" value="0 m³" change="No data" type="pending" />
        <StatCard title="SUPERVISOR SIGN-OFFS" value="0 Verified" change="No data" type="alerts" />
      </div>

      <div className="dashboard-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardCheck size={18} color="#10b981" />
            <h3>Daily Reports History</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Field Records</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading daily reports...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reports.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No daily reports available.</div>
            ) : (
            reports.map((rep) => (
              <div
                key={rep._id}
                style={{
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "13px", color: "#1e293b" }}>{rep.title}</strong>
                  <span className="status-pill good">{rep.status}</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{rep.summary}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                  <span>Location: {rep.location}</span>
                  <span>Logged on: {rep.date} by {rep.author}</span>
                </div>
              </div>
            ))
            )}
          </div>
        )}
      </div>

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
          <div className="dashboard-card" style={{ width: "400px" }}>
            <h3 style={{ margin: "0 0 16px" }}>Log Daily Site Report</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Progress Log - Level 12 Slab"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Location / Zone</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Work Summary & Notes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Work completed, workforce counts, batching summary..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteEngineerDailyReports;
