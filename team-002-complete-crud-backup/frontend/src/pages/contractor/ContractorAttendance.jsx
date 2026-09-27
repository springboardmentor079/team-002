import { useState, useEffect } from "react";
import { Users, Plus, CheckCircle2, UserCheck } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";
import WorkforceTradeAllocation from "../../components/contractor/WorkforceTradeAllocation";

function ContractorAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    trade: "Masons & Structural",
    site: "",
    status: "Present",
  });

  const isAuthorized = canEdit("attendance");

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const attendanceRate =
    attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 0;
  const masonsCount = attendance.filter((a) => a.trade === "Masons & Structural").length;
  const electriciansCount = attendance.filter((a) => a.trade === "Electricians & MEP").length;

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance");
      if (res.data?.data) {
        setAttendance(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("/attendance", formData);
      setShowModal(false);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to log attendance");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Crew Daily Attendance 👥</h1>
          <p>Mark crew presence, log trade rosters, and verify biometric punch logs.</p>
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
            <Plus size={16} /> Log Crew Member
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL CREW TODAY" value={String(presentCount)} change="Present" type="users" />
        <StatCard title="ATTENDANCE RATE" value={`${attendanceRate}%`} change="Live" type="active" />
        <StatCard title="MASONS & STRUCTURAL" value={`${masonsCount} Active`} change="Live" type="projects" />
        <StatCard title="ELECTRICIANS" value={`${electriciansCount} Active`} change="Live" type="pending" />
        <StatCard title="SAFETY CLEARED" value="0%" change="No data" type="alerts" />
      </div>

      <div className="dashboard-grid role-grid">
        <WorkforceTradeAllocation />

        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UserCheck size={18} color="#059669" />
              <h3>Site Attendance Muster</h3>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Live Check-in</span>
          </div>

          {loading ? (
            <div style={{ padding: "30px", textAlign: "center" }}>Loading attendance...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {attendance.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No attendance records available.</div>
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
                    <div style={{ textAlign: "right" }}>
                      <span className="status-pill good">{att.status}</span>
                      <small style={{ display: "block", fontSize: "9px", color: "#94a3b8" }}>{att.checkIn}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
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
            <h3 style={{ margin: "0 0 16px" }}>Log Crew Member</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Worker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Trade Category</label>
                <select
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                >
                  <option value="Masons & Structural">Masons & Structural</option>
                  <option value="Electricians & MEP">Electricians & MEP</option>
                  <option value="Carpenters & Riggers">Carpenters & Riggers</option>
                  <option value="General Site Labor">General Site Labor</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Worksite Zone</label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
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

export default ContractorAttendance;
