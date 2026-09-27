import { ClipboardCheck, CheckCircle2, AlertCircle, FileText } from "lucide-react";

const getIconForType = (type) => {
  if (type === "inspection" || type === "verified") return CheckCircle2;
  if (type === "issue" || type === "alert") return AlertCircle;
  return FileText;
};

const getBadgeType = (type) => {
  if (type === "inspection" || type === "verified") return "inspection";
  if (type === "issue" || type === "alert") return "issue";
  return "report";
};

function SiteActivityLogs({ logs = [] }) {
  const items = Array.isArray(logs) ? logs.slice(0, 6) : [];

  return (
    <div className="dashboard-card site-logs-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ClipboardCheck size={18} color="#10b981" />
          <h3>Site Activity & Inspection Logs</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Today</span>
      </div>

      <div className="site-logs-list">
        {items.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "16px 0" }}>
            No site activity logged yet.
          </p>
        ) : (
          items.map((log, idx) => {
            const Icon = getIconForType(log.type);
            const badgeType = getBadgeType(log.type);

            return (
              <div className="site-log-item" key={log._id || idx}>
                <div className={`log-icon-wrap ${badgeType}`}>
                  <Icon size={16} />
                </div>

                <div className="log-details">
                  <strong>{log.title}</strong>
                  <span>{log.location}</span>
                </div>

                <div className="log-meta">
                  <span className={`log-badge ${badgeType}`}>{log.status}</span>
                  <small>{log.time}</small>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SiteActivityLogs;