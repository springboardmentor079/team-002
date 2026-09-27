import {
  UserPlus,
  FolderPen,
  ShieldCheck,
  FileText,
} from "lucide-react";

// ================= ICON CONFIGURATION =================

const activityIcons = {
  user: UserPlus,
  project: FolderPen,
  role: ShieldCheck,
  report: FileText,
};

// ================= TIME FORMAT FUNCTION =================

const getTimeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const activityDate = new Date(date);

  const difference = now - activityDate;

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return activityDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

// ================= COMPONENT =================

function RecentActivity({
  activities = [],
  loading = false,
}) {
  return (
    <div className="dashboard-card recent-activity-card">
      <div className="card-header">
        <h3>Recent Activity</h3>
      </div>

      <div className="activity-list">
        {loading ? (
          <div className="activity-item">
            <div className="activity-content">
              <p>Loading activities...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="activity-item">
            <div className="activity-content">
              <p>No recent activity found.</p>
            </div>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon =
              activityIcons[activity.type] || FileText;

            return (
              <div
                className="activity-item"
                key={activity.id}
              >
                <div
                  className={`activity-icon ${activity.type}`}
                >
                  <Icon size={18} />
                </div>

                <div className="activity-content">
                  <h4>{activity.title}</h4>

                  <p>{activity.description}</p>
                </div>

                <span className="activity-time">
                  {getTimeAgo(activity.time)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentActivity;