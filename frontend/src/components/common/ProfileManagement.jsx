import { useCallback, useEffect, useRef, useState } from "react";
import {
  User,
  Shield,
  Camera,
  Check,
  AlertCircle,
  KeyRound,
  Pencil,
  X,
  Loader2,
} from "lucide-react";
import API from "../../services/api";
import { setCurrentUser, resolveProfileImageUrl } from "../../utils/auth";
import "../../styles/profile.css";

const NOT_PROVIDED = "Not provided";
const MIN_PASSWORD_LENGTH = 6;

const ROLE_LABELS = {
  admin: "Admin",
  project_manager: "Project Manager",
  site_engineer: "Site Engineer",
  contractor: "Contractor",
  worker: "Worker",
  client: "Client",
};

const formatRole = (role) =>
  ROLE_LABELS[role] ||
  (role
    ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : NOT_PROVIDED);

const getInitials = (name) => {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return NOT_PROVIDED;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return NOT_PROVIDED;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const readLoadErrorMessage = (error) =>
  error.response?.data?.message ||
  "Could not load your profile. Please refresh and try again.";

/**
 * Profile Management shared by every BuildTrack dashboard.
 * All data is read from MongoDB through the authenticated profile API.
 */
function ProfileManagement() {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");

  // Derived so the initial fetch never sets state synchronously in the effect
  const loading = profile === null && loadError === "";

  // Edit profile
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({
    type: "",
    text: "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Profile photo
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState({
    type: "",
    text: "",
  });

  // Change password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Applies a profile payload from the API to local state
  const applyProfile = useCallback((user) => {
    setProfile(user);
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      department: user.department || "",
    });

    // Keep the header/sidebar in sync with the authoritative DB values
    setCurrentUser(user);
  }, []);

  // Initial load. State is only written from the promise callbacks, never
  // synchronously from the effect body.
  useEffect(() => {
    let active = true;

    API.get("/auth/profile")
      .then((response) => {
        if (!active) return;
        applyProfile(response.data.user);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(readLoadErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [applyProfile]);

  // Retry after a failed load. Clearing the previous error here puts the
  // panel back into its loading state while the request is in flight.
  const handleRetry = () => {
    setLoadError("");

    API.get("/auth/profile")
      .then((response) => applyProfile(response.data.user))
      .catch((error) => setLoadError(readLoadErrorMessage(error)));
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Name is required";
    } else if (form.name.trim().length > 120) {
      errors.name = "Name must be 120 characters or fewer";
    }

    const phone = form.phone.trim();
    if (phone && !/^[0-9+()\-\s]{6,20}$/.test(phone)) {
      errors.phone =
        "Enter a valid phone number (6-20 digits, optional +, -, ( ) and spaces)";
    }

    if (form.department.trim().length > 120) {
      errors.department = "Department must be 120 characters or fewer";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    if (!validateProfileForm()) return;

    try {
      setSavingProfile(true);

      const response = await API.put("/auth/profile", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
      });

      const user = response.data.user;
      setProfile(user);
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        department: user.department || "",
      });

      // Updates the header/sidebar straight away
      setCurrentUser(user);

      setProfileMessage({
        type: "success",
        text: response.data.message || "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      setProfileMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Could not save your profile. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file

    if (!file) return;

    setImageMessage({ type: "", text: "" });

    if (!file.type.startsWith("image/")) {
      setImageMessage({
        type: "error",
        text: "Please choose an image file (JPG, PNG, WEBP or GIF).",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageMessage({
        type: "error",
        text: "Image is too large. Maximum size is 2MB.",
      });
      return;
    }

    try {
      setUploadingImage(true);

      const body = new FormData();
      body.append("image", file);

      const response = await API.post("/auth/profile-image", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const user = response.data.user;
      setProfile(user);
      setCurrentUser(user);

      setImageMessage({
        type: "success",
        text: response.data.message || "Profile photo updated successfully",
      });
    } catch (error) {
      setImageMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Could not upload the image. Please try again.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageMessage({ type: "", text: "" });

    try {
      setUploadingImage(true);

      const response = await API.delete("/auth/profile-image");

      const user = response.data.user;
      setProfile(user);
      setCurrentUser(user);

      setImageMessage({
        type: "success",
        text: "Profile photo removed",
      });
    } catch (error) {
      setImageMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Could not remove the photo. Please try again.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      errors.newPassword = `New password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (
      currentPassword &&
      newPassword &&
      currentPassword === newPassword
    ) {
      errors.newPassword =
        "New password must be different from your current password";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (!validatePasswordForm()) return;

    try {
      setSavingPassword(true);

      const response = await API.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordMessage({
        type: "success",
        text:
          response.data.message ||
          "Password changed successfully.",
      });

      // Never echo the passwords back into state
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Could not change your password. Please try again.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      department: profile?.department || "",
    });
    setProfileErrors({});
    setProfileMessage({ type: "", text: "" });
    setIsEditing(false);
  };

  const initials = getInitials(profile?.name);
  const avatarUrl = resolveProfileImageUrl(profile?.profileImage);

  // A photo path that failed to load falls back to the initials avatar. The
  // failed URL is remembered rather than a boolean, so a newly uploaded photo
  // shows again without needing to clear any state.
  const [failedImageUrl, setFailedImageUrl] = useState("");
  const showPhoto = Boolean(avatarUrl) && avatarUrl !== failedImageUrl;
  const handleImageError = () => setFailedImageUrl(avatarUrl);

  if (loading) {
    return (
      <div className="dashboard-card profile-card">
        <div className="profile-loading">
          <Loader2
            size={22}
            className="profile-spinner"
            aria-hidden="true"
          />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="dashboard-card profile-card">
        <div className="profile-alert error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{loadError}</span>
        </div>
        <button
          type="button"
          className="profile-btn"
          onClick={handleRetry}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      {/* ================= PROFILE OVERVIEW ================= */}
      <div className="dashboard-card profile-card">
        <div className="card-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <User size={18} color="#d97706" />
            <h3>My Profile</h3>
          </div>

          <span className="status-pill good">
            {formatRole(profile?.role)}
          </span>
        </div>

        {/* Identity block */}
        <div className="profile-identity">
          <div className="profile-avatar-wrap">
            {showPhoto ? (
              <img
                src={avatarUrl}
                alt={`${profile?.name || "User"} profile photo`}
                className="profile-avatar-img"
                onError={handleImageError}
              />
            ) : (
              <div
                className="profile-avatar-fallback"
                aria-hidden="true"
              >
                {initials}
              </div>
            )}

            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              {uploadingImage ? (
                <Loader2
                  size={14}
                  className="profile-spinner"
                  aria-hidden="true"
                />
              ) : (
                <Camera size={14} aria-hidden="true" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              hidden
            />
          </div>

          <div className="profile-identity-text">
            <h4>
              {profile?.name || NOT_PROVIDED}
            </h4>
            <p>
              {formatRole(profile?.role)}
            </p>

            <div className="profile-photo-actions">
              <button
                type="button"
                className="profile-link-btn"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploadingImage}
              >
                {showPhoto ? "Replace photo" : "Upload photo"}
              </button>

              {showPhoto && (
                <button
                  type="button"
                  className="profile-link-btn danger"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {imageMessage.text && (
          <div
            className={`profile-alert ${imageMessage.type}`}
            role="status"
          >
            {imageMessage.type === "success" ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <AlertCircle
                size={16}
                aria-hidden="true"
              />
            )}
            <span>{imageMessage.text}</span>
          </div>
        )}

        {/* Details grid */}
        <div className="profile-details">
          <div className="profile-detail">
            <span>Full Name</span>
            <strong>
              {profile?.name || NOT_PROVIDED}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Email Address</span>
            <strong>
              {profile?.email || NOT_PROVIDED}
            </strong>
            <small>
              Your registered account email. Contact an
              administrator to change it.
            </small>
          </div>

          <div className="profile-detail">
            <span>Phone Number</span>
            <strong>
              {profile?.phone || NOT_PROVIDED}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Department</span>
            <strong>
              {profile?.department || NOT_PROVIDED}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Role</span>
            <strong>
              {formatRole(profile?.role)}
            </strong>
            <small>
              Role changes are managed by an administrator.
            </small>
          </div>

          <div className="profile-detail">
            <span>Member Since</span>
            <strong>
              {formatDate(profile?.createdAt)}
            </strong>
          </div>
        </div>

        {/* Edit form */}
        {isEditing ? (
          <form
            className="profile-form"
            onSubmit={handleProfileSubmit}
            noValidate
          >
            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="profile-name">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                />
                {profileErrors.name && (
                  <span className="profile-field-error">
                    {profileErrors.name}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
                {profileErrors.phone && (
                  <span className="profile-field-error">
                    {profileErrors.phone}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <label htmlFor="profile-department">
                  Department
                </label>
                <input
                  id="profile-department"
                  type="text"
                  value={form.department}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      department: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
                {profileErrors.department && (
                  <span className="profile-field-error">
                    {profileErrors.department}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email-readonly">
                  Email Address
                </label>
                <input
                  id="profile-email-readonly"
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  disabled
                />
                <span className="profile-field-hint">
                  Email cannot be changed here.
                </span>
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-btn ghost"
                onClick={cancelEdit}
                disabled={savingProfile}
              >
                <X
                  size={15}
                  aria-hidden="true"
                />
                Cancel
              </button>

              <button
                type="submit"
                className="profile-btn"
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <Loader2
                    size={15}
                    className="profile-spinner"
                    aria-hidden="true"
                  />
                ) : (
                  <Check
                    size={15}
                    aria-hidden="true"
                  />
                )}
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-btn"
              onClick={() => {
                setProfileMessage({
                  type: "",
                  text: "",
                });
                setIsEditing(true);
              }}
            >
              <Pencil
                size={15}
                aria-hidden="true"
              />
              Edit Profile
            </button>
          </div>
        )}

        {profileMessage.text && (
          <div
            className={`profile-alert ${profileMessage.type}`}
            role="status"
          >
            {profileMessage.type === "success" ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <AlertCircle
                size={16}
                aria-hidden="true"
              />
            )}
            <span>{profileMessage.text}</span>
          </div>
        )}
      </div>

      {/* ================= CHANGE PASSWORD ================= */}
      <div className="dashboard-card profile-card">
        <div className="card-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <KeyRound size={18} color="#10b981" />
            <h3>Change Password</h3>
          </div>
          <span className="status-pill good">
            <Shield size={12} aria-hidden="true" />
            Secured
          </span>
        </div>

        <form
          className="profile-form"
          onSubmit={handlePasswordSubmit}
          noValidate
        >
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="current-password">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
              />
              {passwordErrors.currentPassword && (
                <span className="profile-field-error">
                  {passwordErrors.currentPassword}
                </span>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
              />
              {passwordErrors.newPassword && (
                <span className="profile-field-error">
                  {passwordErrors.newPassword}
                </span>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Re-enter new password"
              />
              {passwordErrors.confirmPassword && (
                <span className="profile-field-error">
                  {passwordErrors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              className="profile-btn"
              disabled={savingPassword}
            >
              {savingPassword ? (
                <Loader2
                  size={15}
                  className="profile-spinner"
                  aria-hidden="true"
                />
              ) : (
                <KeyRound
                  size={15}
                  aria-hidden="true"
                />
              )}
              {savingPassword
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </form>

        {passwordMessage.text && (
          <div
            className={`profile-alert ${passwordMessage.type}`}
            role="status"
          >
            {passwordMessage.type === "success" ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <AlertCircle
                size={16}
                aria-hidden="true"
              />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileManagement;
