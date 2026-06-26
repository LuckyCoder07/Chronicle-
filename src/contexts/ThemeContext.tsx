import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType = "classic" | "sepia" | "nordic" | "forest" | "plum" | "midnight";

export interface ColorTheme {
  id: ThemeType;
  name: string;
  isDark: boolean;
  colors: {
    bg: string;
    text: string;
    accent: string;
    border: string;
    muted: string;
    active: string;
    panel: string;
    prose: string;
  };
}

export const THEMES: ColorTheme[] = [
  {
    id: "classic",
    name: "Classic Editorial",
    isDark: false,
    colors: {
      bg: "#FCFCFC",
      text: "#111111",
      accent: "#111111",
      border: "#EEEEEE",
      muted: "#666666",
      active: "#F5F5F5",
      panel: "#FFFFFF",
      prose: "#333333",
    },
  },
  {
    id: "sepia",
    name: "Warm Sepia",
    isDark: false,
    colors: {
      bg: "#FAF4EB",
      text: "#2D1E12",
      accent: "#B85A38",
      border: "#EADDC9",
      muted: "#7C6352",
      active: "#F1E4CE",
      panel: "#FDFBF7",
      prose: "#443022",
    },
  },
  {
    id: "nordic",
    name: "Nordic Slate",
    isDark: false,
    colors: {
      bg: "#EAEFF2",
      text: "#1A2E40",
      accent: "#0077B6",
      border: "#CFDCE3",
      muted: "#5C6F80",
      active: "#DDE6EB",
      panel: "#F4F7F9",
      prose: "#283C4F",
    },
  },
  {
    id: "forest",
    name: "Forest Matcha",
    isDark: false,
    colors: {
      bg: "#F2F4EC",
      text: "#1C2D22",
      accent: "#2A6F40",
      border: "#DFE4D4",
      muted: "#556F5E",
      active: "#E4EAD6",
      panel: "#F8F9F5",
      prose: "#253B2D",
    },
  },
  {
    id: "plum",
    name: "Royal Plum",
    isDark: false,
    colors: {
      bg: "#FAF2F7",
      text: "#2C1225",
      accent: "#8B1E6D",
      border: "#EEDCE9",
      muted: "#7E5B75",
      active: "#F3E3F0",
      panel: "#FCFAF6",
      prose: "#3E1F36",
    },
  },
  {
    id: "midnight",
    name: "Midnight Royal",
    isDark: true,
    colors: {
      bg: "#0B0F19",
      text: "#F1F5F9",
      accent: "#38BDF8",
      border: "#1E293B",
      muted: "#94A3B8",
      active: "#1E293B",
      panel: "#111827",
      prose: "#CBD5E1",
    },
  },
];

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem("chronicle-theme") as ThemeType;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    // Respect system dark mode or default to classic
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "midnight";
    }
    return "classic";
  });

  const activeTheme = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    
    // Set standard class for generic dark mode utilities
    if (activeTheme.isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set CSS variables
    root.style.setProperty("--bg-color", activeTheme.colors.bg);
    root.style.setProperty("--text-color", activeTheme.colors.text);
    root.style.setProperty("--accent-color", activeTheme.colors.accent);
    root.style.setProperty("--border-color", activeTheme.colors.border);
    root.style.setProperty("--muted-color", activeTheme.colors.muted);
    root.style.setProperty("--active-color", activeTheme.colors.active);
    root.style.setProperty("--panel-color", activeTheme.colors.panel);
    root.style.setProperty("--prose-text", activeTheme.colors.prose);

    localStorage.setItem("chronicle-theme", currentTheme);
  }, [currentTheme, activeTheme]);

  const setTheme = (theme: ThemeType) => {
    setCurrentThemeState(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isDark: activeTheme.isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
