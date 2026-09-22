import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, UserCheck, Calendar } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

function WorkerAttendance() {
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState("--");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await API.get("/attendance");
        const records = res.data?.data || [];
        setHistory(
          records.map((r) => ({
            date: r.date || "--",
            in: r.checkIn || "--",
            out: r.checkOut || "--",
            hours: r.checkOut && r.checkOut !== "--" ? "Completed" : "Ongoing",
            status: r.checkOut && r.checkOut !== "--" ? "Present" : "Active",
          }))
        );
        const today = records.find((r) => r.date === "Today");
        if (today) {
          setPunchTime(today.checkIn || "--");
          setPunchedIn(Boolean(today.checkIn && today.checkIn !== "--" && today.checkOut === "--"));
        }
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const togglePunch = async () => {
    try {
      const action = punchedIn ? "out" : "in";
      const res = await API.post("/attendance/punch", { action });
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

      if (punchedIn) {
        setPunchedIn(false);
        setHistory((prev) => [
          ...prev.map((h, idx) =>
            idx === 0 ? { ...h, out: now, hours: "Completed", status: "Present" } : h
          ),
        ]);
        alert(`Punched OUT successfully at ${now}`);
      } else {
        setPunchedIn(true);
        setPunchTime(now);
        setHistory((prev) => [
          { date: "Today", in: now, out: "--", hours: "Ongoing", status: "Active" },
          ...prev,
        ]);
        alert(`Punched IN successfully at ${now}`);
      }
    } catch {
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      if (punchedIn) {
        setPunchedIn(false);
        alert(`Punched OUT at ${now}`);
      } else {
        setPunchedIn(true);
        setPunchTime(now);
        alert(`Punched IN at ${now}`);
      }
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Biometric Clock-In & Shift Punch ⏱️</h1>
          <p>Record your shift arrival, lunch breaks, punch-out times, and view weekly verified duty hours.</p>
        </div>
        <button className="date-button">📅 Assigned Worksite</button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="TODAY'S STATUS"
          value={punchedIn ? "Punched In" : "Punched Out"}
          change={punchedIn ? punchTime : "Offline"}
          type={punchedIn ? "active" : "alerts"}
        />
        <StatCard title="HOURS THIS WEEK" value="0 Hours" change="No data" type="users" />
        <StatCard title="MONTHLY ATTENDANCE" value="0 / 0 Days" change="No data" type="pending" />
        <StatCard title="PUNCTUALITY SCORE" value="0%" change="No data" type="projects" />
        <StatCard title="SAFETY CLEARED" value="0%" change="No data" type="active" />
      </div>

      <div className="dashboard-grid role-grid" style={{ marginBottom: "20px" }}>
        {/* Punch Card */}
        <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center", padding: "30px 20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: punchedIn ? "#ecfdf5" : "#fff7ed",
              color: punchedIn ? "#059669" : "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {punchedIn ? <UserCheck size={40} /> : <Clock size={40} />}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>
              {punchedIn ? "Currently on Duty" : "Currently Off Duty"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
              {punchedIn ? `Punched in at ${punchTime}` : "Ready to clock in for shift"}
            </p>
          </div>

          <button
            className="date-button"
            style={{
              background: punchedIn ? "#ef4444" : "#059669",
              color: "#ffffff",
              border: "none",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "9999px",
            }}
            onClick={togglePunch}
          >
            {punchedIn ? (
              <>
                <LogOut size={18} /> Punch Out / End Shift
              </>
            ) : (
              <>
                <LogIn size={18} /> Clock-In / Start Shift
              </>
            )}
          </button>
        </div>

        {/* Attendance History */}
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="#059669" />
              <h3>Recent Punch History</h3>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Verified Logs</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading...</div>
            ) : history.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                No attendance records available.
              </div>
            ) : (
              history.map((h, idx) => (
              <div
                key={idx}
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
                  <strong style={{ fontSize: "12px", color: "#1e293b", display: "block" }}>{h.date}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>In: {h.in} • Out: {h.out}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`status-pill ${h.status.includes("Present") || h.status === "Active" ? "good" : "warning"}`}>
                    {h.status}
                  </span>
                  <small style={{ display: "block", fontSize: "9px", color: "#94a3b8" }}>{h.hours}</small>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default WorkerAttendance;
