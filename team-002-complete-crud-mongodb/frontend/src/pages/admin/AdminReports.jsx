import { useState, useEffect } from "react";
import { FileBarChart, Plus, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Daily Progress",
    location: "Main Campus",
    summary: "",
    snagsFound: 0,
    status: "Approved",
  });

  const isAuthorized = canEdit("reports");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports");
      if (res.data && res.data.data) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
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
      alert(err.response?.data?.message || "Failed to log report");
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Title,Type,Author,Date,Location,Status", ...reports.map((r) => `"${r.title}","${r.type}","${r.author}","${r.date}","${r.location}","${r.status}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "BuildTrack_Reports_Summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = reports.filter((r) => filterType === "All" || r.type === filterType);

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Site & Executive Reports 📊</h1>
          <p>Quality inspections, structural compliance sign-offs, daily workforce counts, and audit logs.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="date-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={handleExport}
          >
            <Download size={15} /> Export CSV
          </button>
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
              <Plus size={16} /> Log Report
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL REPORTS" value={String(reports.length)} change="Logged" type="projects" />
        <StatCard title="INSPECTIONS PASSED" value="0%" change="No data" type="active" />
        <StatCard title="AUDIT SNAGS OPEN" value="0" change="No data" type="alerts" />
        <StatCard
          title="APPROVED SIGN-OFFS"
          value={String(reports.filter((r) => r.status === "Approved").length)}
          change="Quality lead"
          type="users"
        />
        <StatCard title="REPORT COMPLIANCE" value="0%" change="No data" type="pending" />
      </div>

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["All", "Daily Progress", "Inspection", "Safety & Audit", "Quality"].map((type) => (
          <button
            key={type}
            className={`menu-item ${filterType === type ? "active" : ""}`}
            style={{ width: "auto", height: "32px", padding: "0 12px", borderRadius: "6px" }}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="dashboard-grid role-grid">
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No reports available.</div>
        ) : (
          filtered.map((rep) => (
            <div className="dashboard-card" key={rep._id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="status-pill good">{rep.type}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>{rep.date}</span>
              </div>
              <h3 style={{ margin: "2px 0", fontSize: "14px", color: "#1e293b" }}>{rep.title}</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{rep.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                <span>Location: {rep.location}</span>
                <span>By: {rep.author}</span>
              </div>
            </div>
          ))
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
            <h3 style={{ margin: "0 0 16px" }}>Log Site Report</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slab Rebar Verification"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Report Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                >
                  <option value="Daily Progress">Daily Progress</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Safety & Audit">Safety & Audit</option>
                  <option value="Quality">Quality</option>
                </select>
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
                <label style={{ fontSize: "11px", color: "#64748b" }}>Summary / Notes</label>
                <textarea
                  rows="3"
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReports;
