import { useState } from "react";
import { User, Settings, Check } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function PMSettings() {
  const user = getCurrentUser() || {
    name: "Project Manager",
    email: "project.manager@buildtrack.com",
    role: "project_manager",
  };

  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user.name || "Project Manager");
  const [email, setEmail] = useState(user.email || "project.manager@buildtrack.com");

  const handleSave = (e) => {
    e.preventDefault();
    const updated = { ...user, name, email };
    localStorage.setItem("user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="pm-welcome-section">
        <h1>Project Manager Preferences ⚙️</h1>
        <p>Manage PM account credentials, assigned site notifications, and theme settings.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "680px" }}>
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} color="#d97706" />
              <h3>Profile Settings</h3>
            </div>
            <span className="status-pill good">Project Lead</span>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              {saved && (
                <span style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} /> Saved successfully!
                </span>
              )}
              <button
                type="submit"
                className="pm-menu-item active"
                style={{ width: "auto", padding: "8px 16px", borderRadius: "6px", marginLeft: "auto" }}
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings size={18} color="#3b82f6" />
              <h3>Theme & Display</h3>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </>
  );
}

export default PMSettings;
