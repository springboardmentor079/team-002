import { useState } from "react";
import { Settings, Shield, User, Bell, Check } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function AdminSettings() {
  const user = getCurrentUser() || {
    name: "Admin User",
    email: "admin@buildtrack.com",
    role: "admin",
  };

  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user.name || "Admin User");
  const [email, setEmail] = useState(user.email || "admin@buildtrack.com");

  const handleSave = (e) => {
    e.preventDefault();
    const updated = { ...user, name, email };
    localStorage.setItem("user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>System & Account Settings ⚙️</h1>
          <p>Manage system configurations, user profile, notification rules, and theme styles.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "700px" }}>
        {/* Profile Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} color="#d97706" />
              <h3>Administrator Profile</h3>
            </div>
            <span className="status-pill good">Admin Access</span>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
              {saved && (
                <span style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} /> Profile updated!
                </span>
              )}
              <button
                type="submit"
                className="date-button"
                style={{ background: "#d97706", color: "#ffffff", border: "none", marginLeft: "auto" }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Theme Settings Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings size={18} color="#3b82f6" />
              <h3>Appearance & Theme</h3>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
            Switch between construction themes, dark modes, and high-contrast palettes:
          </p>
          <ThemeSwitcher />
        </div>

        {/* Security Settings Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={18} color="#10b981" />
              <h3>System Security</h3>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", color: "#334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>Two-Factor Authentication (2FA)</span>
              <span className="status-pill good">Enforced</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>JWT Session Expiration</span>
              <span style={{ color: "#64748b" }}>7 Days</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <span>Role-Based Access Control (RBAC)</span>
              <span className="status-pill good">Active</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSettings;
