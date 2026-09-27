import { useState, useEffect } from "react";
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import API from "../../services/api";

function PMNotifications() {
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
      <div className="pm-welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Project Manager Notifications 🔔</h1>
          <p>Critical project alerts, material dispatch notices, and milestone approvals.</p>
        </div>
        <button
          className="pm-menu-item active"
          style={{ width: "auto", padding: "8px 16px", borderRadius: "8px" }}
          onClick={handleMarkAll}
        >
          <CheckCheck size={16} style={{ marginRight: "4px" }} /> Mark All Read
        </button>
      </div>

      <div className="dashboard-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} color="#d97706" />
            <h3>Recent Project Alerts</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            {notifications.filter((n) => !n.read).length} Unread
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading notifications...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                No notifications available.
              </div>
            ) : (
            notifications.map((n) => {
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
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: "13px", color: "#1e293b" }}>{n.title}</strong>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{n.time}</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>{n.message}</p>
                  </div>
                </div>
              );
            })
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default PMNotifications;
