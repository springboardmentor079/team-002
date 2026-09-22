import WorkerShiftInfo from "../../components/worker/WorkerShiftInfo";
import StatCard from "../../components/dashboard/StatCard";
import { Calendar } from "lucide-react";

function WorkerShifts() {
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
        <StatCard title="TODAY'S SHIFT" value="No shift" change="No data" type="active" />
        <StatCard title="ASSIGNED SITE" value="Not assigned" change="No data" type="projects" />
        <StatCard title="SUPERVISOR LEAD" value="Not assigned" change="No data" type="users" />
        <StatCard title="PLANNED HOURS" value="0.0 hrs" change="This week" type="pending" />
        <StatCard title="SAFETY GEAR" value="Not verified" change="No data" type="alerts" />
      </div>

      <div className="dashboard-grid role-grid" style={{ marginBottom: "20px" }}>
        <WorkerShiftInfo />

        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="#0d9488" />
              <h3>Weekly Work Schedule</h3>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Assigned Shifts</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
              No shifts available.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WorkerShifts;
