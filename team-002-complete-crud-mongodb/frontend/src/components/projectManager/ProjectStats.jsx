import {
  FolderKanban,
  Activity,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";

function ProjectStats({ stats = {} }) {
  const statsData = [
    {
      title: "Total Projects",
      value: stats.totalProjects ?? 0,
      subtitle: "All assigned projects",
      icon: FolderKanban,
      type: "orange",
    },

    {
      title: "Active Projects",
      value: stats.activeProjects ?? 0,
      subtitle: "Currently in progress",
      icon: Activity,
      type: "orange",
    },

    {
      title: "Completed",
      value: stats.completedProjects ?? 0,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      type: "green",
    },

    {
      title: "Delayed",
      value: stats.delayedProjects ?? 0,
      subtitle: "Require immediate attention",
      icon: TriangleAlert,
      type: "red",
    },
  ];

  return (
    <div className="pm-stats-grid">
      {statsData.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            className="pm-stat-card"
            key={stat.title}
          >
            <div className="pm-stat-top">
              <div>
                <p className="pm-stat-title">
                  {stat.title}
                </p>

                <h2>{stat.value}</h2>
              </div>

              <div
                className={`pm-stat-icon ${stat.type}`}
              >
                <Icon size={22} />
              </div>
            </div>

            <p className="pm-stat-subtitle">
              {stat.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default ProjectStats;