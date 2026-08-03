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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors ${
          scrolled ? "text-ink" : "text-white"
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
            className="absolute left-0 top-full mt-3 min-w-[180px] rounded-xl bg-white p-2 shadow-premium"
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
