import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

/** Mobile-menu equivalent of NavDropdown — an expandable section (tap to open), since hover doesn't apply on touch. */
const MobileNavAccordion = ({ label, items, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/*
        py-2.5 takes this row from 28px to ~48px. At its natural height it was
        well under the ~44px a finger can reliably hit, so opening a section
        took several attempts — the same fault the top-level drawer links were
        fixed for, which this component never received.
      */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between py-2.5 text-xl font-display font-semibold"
      >
        {label}
        <FaChevronDown className={`text-sm transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/*
              These were the worst of it: 28px rows holding the only links to
              About Us, Services, Projects and Gallery. The gap does the
              spacing visually but contributes nothing to the target, so it
              moves into the links as padding — same rhythm on screen, rows a
              finger can actually land on.
            */}
            <div className="flex flex-col gap-1 pl-4 pt-2">
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className="py-2.5 text-lg font-medium text-white/85 hover:text-solar-orange"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNavAccordion;
