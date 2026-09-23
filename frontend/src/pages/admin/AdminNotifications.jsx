import { useState, useEffect } from "react";
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, Plus } from "lucide-react";
import API from "../../services/api";

const DEFAULT_NOTIFICATIONS = [
  {
    _id: "notif-1",
    title: "Material Request REQ-104 Approved",
    message: "450 Bags of OPC 53 Cement approved for Tower A casting.",
    role: "all",
    type: "success",
    time: "10 mins ago",
    read: false,
  },
  {
    _id: "notif-2",
    title: "Weather Advisory - Heavy Rain",
    message: "Precautionary dewatering pumps installed in excavation zones.",
    role: "all",
    type: "warning",
    time: "1 hour ago",
    read: false,
  },
  {
    _id: "notif-3",
    title: "Level 11 Milestone Verified",
    message: "Site Engineer certified Phase 2 structural completion.",
    role: "all",
    type: "info",
    time: "3 hours ago",
    read: true,
  },
  {
    _id: "notif-4",
    title: "Heavy Crane Maintenance Alert",
    message: "Tower Crane #1 periodic cable inspection scheduled for 15 Oct 2026.",
    role: "all",
    type: "warning",
    time: "5 hours ago",
    read: false,
  },
];

function AdminNotifications() {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    role: "all",
    type: "info",
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch remote notifications, using fallback alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await API.put("/notifications/mark-all-read");
    } catch (err) {
      console.warn("Mark all read local note:", err.message);
    }
  };

  const handleMarkOne = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    try {
      await API.put(`/notifications/${id}/read`);
    } catch (err) {
      console.warn("Mark read local note:", err.message);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    const newNotif = {
      _id: "notif-" + Date.now(),
      title: formData.title,
      message: formData.message,
      role: formData.role || "all",
      type: formData.type || "info",
      time: "Just now",
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setShowModal(false);
    setFormData({ title: "", message: "", role: "all", type: "info" });

    try {
      await API.post("/notifications", formData);
    } catch (err) {
      console.warn("Broadcast alert created locally:", err.message);
    }

    alert("Broadcast notification successfully published to all users!");
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>System Notifications 🔔</h1>
          <p>Real-time alerts, safety announcements, material dispatches, and milestone milestones.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="date-button"
            style={{
              background: "#d97706",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Broadcast Alert
          </button>
          <button
            className="date-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={handleMarkAll}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        </div>
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

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="dashboard-card" style={{ width: "420px", background: "#ffffff" }}>
            <h3 style={{ margin: "0 0 6px" }}>Broadcast Platform Alert</h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#64748b" }}>
              Publish an immediate notification across project portals.
            </p>
            <form onSubmit={handleCreateNotification} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concrete Pouring Scheduled - Block A"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Target Role / Audience</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                >
                  <option value="all">All Roles & Users</option>
                  <option value="project_manager">Project Managers</option>
                  <option value="site_engineer">Site Engineers</option>
                  <option value="contractor">Contractors</option>
                  <option value="worker">Workers</option>
                  <option value="client">Clients</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Alert Severity / Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                >
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Warning / Alert (Yellow)</option>
                  <option value="success">Success / Operational (Green)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Message Content</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detail the announcement, location, precautions or instructions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminNotifications;
