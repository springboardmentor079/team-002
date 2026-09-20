import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import { LogOut, AlertOctagon, Wallet, Calendar, MapPin, Clock, ShieldCheck } from "lucide-react";
import api from "../../services/api";

function WorkerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Brick Masonry & Plastering", zone: "Zone: Tower A - Floor 4", status: "In Progress", done: false },
    { id: 2, title: "External Drainage Pipeline", zone: "Zone: Perimeter Trench", status: "Delayed", done: false },
    { id: 3, title: "Internal Electrical Conduit Laying", zone: "Zone: Floors 3 to 8", status: "On Schedule", done: false },
    { id: 4, title: "RCC Frame Casting - Block C", zone: "Zone: Block C Core", status: "On Schedule", done: false },
  ]);

  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
      return u.name || "khushi sharma";
    } catch { return "khushi sharma"; }
  })();

  useEffect(() => {
    api.get("/dashboard/worker").then(res => {
      if(res.data.success) setDashboardData(res.data);
    }).catch(()=>{});
  }, []);

  const stats = dashboardData?.stats || {};
  const today = dashboardData?.todayRecord || {};
  const site = today.site || stats.assignedSite || "Main Construction Site";
  const checkIn = today.checkIn || stats.checkIn || "10:02 pm";
  const punchedIn = Boolean(today.checkIn || stats.checkIn);

  const doneCount = tasks.filter(t=>t.done).length;

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Welcome back, {userName}! 🔨</h1>
          <p>Daily shift assignments, task checklists, and site safety protocols.</p>
        </div>
        <button className="date-button">📅 Today, {new Date().toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"})}</button>
      </div>

      <div className="stats-grid">
        <StatCard title="ASSIGNED SITE" value={site} change="Active from last month" type="projects" />
        <StatCard title="TODAY'S STATUS" value={punchedIn ? "Punched In" : "Not Punched"} change={checkIn} type="active" />
        <StatCard title="PENDING TASKS" value={tasks.length - doneCount} change={`${doneCount} completed from last month`} type="users" />
        <StatCard title="ATTENDANCE TODAY" value={punchedIn ? "Punched" : "Pending"} change={`${stats.attendanceRate || 85}% rate from last month`} type="pending" />
        <StatCard title="SAFETY COMPLIANCE" value={`${stats.safetyCompliance || 85}%`} change="Pending from last month" type="alerts" />
      </div>

      <div className="dashboard-grid role-grid">
        
        {/* 1. Shift Info */}
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{display:"flex", alignItems:"center", gap:"6px"}}><Clock size={16}/><h3>Today's Shift & Duty Status</h3></div>
            <span style={{fontSize:"10px", background:"#f0fdf4", padding:"4px 8px", borderRadius:"99px", color:"#059669"}}>Punched in ({checkIn})</span>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:"14px", padding:"10px 0"}}>
            <div><div style={{display:"flex", alignItems:"center", gap:"4px", color:"#64748b", fontSize:"10px"}}><MapPin size={12}/> ACTIVE WORKSITE</div><strong style={{fontSize:"13px"}}>{site}</strong><div style={{fontSize:"10px", color:"#94a3b8"}}>Assigned Zone: Main Worksite</div></div>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <div><div style={{fontSize:"10px", color:"#64748b"}}>SHIFT HOURS</div><strong style={{fontSize:"12px"}}>Day Shift</strong><div style={{fontSize:"9px", color:"#94a3b8"}}>Day Shift (9 hrs incl. lunch)</div></div>
              <div><div style={{fontSize:"10px", color:"#64748b"}}>STATUS TODAY</div><strong style={{fontSize:"11px"}}>Punched in at {checkIn}</strong></div>
            </div>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <div><div style={{fontSize:"10px", color:"#64748b"}}>Trade / Category</div><strong style={{fontSize:"11px"}}>Electricians & MEP</strong></div>
              <div><div style={{fontSize:"10px", color:"#64748b"}}>Safety Clearance</div><div style={{display:"flex", alignItems:"center", gap:"4px", color:"#059669", fontSize:"11px", fontWeight:700}}><ShieldCheck size={12}/> Verified</div></div>
            </div>
          </div>
        </div>

        {/* 2. Tasks */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Assigned Duties for Today</h3>
            <span style={{fontSize:"11px", color:"#64748b"}}>{doneCount} of {tasks.length} Done</span>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            {tasks.map(t=>(
              <label key={t.id} style={{display:"flex", gap:"10px", padding:"8px", background: t.done ? "#f0fdf4" : "#f8fafc", borderRadius:"8px", cursor:"pointer"}}>
                <input type="checkbox" checked={t.done} onChange={()=> setTasks(prev=> prev.map(x=> x.id===t.id ? {...x, done: !x.done} : x))} />
                <div style={{flex:1}}><div style={{fontSize:"12px", fontWeight:600, textDecoration: t.done ? "line-through" : "none"}}>{t.title}</div><div style={{fontSize:"10px", color:"#64748b"}}>{t.zone}</div></div>
                <span style={{fontSize:"9px", color:"#d97706"}}>{t.status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Safety */}
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{display:"flex", alignItems:"center", gap:"6px"}}><ShieldCheck size={16} color="#059669"/><h3>Mandatory PPE & Safety Clearance</h3></div>
            <span className="status-pill good">85% Cleared</span>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
            {[
              {l:"Safety Helmet", v:true},
              {l:"Safety Shoes", v:true},
              {l:"Reflective Jacket", v:true},
              {l:"Gloves & Harness", v:true},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex", justifyContent:"space-between", padding:"8px 10px", background:"#f0fdf4", borderRadius:"8px"}}>
                <span style={{fontSize:"12px"}}>{s.l}</span><span style={{fontSize:"12px"}}>{s.v ? "✅ Verified" : "❌ Pending"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header"><h3>Worker Actions</h3></div>
          <div className="quick-actions-list">
            <button className="quick-action-item" onClick={()=> navigate("/worker/attendance")}><div className="quick-action-icon user"><LogOut size={18}/></div><div className="quick-action-content"><h4>Clock-in / Punch Out</h4><p>Record daily punch in or end of shift clock-out</p></div></button>
            <button className="quick-action-item" onClick={()=> navigate("/worker/safety")}><div className="quick-action-icon alerts"><AlertOctagon size={18}/></div><div className="quick-action-content"><h4>Safety & PPE Rules</h4><p>View mandatory safety rules and emergency contacts</p></div></button>
            <button className="quick-action-item" onClick={()=> navigate("/worker/wages")}><div className="quick-action-icon project"><Wallet size={18}/></div><div className="quick-action-content"><h4>Wage Slips & Hours</h4><p>View daily wage earnings and payout history</p></div></button>
            <button className="quick-action-item" onClick={()=> navigate("/worker/shifts")}><div className="quick-action-icon manage"><Calendar size={18}/></div><div className="quick-action-content"><h4>Weekly Schedule</h4><p>View upcoming assigned shifts and worksites</p></div></button>
          </div>
        </div>

      </div>
    </>
  );
}
export default WorkerDashboard;