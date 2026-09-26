import { Settings } from "lucide-react";
import ProfileManagement from "../../components/common/ProfileManagement";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function SiteEngineerSettings() {
  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Site Engineer Settings ⚙️</h1>
          <p>Your engineer account profile, security, and theme switcher.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1100px", width: "100%" }}>
        {/* Real profile, straight from MongoDB */}
        <ProfileManagement />

        <div className="dashboard-card profile-side-card">
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
