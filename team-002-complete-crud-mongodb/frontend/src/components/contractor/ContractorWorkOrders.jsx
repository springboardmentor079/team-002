import { ClipboardList, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getStatusClass = (status) => {
  if (status === "Completed" || status === "On Schedule") return "good";
  if (status === "Delayed" || (status || "").toLowerCase().includes("delay")) return "danger";
  return "warning";
};

function ContractorWorkOrders({ workOrders = [] }) {
  const navigate = useNavigate();

  const orders = Array.isArray(workOrders) ? workOrders.slice(0, 5) : [];

  return (
    <div className="dashboard-card contractor-orders-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ClipboardList size={18} color="#3b82f6" />
          <h3>Active Work Orders</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>
          {orders.length} Active
        </span>
      </div>

      <div className="work-orders-list">
        {orders.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "16px 0" }}>
            No work orders assigned yet.
          </p>
        ) : (
          orders.map((wo) => (
            <div className="work-order-row" key={wo._id || wo.orderId}>
              <div className="order-main">
                <div className="order-title-wrap">
                  <span className="order-id">{wo.orderId}</span>
                  <strong>{wo.title}</strong>
                </div>
                <span className="order-meta">
                  Supervisor: {wo.lead} • Due: {wo.deadline}
                </span>
              </div>

              <div className="order-progress-wrap">
                <div className="order-progress-bar">
                  <div
                    className="order-progress-fill"
                    style={{ width: `${wo.progress || 0}%` }}
                  />
                </div>
                <div className="order-status-row">
                  <span className={`order-status-badge ${getStatusClass(wo.status)}`}>
                    {wo.status}
                  </span>
                  <span className="order-pct">{wo.progress || 0}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="view-projects-btn"
        style={{ marginTop: "14px" }}
        onClick={() => navigate("/contractor/work-orders")}
      >
        <span>View all work packages</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default ContractorWorkOrders;