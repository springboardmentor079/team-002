import { useNavigate } from "react-router-dom";

import {
  ArrowUpRight,
  CirclePlay,
  Clock,
  ShieldAlert,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import "../../styles/maintenance.css";

// Live counters straight from MongoDB (admin dashboard API
// -> Maintenance.getSummary), never estimated on the client.
function MaintenanceSnapshot({
  stats,
  loading = false,
  basePath = "/admin/maintenance",
}) {
  const navigate = useNavigate();

  const counts = stats || {};

  const rows = [
    {
      key: "scheduled",
      label: "Scheduled",
      value: counts.scheduled ?? 0,
      icon: Clock,
      tone: "scheduled",
    },
    {
      key: "inProgress",
      label: "In Progress",
      value: counts.inProgress ?? 0,
      icon: CirclePlay,
      tone: "in-progress",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: counts.overdue ?? 0,
      icon: TriangleAlert,
      tone: "overdue",
    },
    {
      key: "critical",
      label: "Critical Open",
      value: counts.critical ?? 0,
      icon: ShieldAlert,
      tone: "critical",
    },
  ];

  return (
    <div className="dashboard-card mnt-card mnt-snapshot">
      <div className="card-header">
        <div className="mnt-card-title">
          <Wrench
            size={18}
            color="#d97706"
            aria-hidden="true"
          />
          <h3>Maintenance Overview</h3>
        </div>

        <button
          type="button"
          className="mnt-snapshot-link"
          onClick={() => navigate(basePath)}
        >
          View all
          <ArrowUpRight size={13} aria-hidden="true" />
        </button>
      </div>

      <div className="mnt-snapshot-total">
        <strong>
          {loading ? "--" : (counts.total ?? 0)}
        </strong>
        <span>Total maintenance records</span>
      </div>

      <div className="mnt-snapshot-grid">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <button
              key={row.key}
              type="button"
              className="mnt-snapshot-row"
              onClick={() =>
                navigate(
                  `${basePath}?status=${
                    row.key === "overdue" ? "Overdue" : ""
                  }`
                )
              }
            >
              <span
                className={`mnt-snapshot-icon mnt-chip-${row.tone}`}
              >
                <Icon size={14} aria-hidden="true" />
              </span>

              <span className="mnt-snapshot-label">
                {row.label}
              </span>

              <strong>
                {loading ? "--" : row.value}
              </strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MaintenanceSnapshot;
