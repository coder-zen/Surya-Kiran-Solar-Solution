import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

/**
 * Desktop-only grouped nav trigger: opens on hover or keyboard focus,
 * closes on click-outside, Escape (refocusing the trigger), or blur.
 */
const NavDropdown = ({ label, items, scrolled }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();
  const location = useLocation();

  const isGroupActive = items.some((item) => location.pathname.startsWith(item.path));

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    // pointerdown rather than mousedown: mousedown never fires on a touch
    // screen, so on a phone or tablet tapping elsewhere left the menu open.
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open]);

  /*
   * Shut on navigation. Clicking an item inside the menu closes it directly,
   * but the browser back button and any link elsewhere on the bar change the
   * route without touching this component, which used to leave a menu hanging
   * open over the new page.
   */
  useEffect(() => setOpen(false), [location.pathname]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleBlur = (e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        /*
         * Toggle, not open. This forced open to true, so the trigger was a
         * one-way switch: click-outside deliberately ignores clicks inside the
         * container, and the trigger is inside it, so once a menu was opened by
         * clicking there was no way to shut it again from the keyboard or on a
         * touch screen — where mouseleave never fires either.
         */
        onClick={() => setOpen((isOpen) => !isOpen)}
        // px-3 py-1.5 matches the plain nav links, so triggers and links sit on
        // the same rhythm now that the row's gap has been tightened.
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          scrolled ? "text-ink dark:text-gray-200" : "text-white"
        } ${isGroupActive ? "text-solar-orange" : "hover:text-solar-orange"}`}
      >
        {label}
        <FaChevronDown className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full mt-3 min-w-[180px] rounded-xl bg-white dark:bg-navy p-2 shadow-premium"
          >
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-solar-orange/10 text-solar-orange" : "text-ink hover:bg-navy/5 hover:text-solar-orange"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavDropdown;
