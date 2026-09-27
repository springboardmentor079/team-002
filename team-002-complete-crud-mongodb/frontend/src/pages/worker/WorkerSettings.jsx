import { useState } from "react";
import { User, Settings, Check, Phone, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function WorkerSettings() {
  const user = getCurrentUser() || {
    name: "Worker",
    email: "worker@buildtrack.com",
    role: "worker",
  };

  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user.name || "Worker");
  const [email, setEmail] = useState(user.email || "worker@buildtrack.com");
  const [phone, setPhone] = useState("+1 (555) 234-8901");
  const [emergencyContact, setEmergencyContact] = useState("Sarah Jenkins - +1 (555) 902-3341");
  const [tradeSkill, setTradeSkill] = useState("Carpentry & Concrete Works");
  const [badgeId, setBadgeId] = useState("WK-88219");

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
          <h1>Worker Profile & Site Preferences ⚙️</h1>
          <p>Personal profile, emergency contact, safety badge credentials, and theme settings.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "680px" }}>
        {/* Profile Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} color="#2563eb" />
              <h3>Site Worker Credentials</h3>
            </div>
            <span className="status-pill good">Active Site Pass</span>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Worker Badge / ID</label>
                <input
                  type="text"
                  value={badgeId}
                  disabled
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#f8fafc" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Trade / Specialization</label>
              <input
                type="text"
                value={tradeSkill}
                onChange={(e) => setTradeSkill(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>
                Emergency Contact (Name & Phone)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              {saved && (
                <span style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} /> Worker profile saved successfully!
                </span>
              )}
              <button
                type="submit"
                className="date-button"
                style={{ background: "#2563eb", color: "#ffffff", border: "none", marginLeft: "auto" }}
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Theme Card */}
        <div className="dashboard-card">
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
