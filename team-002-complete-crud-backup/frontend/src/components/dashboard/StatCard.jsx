import {
  Users,
  FolderKanban,
  ClipboardList,
  Clock3,
  TriangleAlert,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function StatCard({ title, value, change, type }) {
  const icons = {
    users: Users,
    projects: FolderKanban,
    active: ClipboardList,
    pending: Clock3,
    alerts: TriangleAlert,
  };

  const Icon = icons[type] || Users;

  const isNegative =
    type === "pending" || type === "alerts";

  return (
    <div className="stat-card">
      <div className="stat-card-top">

        <div>
          <p className="stat-title">{title}</p>
          <h2 className="stat-value">{value}</h2>
        </div>

        <div className={`stat-icon ${type}`}>
          <Icon size={22} />
        </div>

      </div>

      <div
        className={`stat-change ${
          isNegative ? "negative" : "positive"
        }`}
      >
        {isNegative ? (
          <TrendingDown size={14} />
        ) : (
          <TrendingUp size={14} />
        )}

        <span>
          {change} from last month
        </span>
      </div>
    </div>
  );
}

export default StatCard;