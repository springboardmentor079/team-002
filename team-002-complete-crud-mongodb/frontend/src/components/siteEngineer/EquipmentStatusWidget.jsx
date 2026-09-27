import { Truck, CheckCircle2, Wrench, Clock } from "lucide-react";

const getIconForStatus = (status) => {
  if (
    status === "Maintenance" ||
    (status || "").toLowerCase().includes("maint")
  ) {
    return Wrench;
  }
  if (
    status === "Scheduled Delivery" ||
    status === "Standby" ||
    (status || "").toLowerCase().includes("scheduled") ||
    (status || "").toLowerCase().includes("standby")
  ) {
    return Clock;
  }
  return CheckCircle2;
};

const getBadgeForStatus = (status) => {
  if (
    status === "Maintenance" ||
    (status || "").toLowerCase().includes("maint")
  ) {
    return "status-maintenance";
  }
  if (
    status === "Scheduled Delivery" ||
    status === "Standby" ||
    (status || "").toLowerCase().includes("scheduled") ||
    (status || "").toLowerCase().includes("standby")
  ) {
    return "status-scheduled";
  }
  return "status-operational";
};

function EquipmentStatusWidget({ equipment = [], count }) {
  const unitCount =
    typeof count === "number"
      ? count
      : Array.isArray(equipment) && equipment.length > 0
      ? equipment.length
      : 0;

  const items = Array.isArray(equipment) && equipment.length > 0
    ? equipment.slice(0, 5)
    : [];

  if (items.length === 0) {
    return (
      <div className="dashboard-card equipment-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} color="#3b82f6" />
            <h3>Equipment & Machinery Status</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>No equipment logged</span>
        </div>

        <div className="machinery-list">
          <p style={{ textAlign: "center", color: "#64748b", padding: "16px 0" }}>
            No machinery data available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card equipment-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Truck size={18} color="#3b82f6" />
          <h3>Equipment & Machinery Status</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>
          {unitCount} Units Logged
        </span>
      </div>

      <div className="machinery-list">
        {items.map((item) => {
          const Icon = getIconForStatus(item.status);
          return (
            <div className="machinery-item" key={item._id || item.name}>
              <div className="machinery-info">
                <strong>{item.name}</strong>
                <span className="machinery-type">
                  {item.type} • Op: {item.operator}
                </span>
              </div>

              <span className={`equipment-badge ${getBadgeForStatus(item.status)}`}>
                <Icon size={12} />
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EquipmentStatusWidget;