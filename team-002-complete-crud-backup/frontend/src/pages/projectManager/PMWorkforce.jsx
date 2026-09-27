import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import WorkforceTradeAllocation from "../../components/contractor/WorkforceTradeAllocation";
import API from "../../services/api";

function PMWorkforce() {
  const [attendance, setAttendance] = useState([]);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    trade: "General Site Labor",
    site: "Main Construction Site",
    status: "Present",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance");
      if (res.data?.data) setAttendance(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.userName) {
      setError("Worker name is required.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/attendance", {
        userName: formData.userName,
        trade: formData.trade,
        site: formData.site,
        status: formData.status,
      });
      setShowAddModal(false);
      setFormData({
        userName: "",
        trade: "General Site Labor",
        site: "Main Construction Site",
        status: "Present",
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to log attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const workforceTradeData = useMemo(() => {
    const counts = {
      "Supervisors & Engineers": 0,
      "Masons & Structural": 0,
      "Electricians & MEP": 0,
      "Carpenters & Riggers": 0,
      "General Site Labor": 0,
    };

    if (Array.isArray(attendance)) {
      attendance.forEach((record) => {
        const status = (record.status || "Present").trim().toLowerCase();
        if (status === "absent") return;

        const trade = (record.trade || "").trim().toLowerCase();
        if (trade.includes("supervisor") || trade.includes("engineer")) {
          counts["Supervisors & Engineers"] += 1;
        } else if (
          trade.includes("mason") ||
          trade.includes("structural") ||
          trade.includes("rebar")
        ) {
          counts["Masons & Structural"] += 1;
        } else if (
          trade.includes("electri") ||
          trade.includes("mep") ||
          trade.includes("plumb")
        ) {
          counts["Electricians & MEP"] += 1;
        } else if (
          trade.includes("carpenter") ||
          trade.includes("rigger")
        ) {
          counts["Carpenters & Riggers"] += 1;
        } else {
          counts["General Site Labor"] += 1;
        }
      });
    }

    return [
      {
        name: "Supervisors & Engineers",
        value: counts["Supervisors & Engineers"],
        color: "#3b82f6",
      },
      {
        name: "Masons & Structural",
        value: counts["Masons & Structural"],
        color: "#f59e0b",
      },
      {
        name: "Electricians & MEP",
        value: counts["Electricians & MEP"],
        color: "#10b981",
      },
      {
        name: "Carpenters & Riggers",
        value: counts["Carpenters & Riggers"],
        color: "#8b5cf6",
      },
      {
        name: "General Site Labor",
        value: counts["General Site Labor"],
        color: "#64748b",
      },
    ];
  }, [attendance]);

  return (
    <>
      <div className="pm-welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1>Workforce Deployment 👥</h1>
          <p>Subcontractor deployment, crew attendance, and trade rosters across active project sites.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Plus size={16} />
          Log Attendance
        </button>
      </div>

      <div className="dashboard-grid role-grid">
        <WorkforceTradeAllocation data={workforceTradeData} />

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Active Duty Personnel</h3>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Live Attendance</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {attendance.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                No personnel on duty.
              </div>
            ) : (
            attendance.map((att) => (
              <div
                key={att._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <strong style={{ fontSize: "12px", color: "#1e293b", display: "block" }}>{att.userName}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>{att.trade} • {att.site}</span>
                </div>
                <span className="status-pill good">{att.status}</span>
              </div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* Log Attendance Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", color: "#1e293b" }}>Log Worker Attendance</h2>
            {error && (
              <div style={{ padding: "8px", background: "#fee2e2", color: "#ef4444", borderRadius: "4px", marginBottom: "16px", fontSize: "13px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Worker Name *</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Trade</label>
                <select
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                >
                  <option value="General Site Labor">General Site Labor</option>
                  <option value="Supervisors & Engineers">Supervisors & Engineers</option>
                  <option value="Masons & Structural">Masons & Structural</option>
                  <option value="Electricians & MEP">Electricians & MEP</option>
                  <option value="Carpenters & Riggers">Carpenters & Riggers</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Site Location</label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "white", borderRadius: "4px", cursor: "pointer", color: "#475569", fontWeight: 600 }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", border: "none", background: "#2563eb", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}
                  disabled={submitting}
                >
                  {submitting ? "Logging..." : "Log Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default PMWorkforce;
