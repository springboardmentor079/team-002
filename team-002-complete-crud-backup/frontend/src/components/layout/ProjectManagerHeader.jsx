import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ProjectManagerHeader() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/notifications/unread-count");
        if (mounted && response.data.success) {
          setUnreadCount(response.data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    fetchUnreadCount();

    return () => {
      mounted = false;
    };
  }, []);

  // Get logged-in user from storage
  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : {
        name: "Project Manager",
        role: "project_manager",
      };

  // Generate initials
  const getInitials = (name) => {
    if (!name) return "PM";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Role formatting
  const formatRole = (role) => {
    if (!role) return "Project Manager";

    return role
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="pm-header">
      {/* LEFT SIDE */}
      <div className="pm-header-left">
        <button className="pm-menu-button">
          <Menu size={22} />
        </button>

        <h2>Project Manager Dashboard</h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="pm-header-right">

        {/* SEARCH */}
        <div className="pm-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search anything..."
          />
        </div>

        {/* NOTIFICATIONS */}
        <button className="pm-notification-button">
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="pm-notification-badge">
              {unreadCount}
            </span>
          )}
        </button>

        {/* PROFILE */}
        <div className="pm-profile-wrapper">

          <button
            className="pm-profile"
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
          >
            <div className="pm-avatar">
              {getInitials(user.name)}
            </div>

            <div className="pm-profile-info">
              <strong>{user.name}</strong>

              <span>
                {formatRole(user.role)}
              </span>
            </div>

            <ChevronDown size={17} />
          </button>

          {/* PROFILE DROPDOWN */}
          {showProfileMenu && (
            <div className="pm-profile-dropdown">

              <div className="pm-dropdown-user">
                <div className="pm-dropdown-avatar">
                  {getInitials(user.name)}
                </div>

                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="pm-dropdown-line" />

              <button className="pm-dropdown-item">
                <User size={17} />
                My Profile
              </button>

              <button
                className="pm-dropdown-item logout"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default ProjectManagerHeader;