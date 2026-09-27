import { useState, useEffect } from "react";
import { HardHat, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function SiteEngineerInspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Inspection",
    location: "Block B - Level 3 Slab",
    summary: "",
    status: "Approved",
  });

  const isAuthorized = canEdit("inspections");

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports?type=Inspection");
      if (res.data?.data) {
        setInspections(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/reports", formData);
      setShowModal(false);
      fetchInspections();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Site Quality Inspections 🦺</h1>
          <p>Structural rebar audits, slump workability tests, MEP conduit inspections, and safety checks.</p>
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
            <Plus size={16} /> Record Inspection
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="INSPECTIONS LOGGED" value={String(inspections.length)} change="No data" type="projects" />
        <StatCard title="PASS RATE" value="0%" change="No data" type="active" />
        <StatCard title="CRITICAL SNAGS" value="0" change="No data" type="users" />
        <StatCard title="PENDING TESTS" value="0 Scheduled" change="No data" type="pending" />
        <StatCard title="SAFETY COMPLIANCE" value="0%" change="No data" type="alerts" />
      </div>

      <div className="dashboard-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HardHat size={18} color="#3b82f6" />
            <h3>Inspection Check Records</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Quality Audit</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading inspections...</div>
        ) : (
          <div className="site-logs-list">
            {inspections.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No inspections available.</div>
            ) : (
            inspections.map((log) => (
              <div className="site-log-item" key={log._id}>
                <div className="log-icon-wrap inspection">
                  <CheckCircle2 size={16} />
                </div>
                <div className="log-details">
                  <strong>{log.title}</strong>
                  <span>{log.location}</span>
                  <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#64748b" }}>{log.summary}</p>
                </div>
                <div className="log-meta">
                  <span className="log-badge inspection">{log.status}</span>
                  <small>{log.date}</small>
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
          <div className="dashboard-card" style={{ width: "380px" }}>
            <h3 style={{ margin: "0 0 16px" }}>Record Site Inspection</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Inspection Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Column Curing & Strength Test"
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
                <label style={{ fontSize: "11px", color: "#64748b" }}>Observations & Measurements</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Rebar spacing verified, slump value 115mm..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteEngineerInspections;
