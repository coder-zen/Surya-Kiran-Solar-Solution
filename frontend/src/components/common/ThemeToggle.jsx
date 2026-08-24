import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

/**
 * Light/dark switch for the navbar.
 *
 * `scrolled` mirrors the navbar's own state: over the hero the bar is
 * transparent and its contents are white, and once it gains a solid background
 * they turn navy. The icon has to follow, or it disappears against whichever
 * background it happens to be over.
 */
const ThemeToggle = ({ scrolled = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // Announces what a press will do, not what the current state is — a
      // screen reader user needs the action, and the icon already shows state.
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        scrolled
          ? "text-navy hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
          : "text-white hover:bg-white/15"
      }`}
    >
      {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
    </button>
  );
};

export default ThemeToggle;
