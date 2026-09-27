import { ShieldCheck, Check } from "lucide-react";

function WorkerSafetyChecklist({ clearedPercent = 0, items = [], officerName = "" }) {
  const ppeItems = Array.isArray(items) ? items : [];

  return (
    <div className="dashboard-card worker-safety-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldCheck size={18} color="#059669" />
          <h3>Mandatory PPE & Safety Clearance</h3>
        </div>
        <span className="safety-cleared-pill">
          {clearedPercent}% Cleared
        </span>
      </div>

      <div className="ppe-list">
        {ppeItems.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              padding: "16px 0",
            }}
          >
            No safety checklist data available.
          </p>
        ) : (
          ppeItems.map((ppe, idx) => (
            <div className="ppe-item" key={ppe._id || idx}>
              <div className="ppe-check-circle">
                <Check size={13} strokeWidth={3} />
              </div>

              <div className="ppe-info">
                <strong>{ppe.item || ppe.name}</strong>
                <span>{ppe.status}</span>
              </div>

              {ppe.required && (
                <span className="ppe-mandatory-badge">Mandatory</span>
              )}
            </div>
          ))
        )}
      </div>

      {officerName ? (
        <div className="safety-emergency-box">
          <span>
            Site Safety Officer: <strong>{officerName}</strong>
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default WorkerSafetyChecklist;
