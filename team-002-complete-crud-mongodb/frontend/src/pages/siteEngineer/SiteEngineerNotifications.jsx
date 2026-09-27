import { useState, useEffect } from "react";
import { Bell, CheckCheck, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import API from "../../services/api";

function SiteEngineerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <>
      <div className="welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Site Field Alerts 🔔</h1>
          <p>Weather alerts, concrete delivery notifications, inspection requests, and safety advisories.</p>
        </div>
        <button
          className="date-button"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
          onClick={handleMarkAll}
        >
          <CheckCheck size={16} /> Mark All Read
        </button>
      </div>

      <div className="dashboard-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} color="#d97706" />
            <h3>Field Alerts & Advisories</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Updates</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading notifications...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No notifications available.</div>
            ) : (
            notifications.map((n) => {
              const Icon = n.type === "warning" ? AlertTriangle : n.type === "success" ? CheckCircle2 : Info;
              return (
                <div
                  key={n._id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: n.read ? "#f8fafc" : "#fffbeb",
                    border: n.read ? "1px solid #f1f5f9" : "1px solid #fde68a",
                  }}
                >
                  <div className={`activity-icon ${n.type === "warning" ? "role" : "project"}`}>
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
            }))}
          </div>
        )}
      </div>
    </>
  );
}

export default SiteEngineerNotifications;
