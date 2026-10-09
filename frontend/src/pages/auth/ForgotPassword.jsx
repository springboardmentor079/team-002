import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import AuthBrand from "../../components/auth/AuthBrand";
import "../../styles/auth.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/auth/forgot-password", {
        email: trimmedEmail,
      });

      setMessage(
        response.data.message ||
          " Password reset link has been sent successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again later."
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
            ACCOUNT RECOVERY
          </span>

          <h1>Don't worry, we'll help you get back.</h1>

          <p>
            Enter your registered email address and we'll guide you through resetting your BuildTrack account password safely.
          </p>

          <div className="auth-features">
            <div>
              <span>✓</span> Secure account recovery
            </div>
            <div>
              <span>✓</span> Password reset protection
            </div>
            <div>
              <span>✓</span> Quick access to your workspace
            </div>
          </div>
        </div>

        <div className="left-footer">
          © 2026 BuildTrack. Construction made smarter.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Recovery Form */}
      <div className="auth-right">
        <div className="auth-card forgot-card">
          <AuthBrand variant="mobile" />

          <div className="auth-header">
            <h1>Forgot password?</h1>
            <p className="subtitle">
              Enter the email address associated with your account and we'll help you reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`auth-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {message && (
            <div className="success-banner">
              {message}
            </div>
          )}

          <p className="auth-switch">
            Remember your password?{" "}
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;