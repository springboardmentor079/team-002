import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../services/api";
import AuthBrand from "../../components/auth/AuthBrand";
import "../../styles/auth.css";

// Keep in sync with the backend / User model password rule
const MIN_PASSWORD_LENGTH = 6;

function ResetPassword() {
  const { token: tokenParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // The emailed link uses /reset-password?token=..., the legacy route used
  // /reset-password/:token. Support both.
  const token = searchParams.get("token") || tokenParam || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (!token) {
      setMessage("Password reset link is invalid or has expired.");
      return;
    }

    if (!password) {
      setMessage("Please enter a new password.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
      return;
    }

    if (!confirmPassword) {
      setMessage("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });

      setIsSuccess(true);
      setMessage(
        response.data.message ||
          "Password reset successful. Please login with your new password."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setIsSuccess(false);
      setMessage(
        err.response?.data?.message ||
          "Password reset link is invalid or has expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE: Value Proposition */}
      <div className="auth-left">
        <AuthBrand />

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
          <AuthBrand variant="mobile" />

          <div className="auth-header">
            <h1>Reset password</h1>
            <p className="subtitle">
              Create a new password for your BuildTrack account.
            </p>
          </div>

          {!token && !isSuccess && (
            <div className="error-banner">
              Password reset link is invalid or has expired.{" "}
              <Link to="/forgot-password">Request a new link</Link>
            </div>
          )}

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
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  disabled={isLoading || isSuccess}
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
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  disabled={isLoading || isSuccess}
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
              disabled={isLoading || isSuccess || !token}
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