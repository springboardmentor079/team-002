import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "../../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await API.post("/auth/forgot-password", { email });
      setMessage(
        response.data.message ||
          "Password reset instructions have been generated."
      );
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to process request. Please check your email."
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
          <div className="mobile-brand">
            <div className="logo">BT</div>
            <h2>BuildTrack</h2>
          </div>

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