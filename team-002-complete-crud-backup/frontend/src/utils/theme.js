// BuildTrack Theme Management System
// 12 Curated Professional Themes for Construction Management

export const THEME_CATEGORIES = [
  "All",
  "Dark & Cyber",
  "Light & High-Vis",
  "Industrial",
  "Earth & Material",
];

export const THEMES = [
  // --- CLASSIC & LIGHT ---
  {
    id: "light",
    name: "Classic Light",
    category: "Light & High-Vis",
    description: "Default BuildTrack theme: crisp white cards, slate canvas and amber accents",
    icon: "☀️",
    colors: {
      bg: "#f4f6f9",
      card: "#ffffff",
      accent: "#d97706",
      border: "#e5e7eb",
    },
  },
  {
    id: "solar",
    name: "Solar Daylight",
    category: "Light & High-Vis",
    description: "High-contrast daylight outdoor mode optimized for sun-lit construction tablets",
    icon: "🌤️",
    colors: {
      bg: "#fefce8",
      card: "#ffffff",
      accent: "#ca8a04",
      border: "#e2e8f0",
    },
  },

  // --- DARK & CYBER ---
  {
    id: "dark",
    name: "Obsidian Dark",
    category: "Dark & Cyber",
    description: "Deep charcoal canvas, matte cards & vivid cobalt blue highlights",
    icon: "🌙",
    colors: {
      bg: "#0b0f19",
      card: "#1e293b",
      accent: "#3b82f6",
      border: "#334155",
    },
  },
  {
    id: "navy",
    name: "Midnight Ocean",
    category: "Dark & Cyber",
    description: "Deep ocean depths with electric cyan and sapphire accents",
    icon: "🌌",
    colors: {
      bg: "#070d1e",
      card: "#112144",
      accent: "#06b6d4",
      border: "#1e3564",
    },
  },
  {
    id: "purple",
    name: "Cyber Amethyst",
    category: "Dark & Cyber",
    description: "Cosmic synthwave violet with neon purple and magenta accents",
    icon: "🔮",
    colors: {
      bg: "#0d0918",
      card: "#20183b",
      accent: "#a855f7",
      border: "#37285e",
    },
  },
  {
    id: "matrix",
    name: "Matrix Terminal",
    category: "Dark & Cyber",
    description: "High-tech pitch black with radioactive terminal green highlights",
    icon: "⚡",
    colors: {
      bg: "#050805",
      card: "#0c150c",
      accent: "#22c55e",
      border: "#143016",
    },
  },
  {
    id: "crimson",
    name: "Crimson Steel",
    category: "Dark & Cyber",
    description: "Forged ironwork with bold ruby laser and brushed titanium tones",
    icon: "🌹",
    colors: {
      bg: "#150a0d",
      card: "#261217",
      accent: "#f43f5e",
      border: "#431d27",
    },
  },

  // --- INDUSTRIAL & SAFETY ---
  {
    id: "amber",
    name: "Industrial Amber",
    category: "Industrial",
    description: "High-contrast construction steel with safety amber and hazard stripes",
    icon: "🚧",
    colors: {
      bg: "#111215",
      card: "#212328",
      accent: "#f59e0b",
      border: "#34373f",
    },
  },

  // --- EARTH & MATERIAL ---
  {
    id: "emerald",
    name: "Emerald Forest",
    category: "Earth & Material",
    description: "Deep botanical pine tones with mint green and eco-construction accents",
    icon: "🌲",
    colors: {
      bg: "#061412",
      card: "#112e29",
      accent: "#10b981",
      border: "#1e4a42",
    },
  },
  {
    id: "sunset",
    name: "Sunset Terracotta",
    category: "Earth & Material",
    description: "Warm architectural terracotta, burnt clay and masonry sunset tones",
    icon: "🌅",
    colors: {
      bg: "#16110f",
      card: "#261b17",
      accent: "#f97316",
      border: "#3d2a23",
    },
  },
  {
    id: "arctic",
    name: "Arctic Frost",
    category: "Earth & Material",
    description: "Scandinavian glacial slate with iceberg blue and frosted silver accents",
    icon: "🧊",
    colors: {
      bg: "#0e1724",
      card: "#18263a",
      accent: "#38bdf8",
      border: "#243956",
    },
  },
  {
    id: "espresso",
    name: "Espresso Timber",
    category: "Earth & Material",
    description: "Aged walnut timber and dark espresso leather with warm bronze accents",
    icon: "🪵",
    colors: {
      bg: "#120e0c",
      card: "#221a16",
      accent: "#d97706",
      border: "#3a2d26",
    },
  },
];

const THEME_KEY = "buildtrack_theme";

/**
 * Get current active theme ID
 */
export const getActiveTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // localStorage unavailable
  }
  return "light";
};

/**
 * Apply theme to document element
 */
export const applyTheme = (themeId) => {
  const theme = THEMES.some((t) => t.id === themeId) ? themeId : "light";

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignored
  }

  // Dispatch custom event for listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("buildtrack:themechange", { detail: { theme } })
    );
  }

  return theme;
};

// Initial immediate application on script load
if (typeof document !== "undefined") {
  const initialTheme = getActiveTheme();
  document.documentElement.setAttribute("data-theme", initialTheme);
  document.body.setAttribute("data-theme", initialTheme);
}
