import { Camera, FileCheck2, ShieldAlert, Award } from "lucide-react";

const getIconForType = (type) => {
  if (type === "verified") return Award;
  if (type === "media") return Camera;
  if (type === "info") return ShieldAlert;
  return FileCheck2;
};

function ClientSiteUpdates({ updates = [] }) {
  const items = Array.isArray(updates) ? updates.slice(0, 6) : [];

  return (
    <div className="dashboard-card client-updates-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileCheck2 size={18} color="#059669" />
          <h3>Site Bulletins & Quality Reports</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Live Feed</span>
      </div>

      <div className="client-updates-list">
        {items.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "16px 0" }}>
            No site updates available yet.
          </p>
        ) : (
          items.map((item, idx) => {
            const Icon = getIconForType(item.type);
            return (
              <div className="client-update-item" key={item._id || idx}>
                <div className={`update-icon-box ${item.type}`}>
                  <Icon size={16} />
                </div>

                <div className="update-content">
                  <div className="update-top">
                    <strong>{item.title}</strong>
                    <span className={`update-badge ${item.type}`}>{item.badge}</span>
                  </div>
                  <p>{item.desc}</p>
                  <small>{item.date}</small>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ClientSiteUpdates;