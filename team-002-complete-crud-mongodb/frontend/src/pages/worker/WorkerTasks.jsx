import { useState, useEffect } from "react";
import WorkerDailyTasks from "../../components/worker/WorkerDailyTasks";
import StatCard from "../../components/dashboard/StatCard";
import API from "../../services/api";

function WorkerTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await API.get("/work-orders");
        const orders = res.data?.data || [];
        setTasks(
          orders.map((wo) => ({
            _id: wo._id,
            title: wo.title,
            zone: wo.zone,
            status: wo.status === "Completed" ? "Completed" : wo.progress > 0 ? "In Progress" : "Pending",
            done: wo.status === "Completed",
          }))
        );
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const assigned = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const remaining = assigned - completed;

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Assigned Duties & Tasks 🔨</h1>
          <p>Click any task to verify checklist completion, review zone assignments, and safety requirements.</p>
        </div>
        <button className="date-button">📅 Shift: Site Duty</button>
      </div>

      <div className="stats-grid">
        <StatCard title="ASSIGNED TODAY" value={`${assigned} Duties`} change="Assigned" type="projects" />
        <StatCard title="COMPLETED TASKS" value={`${completed} Verified`} change={assigned ? `${Math.round((completed / assigned) * 100)}% done` : "No data"} type="active" />
        <StatCard title="REMAINING" value={`${remaining} Pending`} change="To be done" type="alerts" />
        <StatCard title="SUPERVISOR LEAD" value="Not assigned" change="No data" type="users" />
        <StatCard title="SAFETY GEAR" value="0% Cleared" change="No data" type="pending" />
      </div>

      <div style={{ maxWidth: "720px" }}>
        {loading ? (
          <div className="dashboard-card" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
            Loading tasks...
          </div>
        ) : (
          <WorkerDailyTasks tasks={tasks} />
        )}
      </div>
    </>
  );
}

export default WorkerTasks;
