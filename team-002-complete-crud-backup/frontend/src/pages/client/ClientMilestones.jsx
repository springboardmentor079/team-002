import { useState, useEffect } from "react";
import { Milestone, CheckCircle2, Calendar, Check } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

function ClientMilestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await API.get("/milestones");
      setMilestones(res.data?.data || []);
    } catch (err) {
      console.error("Client milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMilestones(); }, []);

  const approved = milestones.filter(m => m.clientApproved).length;
  const current = milestones.find(m => (m.progress || 0) > 0 && (m.progress || 0) < 100);
  const next = milestones.find(m => !m.clientApproved && (m.progress || 0) < 100);
  const quality = milestones.length ? Math.round(milestones.filter(m => m.progress >= 100 || m.clientApproved).length / milestones.length * 100) : 0;

  const handleApprove = async id => {
    try {
      await API.put(`/milestones/${id}`, {
        clientApproved: true,
        status: "Client Approved & Verified",
      });
      fetchMilestones();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Project Construction Milestones 🚩</h1>
          <p>Verify completion stages, review independent engineer audits, and approve milestone disbursements.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL MILESTONES" value={String(milestones.length)} change="From MongoDB" type="projects" />
        <StatCard title="CLIENT APPROVED" value={String(approved)} change={`${approved}/${milestones.length} signed`} type="active" />
        <StatCard title="CURRENT STAGE" value={current?.phase || (milestones.length ? "Completed" : "--")} change={current ? `${current.progress || 0}% complete` : "No active stage"} type="users" />
        <StatCard title="NEXT DISBURSEMENT" value={next?.amount || "--"} change={next?.phase || "No pending milestone"} type="pending" />
        <StatCard title="QUALITY CLEARANCE" value={`${quality}%`} change="Calculated live" type="alerts" />
      </div>

      <div className="dashboard-card" style={{ maxWidth: "900px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Milestone size={18} color="#7c3aed" />
            <h3>Milestone Verification Roadmap</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live MongoDB records</span>
        </div>

        {loading ? <div style={{ padding: "30px", textAlign: "center" }}>Loading milestones...</div> :
          milestones.length === 0 ? <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No milestones assigned to this client.</div> :
          <div className="client-timeline-list">
            {milestones.map((m, idx) => {
              const done = m.progress >= 100 || m.clientApproved;
              return (
                <div className="timeline-row" key={m._id} style={{ alignItems: "center" }}>
                  <div className={`timeline-marker ${done ? "good" : "progress"}`}>
                    {done ? <CheckCircle2 size={14} /> : <span>{idx + 1}</span>}
                  </div>
                  <div className="timeline-content" style={{ flex: 1 }}>
                    <div className="timeline-header">
                      <strong>{m.phase}</strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`timeline-badge ${done ? "good" : "progress"}`}>
                          {m.clientApproved ? "Client Approved" : m.status}
                        </span>
                        {!m.clientApproved && m.progress >= 80 && (
                          <button className="date-button" style={{ background: "#059669", color: "#fff", border: "none", padding: "4px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }} onClick={() => handleApprove(m._id)}>
                            <Check size={12} /> Sign-off
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="timeline-track" style={{ margin: "6px 0" }}>
                      <div className={`timeline-fill ${done ? "good" : "progress"}`} style={{ width: `${Math.min(100, Math.max(0, m.progress || 0))}%` }} />
                    </div>
                    <div className="timeline-footer">
                      <span className="timeline-date"><Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />{m.date}</span>
                      <span>Stage Value: <strong>{m.amount}</strong></span>
                      <span className="timeline-pct">{m.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </>
  );
}

export default ClientMilestones;
