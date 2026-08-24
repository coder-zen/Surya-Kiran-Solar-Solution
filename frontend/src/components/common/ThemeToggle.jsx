import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

/**
 * Sliding light/dark switch for the navbar: sun, track, moon.
 *
 * Both destinations are visible at rest, so the control reads as a choice
 * between two states rather than a mystery button — the icon-only version gave
 * no clue what pressing it would do until you pressed it.
 *
 * `scrolled` mirrors the navbar's own state. Over the hero the bar is
 * transparent and its contents are white; once it gains a solid background they
 * have to switch to navy or the whole control disappears against whichever
 * surface it is sitting on.
 */
const ThemeToggle = ({ scrolled = false }) => {
  const { isDark, toggleTheme } = useTheme();

  // Muted icons still need to be legible, and "muted on a photo" and "muted on
  // white" are different colours.
  const dim = scrolled ? "text-gray-400 dark:text-gray-500" : "text-white/50";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      /*
       * role="switch" + aria-checked is the honest description: this is a
       * two-state control, not a button that performs an action. The label
       * stays constant because the state is carried by aria-checked — a label
       * that also changed would announce the change twice.
       */
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      // py-3 with a negative margin keeps the visual size small while giving the
      // control a full-height tap target on phones.
      className="flex items-center gap-2 py-3 -my-3 shrink-0"
    >
      <FaSun size={13} className={isDark ? dim : "text-solar-yellow"} />

      <span
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
          scrolled
            ? "bg-gray-200 dark:bg-white/20"
            : "bg-white/25 ring-1 ring-white/30"
        }`}
      >
        {/*
          Offset is an inline style, not a utility class. Both Tailwind routes
          failed here: translate-x-* set --tw-translate-x but the composed
          transform resolved to `none`, and swapping left-1/left-6 toggled the
          class correctly while the computed value stayed pinned — no matching
          rule was setting `left` at all. An inline style has no cascade to lose
          to, and for a single animated offset it states the intent directly:
          track 44px, knob 16px, 4px inset, so 44 - 16 - 4 = 24px at the far end.
        */}
        <span
          style={{ left: isDark ? 24 : 4 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm
                     transition-[left] duration-300 ease-out"
        />
      </span>

      <FaMoon size={13} className={isDark ? "text-indigo-300" : dim} />
    </button>
  );
};

export default ThemeToggle;
