import { createContext, useContext, useEffect, useState } from "react";

/**
 * Light/dark theme, remembered per visitor.
 *
 * Light is the default for everyone who hasn't chosen. The site's brand
 * treatment is the light one, so that is what a first-time visitor should meet
 * regardless of how their device happens to be configured; dark is opt-in
 * through the navbar toggle. Once chosen, the preference is stored and wins on
 * every later visit.
 */

const STORAGE_KEY = "sk-theme";
const ThemeContext = createContext(null);

/** Reads the effective theme without touching React state — mirrored by the pre-paint script. */
export const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Private browsing can throw on localStorage access; light is a fine default.
  }
  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    // Lets the browser paint form controls, scrollbars and the address bar to
    // match, which CSS alone doesn't cover.
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Not fatal — the theme still applies for this page view.
    }
  }, [theme]);

  /*
   * No listener on prefers-color-scheme. The site defaults to light rather than
   * following the device, so reacting to an OS change would flip the theme out
   * from under a visitor who never asked for dark.
   */

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
