import { createContext, useContext, useEffect, useState } from "react";

/**
 * Light/dark theme, remembered per visitor.
 *
 * The stored choice always wins; a first-time visitor gets whatever their
 * device already prefers, so someone browsing at night lands in dark without
 * hunting for a toggle. Only an explicit choice is written to storage, which is
 * what lets "follow the system" remain the default until they say otherwise.
 */

const STORAGE_KEY = "sk-theme";
const ThemeContext = createContext(null);

/** Reads the effective theme without touching React state — also used by the pre-paint script. */
export const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Private browsing can throw on localStorage access; fall through to the OS.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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

  useEffect(() => {
    /*
     * Follow the OS while the visitor hasn't expressed a preference. Once they
     * have, their choice is in storage and this stops overriding it — changing
     * the system theme shouldn't undo a deliberate click.
     */
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;

    const onChange = (event) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        return;
      }
      setTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
