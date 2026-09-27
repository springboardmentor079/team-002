import { Clock, MapPin, UserCheck, ShieldCheck } from "lucide-react";

function WorkerShiftInfo({ data }) {
  const shift = data || {};

  const checkIn = shift.checkIn || "--";
  const punchedIn = Boolean(shift.punchedIn || (checkIn && checkIn !== "--"));

  return (
    <div className="dashboard-card worker-shift-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={18} color="#0d9488" />
          <h3>Today's Shift & Duty Status</h3>
        </div>
        <span className="punch-status-badge">
          <UserCheck size={12} />
          {punchedIn ? `Punched In (${checkIn})` : "Not Punched Yet"}
        </span>
      </div>

      <div className="worker-shift-body">
        <div className="shift-main-row">
          <div className="shift-site-info">
            <span className="shift-label">Active Worksite</span>
            <strong className="shift-site-name">
              <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
              {shift.site || "Assigned Site"}
            </strong>
            <span className="shift-subtext">Assigned Zone: {shift.zone || "Main Worksite"}</span>
          </div>

          <div className="shift-timing-info">
            <span className="shift-label">Shift Hours</span>
            <strong className="shift-hours">{shift.shift || "Day Shift (08:00 AM - 05:00 PM)"}</strong>
            <span className="shift-subtext">
              {shift.checkOut && shift.checkOut !== "--"
                ? `Punched out at ${shift.checkOut}`
                : "Day Shift (9 hrs incl. lunch)"}
            </span>
          </div>
        </div>

        <div className="shift-divider" />

        <div className="shift-footer-details">
          <div className="shift-detail-item">
            <span>Status Today</span>
            <strong>{checkIn !== "--" ? `Punched in at ${checkIn}` : "Not on shift"}</strong>
          </div>

          <div className="shift-detail-item">
            <span>Trade / Category</span>
            <strong>{shift.trade || "Site Duty"}</strong>
          </div>

          <div className="shift-detail-item">
            <span>Safety Clearance</span>
            <strong style={{ color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} /> {shift.safetyClearance || "Not verified"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerShiftInfo;