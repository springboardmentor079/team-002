import { useState } from "react";
import { User, Settings, Check } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function SiteEngineerSettings() {
  const user = getCurrentUser() || {
    name: "Site Engineer",
    email: "site.engineer@buildtrack.com",
    role: "site_engineer",
  };

  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user.name || "Site Engineer");
  const [email, setEmail] = useState(user.email || "site.engineer@buildtrack.com");

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
          <h1>Site Engineer Settings ⚙️</h1>
          <p>Assigned worksite preferences, inspection defaults, and theme switcher.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "680px" }}>
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} color="#d97706" />
              <h3>Field Engineer Profile</h3>
            </div>
            <span className="status-pill good">Site Monitoring</span>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Engineer Name</label>
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
                  <Check size={14} /> Profile updated!
                </span>
              )}
              <button
                type="submit"
                className="date-button"
                style={{ background: "#d97706", color: "#ffffff", border: "none", marginLeft: "auto" }}
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
              <h3>Visual Theme</h3>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </>
  );
}

export default SiteEngineerSettings;
