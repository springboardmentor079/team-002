import { Settings } from "lucide-react";
import ProfileManagement from "../../components/common/ProfileManagement";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function WorkerSettings() {
  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Worker Profile &amp; Site Preferences ⚙️</h1>
          <p>Personal profile, account security, and theme settings.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1100px", width: "100%" }}>
        {/* Real profile, straight from MongoDB */}
        <ProfileManagement />

        {/* Theme Card */}
        <div className="dashboard-card profile-side-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings size={18} color="#3b82f6" />
              <h3>Theme Switcher</h3>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </>
  );
}

export default WorkerSettings;
