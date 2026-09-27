import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Users, UserCheck } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

function ContractorShifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    timing: "08:00 AM – 05:00 PM",
    crewCount: 25,
    supervisor: "",
    zone: "",
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/shifts");
      if (res.data?.data) {
        setShifts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("/shifts", formData);
      setShowModal(false);
      fetchShifts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add shift");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Shift Scheduling & Duty Rosters 📅</h1>
          <p>Plan and assign workforce shifts, day and night concrete pouring rotations, and supervisor duty charts.</p>
        </div>
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
          <Plus size={16} /> Add Shift Schedule
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="ACTIVE SHIFTS" value={String(shifts.length)} change="Scheduled" type="projects" />
        <StatCard title="DAY SHIFT CREW" value="0" change="No data" type="active" />
        <StatCard title="NIGHT SHIFT CREW" value="0" change="No data" type="pending" />
        <StatCard title="TOTAL HOURS TODAY" value="0 Hours" change="No data" type="users" />
        <StatCard title="SUPERVISOR COVERAGE" value="0%" change="No data" type="alerts" />
      </div>

      <div className="dashboard-grid role-grid">
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading shifts...</div>
        ) : shifts.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "30px", textAlign: "center", color: "#64748b" }}>No shifts available.</div>
        ) : (
          shifts.map((s) => (
            <div className="dashboard-card" key={s._id || s.id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="status-pill good">Active Shift</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{s.zone}</span>
              </div>

              <h3 style={{ margin: "2px 0", fontSize: "14px", color: "#1e293b" }}>{s.name}</h3>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
                <Clock size={14} color="#d97706" />
                <strong>{s.timing}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                <span>Supervisor: <strong>{s.supervisor}</strong></span>
                <span>Crew: <strong>{s.crewCount} Workers</strong></span>
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
          <div className="dashboard-card" style={{ width: "380px" }}>
            <h3 style={{ margin: "0 0 16px" }}>Add Shift Schedule</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Shift Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Plastering Shift"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Timing</label>
                <input
                  type="text"
                  required
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Crew Size</label>
                  <input
                    type="number"
                    value={formData.crewCount}
                    onChange={(e) => setFormData({ ...formData, crewCount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Zone</label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Add Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ContractorShifts;
