import { useState, useEffect } from "react";
import { AlertTriangle, Plus, CheckCircle2, Clock } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";
import { canEdit } from "../../utils/auth";

function SiteEngineerDelays() {
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    due: "15 Apr 2026",
    delay: "+2 days (Supplier)",
    status: "Delayed",
  });

  const isAuthorized = canEdit("delays");

  const fetchDelays = async () => {
    try {
      setLoading(true);
      const res = await API.get("/delays");
      if (res.data?.data) {
        setDelays(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelays();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("/delays", {
        name: formData.name,
        due: formData.due,
        delay: formData.delay,
        status: formData.status,
      });
      setShowModal(false);
      fetchDelays();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to log delay");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Site Delays & Bottlenecks ⚠️</h1>
          <p>Log weather disruptions, supply chain delays, structural clashes, and critical path recovery.</p>
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
            <Plus size={16} /> Report Site Delay
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="TRACKED BOTTLENECKS" value={String(delays.length)} change="No data" type="projects" />
        <StatCard title="ACTIVE DELAYS" value="0 Critical" change="No data" type="alerts" />
        <StatCard title="AVG DELAY RECOVERY" value="0 Days" change="No data" type="active" />
        <StatCard title="WEATHER STOPPAGES" value="0 Incidents" change="No data" type="pending" />
        <StatCard title="SUPPLY DISRUPTIONS" value="0 Items" change="No data" type="users" />
      </div>

      <div className="dashboard-card site-delay-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} color="#ef4444" />
            <h3>Milestone & Delay Tracker</h3>
          </div>
          <span className="delay-alert-pill">Live Bottlenecks</span>
        </div>

        <div className="delay-list">
          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading delays...</div>
          ) : delays.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No delays available.</div>
          ) : (
          delays.map((item) => {
            const badgeType = item.badgeType || (item.status === "Delayed" ? "warning" : item.status === "At Risk" ? "danger" : "good");
            const Icon = badgeType === "good" ? CheckCircle2 : badgeType === "warning" ? AlertTriangle : Clock;
            return (
              <div className="delay-item" key={item._id || item.id}>
                <div className={`delay-icon-box ${badgeType}`}>
                  <Icon size={16} />
                </div>

                <div className="delay-details">
                  <strong>{item.name}</strong>
                  <span>Due Date: {item.due}</span>
                </div>

                <div className="delay-status-col">
                  <span className={`status-pill ${badgeType}`}>{item.status}</span>
                  <small>{item.delay}</small>
                </div>
              </div>
            );
          })
          )}
        </div>
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
            <h3 style={{ margin: "0 0 16px" }}>Report Site Delay</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Activity / Phase Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Conduit Routing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Target Due Date</label>
                <input
                  type="text"
                  value={formData.due}
                  onChange={(e) => setFormData({ ...formData, due: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Delay Impact & Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +3 days (Weather rain)"
                  value={formData.delay}
                  onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Log Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteEngineerDelays;
