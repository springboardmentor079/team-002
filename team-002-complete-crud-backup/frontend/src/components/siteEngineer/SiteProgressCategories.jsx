import { Layers } from "lucide-react";

function SiteProgressCategories({ milestones = [], loading = false }) {

  const getStatus = (milestone) => {
    const progress = milestone.progress || 0;
    const status =
      milestone.status?.toLowerCase() || "";

    if (
      progress >= 100 ||
      status.includes("completed")
    ) {
      return {
        text: "COMPLETED",
        className: "completed",
      };
    }

    if (
      status.includes("delay")
    ) {
      return {
        text: "DELAYED",
        className: "delayed",
      };
    }

    if (progress > 0) {
      return {
        text: `${progress}% IN PROGRESS`,
        className: "in-progress",
      };
    }

    return {
      text: "STARTING",
      className: "pending",
    };
  };

  return (
    <div className="dashboard-card site-categories-card">

      <div className="card-header">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Layers
            size={18}
            color="#d97706"
          />

          <h3>
            Site Progress by Phase
          </h3>
        </div>

        <span
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          Live Data
        </span>

      </div>

      <div className="categories-list">

        {loading ? (

          <p
            style={{
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading site progress...
          </p>

        ) : milestones.length === 0 ? (

          <p
            style={{
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No milestones found.
          </p>

        ) : (

          milestones.map((milestone, index) => {

            const status =
              getStatus(milestone);

            return (

              <div
                className="category-item"
                key={milestone._id}
              >

                <div className="category-info">

                  <span className="category-name">

                    Phase {index + 1}:{" "}

                    {milestone.phase}

                  </span>

                  <span
                    className={`category-status ${status.className}`}
                  >

                    {status.text}

                  </span>

                </div>


                <div className="progress-track">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        milestone.progress || 0
                      }%`,
                    }}
                  />

                </div>


                <div className="category-footer">

                  <span className="category-target">

                    Target: {milestone.date}

                  </span>

                  <span className="category-percent">

                    {milestone.progress || 0}%

                  </span>

                </div>

              </div>

            );

          })

        )}

      </div>

    </div>
  );
}

export default SiteProgressCategories;