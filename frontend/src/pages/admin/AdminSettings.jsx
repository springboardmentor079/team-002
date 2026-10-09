import ProfileManagement from "../../components/common/ProfileManagement";

function AdminSettings() {
  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>System &amp; Account Settings ⚙️</h1>
          <p>Manage your account profile and password.</p>
        </div>
      </div>

      {/* Real profile, straight from MongoDB.
          ProfileManagement renders only the My Profile and Change Password
          cards, side by side on desktop and stacked on mobile. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "1100px",
          width: "100%",
        }}
      >
        <ProfileManagement />
      </div>
    </>
  );
}

export default AdminSettings;
