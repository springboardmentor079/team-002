import { Settings, Shield } from "lucide-react";
import ProfileManagement from "../../components/common/ProfileManagement";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function AdminSettings() {
  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>System & Account Settings ⚙️</h1>
          <p>Manage system configurations, user profile, notification rules, and theme styles.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1100px", width: "100%" }}>
        {/* Real profile, straight from MongoDB */}
        <ProfileManagement />

        {/* Theme Settings Card */}
        <div className="dashboard-card profile-side-card">
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
        <div className="dashboard-card profile-side-card">
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
