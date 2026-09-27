import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "../../styles/auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsSuccess(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await API.put(`/auth/reset-password/${token}`, {
        password,
      });

      setIsSuccess(true);
      setMessage(
        response.data.message || "Password reset successfully! Redirecting..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setIsSuccess(false);
      setMessage(
        err.response?.data?.message ||
          "Invalid or expired reset token. Please request a new link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE: Value Proposition */}
      <div className="auth-left">
        <div className="brand">
          <div className="logo">BT</div>
          <h2>BuildTrack</h2>
        </div>

        <div className="auth-content">
          <span className="welcome-text">
            PASSWORD SECURITY
          </span>

          <h1>Create a new secure password.</h1>

          <p>
            Choose a strong password to keep your BuildTrack account and construction project information completely secure.
          </p>

          <div className="auth-features">
            <div>
              <span>✓</span> Secure password encryption
            </div>
            <div>
              <span>✓</span> Protected account access
            </div>
            <div>
              <span>✓</span> Secure project information
            </div>
          </div>
        </div>

        <div className="left-footer">
          © 2026 BuildTrack. Construction made smarter.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Reset Form */}
      <div className="auth-right">
        <div className="auth-card reset-card">
          <div className="mobile-brand">
            <div className="logo">BT</div>
            <h2>BuildTrack</h2>
          </div>

          <div className="auth-header">
            <h1>Reset password</h1>
            <p className="subtitle">
              Create a new password for your BuildTrack account.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* NEW PASSWORD */}
            <div className="input-group">
              <label htmlFor="password">New Password</label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`auth-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? "Updating password..." : "Reset Password"}
            </button>
          </form>

          {message && (
            <div className={isSuccess ? "success-banner" : "error-banner"}>
              {message}
            </div>
          )}

          <p className="auth-switch">
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;