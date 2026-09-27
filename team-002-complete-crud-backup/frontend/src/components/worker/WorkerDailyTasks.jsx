import { useState, useEffect } from "react";
import { CheckSquare, CheckCircle2, Clock } from "lucide-react";

function WorkerDailyTasks({ tasks = [] }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (Array.isArray(tasks)) {
      setItems(
        tasks.slice(0, 6).map((t, idx) => {
          const status = t.status || "Pending";
          const done =
            status === "Completed" || status === "Verified" || t.done === true;
          return {
            id: t._id || idx + 1,
            title: t.title || t.phase || "Task",
            zone: t.zone || "",
            status: done ? "Completed" : status || "Pending",
            done,
          };
        })
      );
    }
  }, [tasks]);

  const toggleTask = (id) => {
    setItems(
      items.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              status: !t.done ? "Completed" : "In Progress",
            }
          : t
      )
    );
  };

  const completedCount = items.filter((t) => t.done).length;

  return (
    <div className="dashboard-card worker-tasks-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckSquare size={18} color="#0d9488" />
          <h3>Assigned Duties for Today</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
          {completedCount} of {items.length} Done
        </span>
      </div>

      <div className="worker-task-list">
        {items.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "16px 0" }}>
            No tasks assigned yet.
          </p>
        ) : (
          items.map((task) => (
            <div
              className={`worker-task-item ${task.done ? "task-done" : ""}`}
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="task-checkbox-wrap">
                {task.done ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : (
                  <div className="task-unchecked" />
                )}
              </div>

              <div className="task-text-content">
                <strong className={task.done ? "text-done" : ""}>
                  {task.title}
                </strong>
                {task.zone && <span>Zone: {task.zone}</span>}
              </div>

              <span className={`task-badge ${task.done ? "done" : "pending"}`}>
                {task.done ? (
                  "Verified"
                ) : (
                  <>
                    <Clock size={11} style={{ display: "inline", marginRight: "3px" }} />
                    {task.status}
                  </>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WorkerDailyTasks;