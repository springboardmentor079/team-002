import { useState, useEffect, useRef } from "react";
import { THEMES, THEME_CATEGORIES, getActiveTheme, applyTheme } from "../../utils/theme";
import { Palette, Check, X, RotateCcw } from "lucide-react";

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState(getActiveTheme());
  const [activeCategory, setActiveCategory] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Sync state if theme changes elsewhere
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail?.theme) {
        setCurrentTheme(e.detail.theme);
      }
    };

    window.addEventListener("buildtrack:themechange", handleThemeChange);
    return () => {
      window.removeEventListener("buildtrack:themechange", handleThemeChange);
    };
  }, []);

  // Close when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (themeId) => {
    applyTheme(themeId);
    setCurrentTheme(themeId);
  };

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  const filteredThemes = activeCategory === "All"
    ? THEMES
    : THEMES.filter((t) => t.category === activeCategory);

  return (
    <div className="bt-theme-switcher-root" ref={panelRef}>
      {/* Floating Trigger Button */}
      <button
        type="button"
        className="bt-theme-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Change Theme & Appearance"
        aria-label="Change Theme"
      >
        <span
          className="bt-theme-dot"
          style={{
            backgroundColor: activeThemeObj.colors.accent,
            color: activeThemeObj.colors.accent,
          }}
        />
        <Palette size={16} />
        <span>{activeThemeObj.name}</span>
      </button>

      {/* Pop-up Theme Selection Panel */}
      {isOpen && (
        <div className="bt-theme-panel" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="bt-theme-header">
            <div className="bt-theme-header-title">
              <Palette size={17} color="#3b82f6" />
              <h4>Workspace Themes</h4>
              <span className="bt-theme-badge">{THEMES.length} Themes</span>
            </div>
            <button
              type="button"
              className="bt-theme-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close theme selector"
            >
              <X size={16} />
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="bt-theme-tabs">
            {THEME_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`bt-theme-tab-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scrollable Theme Grid */}
          <div className="bt-theme-grid">
            {filteredThemes.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`bt-theme-card ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectTheme(theme.id)}
                  title={theme.description}
                >
                  <div
                    className="bt-theme-preview"
                    style={{ backgroundColor: theme.colors.bg }}
                  >
                    <div className="bt-theme-preview-dots">
                      <div
                        className="bt-theme-preview-dot"
                        style={{ backgroundColor: theme.colors.card }}
                        title="Surface color"
                      />
                      <div
                        className="bt-theme-preview-dot"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent color"
                      />
                    </div>
                    <span style={{ fontSize: "14px" }}>{theme.icon}</span>
                  </div>

                  <div className="bt-theme-card-info">
                    <span className="bt-theme-name">
                      {theme.name}
                    </span>
                    {isActive && (
                      <span className="bt-theme-check">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bt-theme-footer">
            <span>Instant preview & auto-saved</span>
            <button
              type="button"
              className="bt-theme-reset-btn"
              onClick={() => handleSelectTheme("light")}
            >
              <RotateCcw size={12} />
              Reset Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
