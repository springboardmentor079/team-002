import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  BellOff,
  ChevronDown,
  User,
  LogOut,
  Settings,
  X,
  CheckCheck,
  ArrowRight,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import ThemeSwitcher from "../common/ThemeSwitcher";

import { adminMenu } from "./Sidebar";
import { clientMenu } from "./ClientSidebar";
import { contractorMenu } from "./ContractorSidebar";
import { projectManagerMenu } from "./ProjectManagerSidebar";
import { siteEngineerMenu } from "./SiteEngineerSidebar";
import { workerMenu } from "./WorkerSidebar";

// Existing navigation for each portal — reused for global search so we
// never invent routes or results.
const ROLE_NAV = [
  { prefix: "/admin", menu: adminMenu },
  { prefix: "/project-manager", menu: projectManagerMenu },
  { prefix: "/site-engineer", menu: siteEngineerMenu },
  { prefix: "/contractor", menu: contractorMenu },
  { prefix: "/client", menu: clientMenu },
  { prefix: "/worker", menu: workerMenu },
];

const notificationIcon = (type) => {
  if (type === "success") return CheckCircle2;
  if (type === "warning" || type === "alert") return AlertTriangle;
  return Info;
};

function Header({ title, onToggleSidebar, showTheme = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Active portal navigation (for search + settings/notifications links)
  const roleNav =
    ROLE_NAV.find((entry) => location.pathname.startsWith(entry.prefix)) ||
    ROLE_NAV[0];

  const navIndex = roleNav.menu.flatMap((group) =>
    group.items.map((item) => ({
      name: item.name,
      path: item.path,
      section: group.section,
      icon: item.icon,
    }))
  );

  const settingsPath = `${roleNav.prefix}/settings`;
  const notificationsPath = `${roleNav.prefix}/notifications`;

  // =========================
  // NOTIFICATIONS (real data)
  // =========================
  useEffect(() => {
    let mounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/notifications/unread-count");
        if (mounted && response.data.success) {
          setUnreadCount(response.data.totalUnread || 0);
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

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get("/notifications");
      if (response.data && response.data.success) {
        const list = response.data.data || [];
        setNotifications(list);
        setUnreadCount(
          response.data.totalUnread ??
            list.filter((n) => !n.read).length
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const unreadItems = notifications.filter((n) => !n.read).length;

  const toggleNotifications = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    setShowDropdown(false);
    setSearchOpen(false);
    if (next) loadNotifications();
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.put("/notifications/mark-all-read");
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const markAsRead = async (notification) => {
    if (notification.read) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notification._id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await api.put(`/notifications/${notification._id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const formatTime = (notification) => {
    if (notification.time) return notification.time;
    if (notification.createdAt) {
      return new Date(notification.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
    return "";
  };

  // =========================
  // GLOBAL SEARCH (frontend, existing routes only)
  // =========================
  const normalizedQuery = query.trim().toLowerCase();

  const results = normalizedQuery
    ? navIndex.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.section.toLowerCase().includes(normalizedQuery)
      )
    : navIndex;

  const closeSearch = () => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const handleSearchSelect = (item) => {
    navigate(item.path);
    setQuery("");
    closeSearch();
  };

  // =========================
  // DISMISS BEHAVIOUR
  // =========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Escape closes search overlay, dropdowns and menus (not navigation).
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      closeSearch();
      setShowDropdown(false);
      setShowNotifications(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // =========================
  // USER
  // =========================
  const getParsedUser = () => {
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };
  const parsedUser = getParsedUser();

  // Determine active route context defaults
  let pageRole = "admin";
  let defaultName = "Admin User";
  let defaultEmail = "admin@buildtrack.com";
  let defaultInitials = "AD";

  if (location.pathname.startsWith("/site-engineer")) {
    pageRole = "site_engineer";
    defaultName = "Site Engineer";
    defaultEmail = "site.engineer@buildtrack.com";
    defaultInitials = "SE";
  } else if (location.pathname.startsWith("/contractor")) {
    pageRole = "contractor";
    defaultName = "Contractor";
    defaultEmail = "contractor@buildtrack.com";
    defaultInitials = "CO";
  } else if (location.pathname.startsWith("/project-manager")) {
    pageRole = "project_manager";
    defaultName = "Project Manager";
    defaultEmail = "project.manager@buildtrack.com";
    defaultInitials = "PM";
  } else if (location.pathname.startsWith("/client")) {
    pageRole = "client";
    defaultName = "Client";
    defaultEmail = "client@buildtrack.com";
    defaultInitials = "CL";
  } else if (location.pathname.startsWith("/worker")) {
    pageRole = "worker";
    defaultName = "Site Worker";
    defaultEmail = "worker@buildtrack.com";
    defaultInitials = "WO";
  } else if (location.pathname.startsWith("/admin")) {
    pageRole = "admin";
    defaultName = "Admin User";
    defaultEmail = "admin@buildtrack.com";
    defaultInitials = "AD";
  }

  const formatRole = (r) => {
    if (!r) return "User";
    return r
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getInitials = (name, fallback = "AD") => {
    if (!name) return fallback;
    const names = name.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (
      names[0].charAt(0) +
      names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const hasMatchingRole = parsedUser && parsedUser.role === pageRole;
  const displayName = hasMatchingRole ? (parsedUser.name || defaultName) : (parsedUser?.name || defaultName);
  const displayRole = formatRole(hasMatchingRole ? parsedUser.role : pageRole);
  const displayEmail = hasMatchingRole ? (parsedUser.email || defaultEmail) : (parsedUser?.email || defaultEmail);
  const displayInitials = getInitials(displayName, defaultInitials);
  const activeRoleClass = hasMatchingRole ? (parsedUser.role || pageRole) : pageRole;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", {
      replace: true,
    });
  };

  // =========================
  // SEARCH RESULTS MARKUP
  // =========================
  const renderSearchResults = (variant) => (
    <div className={`search-results${variant === "mobile" ? " is-mobile" : ""}`}>
      <div className="search-results-head">
        {normalizedQuery ? `Results for “${query.trim()}”` : "Quick navigation"}
      </div>

      {results.length === 0 ? (
        <div className="search-empty">No matching pages found</div>
      ) : (
        results.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              type="button"
              className="search-result"
              onClick={() => handleSearchSelect(item)}
            >
              <span className="search-result-icon">
                <Icon size={15} aria-hidden="true" />
              </span>
              <span className="search-result-text">
                <strong>{item.name}</strong>
                <small>{item.section}</small>
              </span>
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <header className="dashboard-header">
      {/* LEFT SIDE */}
      <div className="header-left">
        <button
          className="menu-button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={21} aria-hidden="true" />
        </button>

        <div className="header-title">
          <h2>{title || `${displayRole} Dashboard`}</h2>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="header-right">
        {/* SEARCH — desktop */}
        <div className="global-search" ref={searchRef}>
          <div className="search-box">
            <Search size={17} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search anything..."
              aria-label="Search anything"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(true);
                }}
                aria-label="Clear search"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {searchOpen && renderSearchResults("desktop")}
        </div>

        {/* SEARCH — mobile trigger */}
        <button
          className="header-search-btn"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Open search"
        >
          <Search size={19} aria-hidden="true" />
        </button>

        {/* NOTIFICATIONS */}
        <div className="notification-wrap" ref={notificationRef}>
          <button
            className="notification-button"
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={20} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-panel-head">
                <strong>Notifications</strong>
                {unreadItems > 0 && (
                  <button
                    type="button"
                    className="notification-mark-all"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck size={13} aria-hidden="true" />
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {loadingNotifications ? (
                  <div className="notification-empty">
                    <span>Loading notifications…</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">
                    <BellOff size={20} aria-hidden="true" />
                    <span>No new notifications</span>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notification) => {
                    const Icon = notificationIcon(notification.type);
                    const tone =
                      notification.type === "success"
                        ? "success"
                        : notification.type === "warning" ||
                          notification.type === "alert"
                        ? "warning"
                        : "info";

                    return (
                      <button
                        type="button"
                        key={notification._id}
                        className={`notification-item${
                          notification.read ? "" : " unread"
                        }`}
                        onClick={() => markAsRead(notification)}
                      >
                        <span
                          className={`notification-item-icon tone-${tone}`}
                        >
                          <Icon size={14} aria-hidden="true" />
                        </span>

                        <span className="notification-item-body">
                          <strong>{notification.title}</strong>
                          <span className="notification-item-msg">
                            {notification.message}
                          </span>
                          <span className="notification-item-time">
                            {formatTime(notification)}
                          </span>
                        </span>

                        {!notification.read && (
                          <span className="notification-item-dot" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="notification-panel-foot">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(notificationsPath);
                  }}
                >
                  View all notifications
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* THEME (reuses the existing shared ThemeSwitcher) */}
        {showTheme && <ThemeSwitcher />}

        {/* USER PROFILE */}
        <div
          className="admin-profile-container profile-container"
          ref={dropdownRef}
        >
          <button
            className="admin-profile"
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
              setSearchOpen(false);
            }}
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={showDropdown}
          >
            {/* USER INITIALS */}
            <div className={`profile-avatar role-${activeRoleClass}`}>
              {displayInitials}
            </div>

            {/* USER INFO */}
            <div className="profile-info">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>

            <ChevronDown
              size={16}
              className={
                showDropdown
                  ? "dropdown-arrow rotate"
                  : "dropdown-arrow"
              }
              aria-hidden="true"
            />
          </button>

          {/* DROPDOWN */}
          {showDropdown && (
            <div className="profile-dropdown" role="menu">
              <div className="dropdown-user-info">
                <div className={`dropdown-avatar role-${activeRoleClass}`}>
                  {displayInitials}
                </div>

                <div>
                  <strong>{displayName}</strong>
                  <span>{displayEmail}</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {/* PROFILE */}
              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setShowDropdown(false);
                  navigate(settingsPath);
                }}
              >
                <User size={17} aria-hidden="true" />
                My Profile
              </button>

              {/* SETTINGS */}
              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setShowDropdown(false);
                  navigate(settingsPath);
                }}
              >
                <Settings size={17} aria-hidden="true" />
                Settings
              </button>

              {/* LOGOUT */}
              <button
                className="dropdown-item logout-item"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={17} aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH OVERLAY */}
      {mobileSearchOpen && (
        <div className="mobile-search-overlay" role="dialog" aria-modal="true">
          <div className="mobile-search-bar">
            <Search size={17} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search anything..."
              aria-label="Search anything"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                closeSearch();
                setQuery("");
              }}
              aria-label="Close search"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {renderSearchResults("mobile")}
        </div>
      )}
    </header>
  );
}

export default Header;
