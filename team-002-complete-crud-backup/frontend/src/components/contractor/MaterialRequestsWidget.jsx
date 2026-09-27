import { Package, Clock, CheckCircle2, Truck } from "lucide-react";

const getIconForStatus = (status) => {
  if (status === "In Transit") return Truck;
  if (status === "Pending Approval") return Clock;
  return CheckCircle2;
};

const getBadgeForStatus = (status) => {
  if (status === "In Transit") return "transit";
  if (status === "Pending Approval") return "warning";
  return "good";
};

function MaterialRequestsWidget({ requests = [] }) {
  const items = Array.isArray(requests) ? requests.slice(0, 5) : [];

  return (
    <div className="dashboard-card material-requests-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Package size={18} color="#10b981" />
          <h3>Material & Stock Requisitions</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Live Requisitions</span>
      </div>

      <div className="material-req-list">
        {items.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "16px 0" }}>
            No material requisitions yet.
          </p>
        ) : (
          items.map((item) => {
            const Icon = getIconForStatus(item.status);
            return (
              <div className="material-req-item" key={item._id || item.reqId}>
                <div className="req-col-main">
                  <div className="req-title-row">
                    <span className="req-id">{item.reqId}</span>
                    <strong>{item.material}</strong>
                  </div>
                  <span className="req-meta">
                    Qty: {item.quantity} • {item.date}
                  </span>
                </div>

                <span className={`req-badge ${getBadgeForStatus(item.status)}`}>
                  <Icon size={12} />
                  {item.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MaterialRequestsWidget;