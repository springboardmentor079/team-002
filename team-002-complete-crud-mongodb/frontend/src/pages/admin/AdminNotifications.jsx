import { useState, useEffect } from "react";
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import API from "../../services/api";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    try {
      await API.put("/notifications/mark-all-read");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>System Notifications 🔔</h1>
          <p>Real-time alerts, safety announcements, material dispatches, and milestone milestones.</p>
        </div>
        <button
          className="date-button"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
          onClick={handleMarkAll}
        >
          <CheckCheck size={16} /> Mark All as Read
        </button>
      </div>

      <div className="dashboard-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} color="#d97706" />
            <h3>Notification Feed</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            {notifications.filter((n) => !n.read).length} Unread
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No notifications right now.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.map((n) => {
              const Icon = n.type === "warning" ? AlertTriangle : n.type === "success" ? CheckCircle2 : Info;
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkOne(n._id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: n.read ? "#f8fafc" : "#fffbeb",
                    border: n.read ? "1px solid #f1f5f9" : "1px solid #fde68a",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  <div
                    className={`activity-icon ${
                      n.type === "warning" ? "role" : n.type === "success" ? "project" : "user"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "13px", color: "#1e293b" }}>{n.title}</strong>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{n.time}</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>{n.message}</p>
                  </div>
                  {!n.read && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#d97706",
                        borderRadius: "50%",
                        alignSelf: "center",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminNotifications;
