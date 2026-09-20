import { useEffect, useState } from "react";
import StatCard from "../../components/dashboard/StatCard";
import { Calendar, MapPin, Clock } from "lucide-react";
import api from "../../services/api";

function WorkerShifts() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/worker").then(res => {
      if(res.data.success) setData(res.data);
    }).catch(()=>{});
  }, []);

  const stats = data?.stats || {};
  const today = data?.todayRecord || {};
  const site = today.site || stats.assignedSite || "Skyline Heights - Tower A";

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Weekly Duty & Shift Schedule 📅</h1>
          <p>Review upcoming shift timings, worksite zone relocations, and allocated supervisor leads.</p>
        </div>
        <button className="date-button">📅 Roster</button>
      </div>

      <div className="stats-grid">
        <StatCard title="TODAY'S SHIFT" value={today.shift || "Day Shift"} change={today.checkIn || "09:00 AM"} type="active" />
        <StatCard title="ASSIGNED SITE" value={site} change="Active" type="projects" />
        <StatCard title="SUPERVISOR LEAD" value={stats.supervisor || "Site Manager"} change="Assigned" type="users" />
        <StatCard title="PLANNED HOURS" value="48.0 hrs" change="This week" type="pending" />
        <StatCard title="SAFETY GEAR" value="85% Verified" change="Cleared" type="alerts" />
      </div>

      <div className="dashboard-grid role-grid" style={{ marginBottom: "20px" }}>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Today's Shift & Duty Status</h3>
            <span className="status-pill good">Verified</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{color:"#64748b", fontSize:"12px", display:"flex", gap:"6px"}}><MapPin size={14}/> Site</span><strong style={{fontSize:"12px"}}>{site}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{color:"#64748b", fontSize:"12px", display:"flex", gap:"6px"}}><Clock size={14}/> Check-In</span><strong style={{fontSize:"12px"}}>{today.checkIn || "--"}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{color:"#64748b", fontSize:"12px"}}>Shift</span><strong style={{fontSize:"12px"}}>{today.shift || "Day Shift"}</strong></div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="#0d9488" />
              <h3>Weekly Work Schedule</h3>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Assigned Shifts</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding:"12px", background:"#f0fdfa", borderRadius:"8px" }}>
              <strong style={{fontSize:"12px"}}>Mon - Sat • {today.shift || "Day Shift"}</strong><br/>
              <span style={{fontSize:"11px", color:"#0f766e"}}>{site} | 09:00 AM - 06:00 PM</span>
            </div>
            <div style={{ padding:"12px", background:"#f8fafc", borderRadius:"8px" }}>
              <strong style={{fontSize:"12px"}}>Sunday - Weekly Off</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default WorkerShifts;