import { CheckCircle2, Clock, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getBadge = (milestone) => {
  if (milestone.progress >= 100 || milestone.clientApproved) return "good";
  if (milestone.progress > 0) return "progress";
  return "pending";
};

function ClientMilestoneTimeline({ milestones = [], projectName }) {
  const navigate = useNavigate();

  const items = Array.isArray(milestones) ? milestones : [];

  return (
    <div className="dashboard-card client-milestones-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={18} color="#7c3aed" />
          <h3>Project Construction Roadmap</h3>
        </div>
        <span className="client-project-pill">{projectName || "Your Project"}</span>
      </div>

      <div className="client-timeline-list">
        {items.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "16px 0" }}>
            No milestones available yet.
          </p>
        ) : (
          items.map((m, idx) => {
            const badge = getBadge(m);
            return (
              <div className="timeline-row" key={m._id || idx}>
                <div className={`timeline-marker ${badge}`}>
                  {m.progress >= 100 ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>{m.phase}</strong>
                    <span className={`timeline-badge ${badge}`}>{m.status}</span>
                  </div>

                  <div className="timeline-track">
                    <div
                      className={`timeline-fill ${badge}`}
                      style={{ width: `${m.progress || 0}%` }}
                    />
                  </div>

                  <div className="timeline-footer">
                    <span className="timeline-date">
                      <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
                      {m.date}
                    </span>
                    <span className="timeline-pct">{m.progress || 0}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        className="view-projects-btn"
        style={{ marginTop: "14px" }}
        onClick={() => navigate("/client/milestones")}
      >
        <span>View Full Milestone Roadmap</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default ClientMilestoneTimeline;