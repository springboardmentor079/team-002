import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, UserCheck, Calendar } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

function WorkerAttendance() {
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState("--");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance");
      const records = res.data?.data || res.data || [];
      
      const formatted = records.map((r) => ({
        date: r.date || new Date(r.createdAt).toLocaleDateString('en-IN'),
        in: r.checkIn || r.punchIn || "--",
        out: r.checkOut || r.punchOut || "--",
        hours: (r.checkOut || r.punchOut) ? "Completed" : "Ongoing",
        status: (r.checkOut || r.punchOut) ? "Present" : "Active",
        rawDate: r.date
      }));
      setHistory(formatted);

      // Aaj ka record check karo
      const todayStr = new Date().toLocaleDateString('en-IN');
      const todayRecord = formatted.find(h => h.date === todayStr || h.rawDate === "Today" || h.date === "Today");
      
      if (todayRecord && todayRecord.in !== "--" && todayRecord.out === "--") {
        setPunchTime(todayRecord.in);
        setPunchedIn(true);
      } else {
        setPunchedIn(false);
      }
    } catch (err) {
      console.log("Attendance fetch error", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const togglePunch = async () => {
    try {
      const action = punchedIn ? "out" : "in";
      const res = await API.post("/attendance/punch", { action });
      
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const serverTime = res.data?.checkIn || res.data?.data?.checkIn || now;

      if (punchedIn) {
        // Punch OUT
        setPunchedIn(false);
        setHistory((prev) => prev.map((h, idx) => idx === 0 ? { ...h, out: now, hours: "Completed", status: "Present" } : h));
        alert(`Punched OUT successfully at ${now}`);
      } else {
        // Punch IN
        setPunchedIn(true);
        setPunchTime(serverTime);
        alert(`Punched IN successfully at ${serverTime}`);
      }
      // Refresh from server
      setTimeout(fetchAttendance, 500);
    } catch (err) {
      alert(err.response?.data?.message || "Punch failed, check backend /attendance/punch route");
      console.error(err);
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
        <StatCard title="HOURS THIS WEEK" value={`${history.length * 8} Hours`} change={history.length > 0 ? "Calculated" : "No data"} type="users" />
        <StatCard title="MONTHLY ATTENDANCE" value={`${history.filter(h=>h.status==='Present').length} / ${history.length} Days`} change="This month" type="pending" />
        <StatCard title="PUNCTUALITY SCORE" value={history.length > 0 ? "100%" : "0%"} change={history.length > 0 ? "Good" : "No data"} type="projects" />
        <StatCard title="SAFETY CLEARED" value="100%" change="Verified" type="active" />
      </div>

      <div className="dashboard-grid role-grid" style={{ marginBottom: "20px" }}>
        <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center", padding: "30px 20px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: punchedIn ? "#ecfdf5" : "#fff7ed", color: punchedIn ? "#059669" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {punchedIn ? <UserCheck size={40} /> : <Clock size={40} />}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>{punchedIn ? "Currently on Duty" : "Currently Off Duty"}</h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>{punchedIn ? `Punched in at ${punchTime}` : "Ready to clock in for shift"}</p>
          </div>
          <button className="date-button" style={{ background: punchedIn ? "#ef4444" : "#059669", color: "#ffffff", border: "none", padding: "12px 28px", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", borderRadius: "9999px" }} onClick={togglePunch}>
            {punchedIn ? <><LogOut size={18} /> Punch Out / End Shift</> : <><LogIn size={18} /> Clock-In / Start Shift</>}
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={18} color="#059669" /><h3>Recent Punch History</h3></div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Verified Logs</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading...</div> : history.length === 0 ? <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No attendance records available.</div> : history.map((h, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#f8fafc", borderRadius: "8px" }}>
                <div><strong style={{ fontSize: "12px", color: "#1e293b", display: "block" }}>{h.date}</strong><span style={{ fontSize: "10px", color: "#64748b" }}>In: {h.in} • Out: {h.out}</span></div>
                <div style={{ textAlign: "right" }}><span className={`status-pill ${h.status.includes("Present") || h.status === "Active" ? "good" : "warning"}`}>{h.status}</span><small style={{ display: "block", fontSize: "9px", color: "#94a3b8" }}>{h.hours}</small></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export default WorkerAttendance;