import { HardHat } from "lucide-react";

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { buildMenuForRole } from "../../config/roleMenu";
import { useCurrentUser } from "../../utils/auth";

// ONE sidebar for every role.
//
// The items are not hard-coded here: they are looked up from the
// signed-in user's real role in config/roleMenu.js, which is also what
// refreshes the menu on logout/login without a page reload.
//
// Everything that draws the menu - the logo block, the section markup,
// the item markup, the class names, the collapsed/drawer behaviour, the
// Escape key and the body scroll lock - is exactly as it was.
function Sidebar({ collapsed = false, drawerOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  // The authenticated user record (id, name, role, profile photo, ...).
  // Kept in sync by UserProfileSync and by any profile update.
  const currentUser = useCurrentUser();

  // currentUser.role -> role menu configuration -> allowed items only.
  const menu = buildMenuForRole(currentUser?.role);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, onClose]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const sidebarClass = [
    "sidebar",
    collapsed ? "collapsed" : "",
    drawerOpen ? "drawer-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {drawerOpen && (
        <div
          className="sidebar-overlay show"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClass} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-mark" aria-hidden="true">
            <HardHat size={20} strokeWidth={2} />
          </span>
          <div className="sidebar-logo-text">
            <h2>BUILDTRACK</h2>
            <span>PROJECT MANAGEMENT</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menu.map((group) => (
            <div className="menu-group" key={group.section}>
              <p className="menu-title">{group.section}</p>

              {group.items.map((item) => {
                const Icon = item.icon;

                // Current active page check
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.name}
                    className={`menu-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => handleSelect(item.path)}
                    data-label={item.name}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
