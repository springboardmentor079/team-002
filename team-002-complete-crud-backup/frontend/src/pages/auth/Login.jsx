import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "../../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ================= LOGIN FUNCTION =================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);

      // Backend API Call
      const response = await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      const data = response.data;

      console.log("Login Response:", data);

      // ================= SAVE LOGIN DATA =================

      if (rememberMe) {
        // Permanent until logout
        localStorage.setItem("token", data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // Remove old session data
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

      } else {
        // Available until browser session ends
        sessionStorage.setItem("token", data.token);

        sessionStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // Remove old local data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      const role = data.user.role;

      console.log("Logged in user role:", role);

      // ================= ROLE-WISE REDIRECT =================

      switch (role) {

        // ADMIN
        case "admin":
          navigate("/admin/dashboard", {
            replace: true,
          });
          break;

        // PROJECT MANAGER
        case "project_manager":
          navigate("/project-manager/dashboard", {
            replace: true,
          });
          break;

        // SITE ENGINEER
        case "site_engineer":
          navigate("/site-engineer/dashboard", {
            replace: true,
          });
          break;

        // CONTRACTOR
        case "contractor":
          navigate("/contractor/dashboard", {
            replace: true,
          });
          break;

        // WORKER
        case "worker":
          navigate("/worker/dashboard", {
            replace: true,
          });
          break;

        // CLIENT
        case "client":
          navigate("/client/dashboard", {
            replace: true,
          });
          break;

        // UNKNOWN ROLE
        default:
          setError(
            "Your account role does not have a dashboard yet."
          );
      }

    } catch (error) {
      console.error("Login Error:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ================= LEFT SECTION ================= */}

      <div className="auth-left">

        <div className="brand">
          <div className="logo">
            BT
          </div>

          <h2>
            BuildTrack
          </h2>
        </div>


        <div className="auth-content">

          <span className="welcome-text">
            CONSTRUCTION MANAGEMENT PLATFORM
          </span>


          <h1>
            Manage your projects with confidence.
          </h1>


          <p>
            Track projects, teams, tasks, and construction
            progress seamlessly from one unified workspace.
          </p>


          <div className="auth-features">

            <div>
              <span>✓</span>
              Real-time project monitoring
            </div>

            <div>
              <span>✓</span>
              Team & role management
            </div>

            <div>
              <span>✓</span>
              Smart construction insights
            </div>

          </div>

        </div>


        <div className="left-footer">
          © 2026 BuildTrack. Construction made smarter.
        </div>

      </div>


      {/* ================= RIGHT SECTION ================= */}

      <div className="auth-right">

        <div className="auth-card">

          {/* Mobile Logo */}

          <div className="mobile-brand">

            <div className="logo">
              BT
            </div>

            <h2>
              BuildTrack
            </h2>

          </div>


          {/* Header */}

          <div className="auth-header">

            <h1>
              Welcome back
            </h1>

            <p className="subtitle">
              Enter your credentials to access your dashboard.
            </p>

          </div>


          {/* ================= ERROR MESSAGE ================= */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* ================= LOGIN FORM ================= */}

          <form
            onSubmit={handleLogin}
            noValidate
          >

            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* REMEMBER ME + FORGOT PASSWORD */}

            <div className="form-options">

              <label className="checkbox-container">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                />

                Remember me

              </label>


              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot password?
              </Link>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className={`auth-button ${
                isLoading ? "loading" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>


          {/* REGISTER LINK */}

          <div className="auth-switch">

            Don't have an account?{" "}

            <Link to="/register">
              Create account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;