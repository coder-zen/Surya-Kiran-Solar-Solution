import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaPhoneAlt } from "react-icons/fa";
import { NAVBAR_GROUPS, COMPANY } from "../../config/constants";
import { Assets } from "../../config/images";
import EnquiryModal from "../common/EnquiryModal";
import ThemeToggle from "../common/ThemeToggle";
import NavDropdown from "./NavDropdown";
import MobileNavAccordion from "./MobileNavAccordion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    // passive: the browser can start scrolling without waiting to see whether
    // this handler calls preventDefault. A non-passive scroll listener on
    // window is a standard cause of stuttery scrolling on phones.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /*
   * Cursor spotlight. Writing the pointer position straight to CSS custom
   * properties keeps this off React's render path — a mousemove handler that
   * called setState would re-render the whole navigation on every pixel of
   * movement. The glow itself is a radial-gradient layer that reads those two
   * variables, so moving it costs a paint and nothing else.
   */
  const handlePointer = (event) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    bar.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    bar.style.setProperty("--my", `${event.clientY - rect.top}px`);
    bar.style.setProperty("--glow", "1");
  };

  const clearPointer = () => barRef.current?.style.setProperty("--glow", "0");

  return (
    <>
      {/*
        The bar floats clear of the viewport edge instead of being welded to it,
        which is most of what separates a designed header from a default one:
        detached, it can cast a shadow and read as an object above the page
        rather than a strip painted onto it.

        perspective here (not on the bar) is what makes the children's rotateX
        actually foreshorten. Applied to the element itself it would have no
        depth to project into.
      */}
      <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-5 pt-3 sm:pt-4 pointer-events-none">
        <nav
          ref={barRef}
          onPointerMove={handlePointer}
          onPointerLeave={clearPointer}
          style={{ perspective: "1200px" }}
          /*
           * No overflow-hidden here. Clipping the decorative layers to the
           * rounded corners that way also clipped the dropdown panels, which
           * are children of this element — they opened into a 1px sliver under
           * the bar. Each decorative layer rounds its own corners instead, so
           * nothing needs to clip its children.
           */
          className={`pointer-events-auto group relative mx-auto flex max-w-7xl items-center justify-between
                      gap-4 rounded-2xl px-4 sm:px-6
                      transition-[padding,background-color,box-shadow] duration-500 ease-out
                      ${
                        scrolled
                          ? "py-2 bg-white/75 dark:bg-navy/75 backdrop-blur-xl ring-1 ring-navy/10 dark:ring-white/10 shadow-[0_10px_40px_-12px_rgba(11,36,71,0.45)]"
                          : "py-3 bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-[0_12px_45px_-15px_rgba(0,0,0,0.6)]"
                      }`}
        >
          {/* Glass edge. A real pane catches light along its top rim; without
              this the blur reads as a flat grey wash. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />

          {/* Cursor spotlight, driven entirely by the CSS variables above. */}
          {/* rounded-2xl matches the bar, so the glow stays inside the corners
              without the parent having to clip anything. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-[var(--glow,0)] transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,122,0,0.18), transparent 65%)",
            }}
          />
          <NavLink
            to="/"
            className="group/logo flex items-center gap-2 shrink-0"
            style={{ perspective: "600px" }}
          >
            {/* TODO: Replace with real logo — see src/config/images.js -> companyLogo */}
            {/* Lifts and turns slightly toward the viewer on hover — the mark is
                the one element here that can carry a little physicality without
                getting in the way of reading the nav. */}
            <img
              src={scrolled ? Assets.companyLogo : Assets.companyLogoLight}
              alt={COMPANY.name}
              className={`object-contain rounded-xl shrink-0 transition-all duration-500 ease-out
                          shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)]
                          group-hover/logo:[transform:rotateY(-14deg)_translateZ(14px)]
                          ${scrolled ? "h-11 w-11" : "h-14 w-14"}`}
              onError={(e) => (e.target.style.display = "none")}
            />
            <span className={`font-display font-bold text-lg leading-tight ${scrolled ? "text-navy dark:text-white" : "text-white"}`}>
              {COMPANY.name}
            </span>
          </NavLink>

          <div className="hidden xl:flex items-center gap-5 2xl:gap-7">
            {NAVBAR_GROUPS.map((entry) =>
              entry.type === "dropdown" ? (
                <NavDropdown key={entry.key} label={entry.label} items={entry.items} scrolled={scrolled} />
              ) : entry.external ? (
                /* Leaves the site, so a plain anchor in a new tab — a NavLink
                   would try to route it internally and 404. */
                <a
                  key={entry.href}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 whitespace-nowrap text-sm font-medium transition-colors hover:text-solar-orange ${
                    scrolled ? "text-ink" : "text-white"
                  }`}
                >
                  {entry.label}
                </a>
              ) : (
                <NavLink
                  key={entry.path}
                  to={entry.path}
                  className={({ isActive }) =>
                    `relative shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium
                     transition-[color,transform] duration-200 [transform-style:preserve-3d]
                     hover:-translate-y-px hover:[transform:rotateX(12deg)]
                     ${scrolled ? "text-ink dark:text-gray-200" : "text-white"}
                     ${isActive ? "text-solar-orange" : "hover:text-solar-orange"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/*
                        One element shared across every link via layoutId, so
                        changing page slides it to the new tab instead of
                        cross-fading two separate highlights. Behind the label
                        so the text stays legible on top of it.
                      */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-pill"
                          aria-hidden
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className={`absolute inset-0 -z-10 rounded-lg ${
                            scrolled ? "bg-solar-orange/10" : "bg-white/15"
                          }`}
                        />
                      )}
                      {entry.label}
                    </>
                  )}
                </NavLink>
              )
            )}
          </div>

          <div className="hidden xl:flex items-center gap-4 shrink-0">
            <ThemeToggle scrolled={scrolled} />
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className={`flex items-center gap-2 whitespace-nowrap text-sm font-semibold ${scrolled ? "text-navy dark:text-white" : "text-white"}`}
            >
              <FaPhoneAlt /> {COMPANY.phone}
            </a>
            <button onClick={() => setQuoteOpen(true)} className="btn-primary !py-2.5 !px-5 text-sm whitespace-nowrap">
              Get Free Quote
            </button>
          </div>

          {/* p-3 with a matching negative margin: the icon stays visually where
              it was, but the tap target grows from 24x24 to 48x48. At 24px it
              was well under the ~44px minimum for a reliable touch, which is
              why the menu appeared to need several taps to open. */}
          {/* Sits outside the drawer on mobile: switching theme shouldn't cost
              a menu open, and it's the kind of control people reach for at a
              glance. */}
          <div className="xl:hidden flex items-center gap-1 shrink-0">
            <ThemeToggle scrolled={scrolled} />
            <button
              className={`text-2xl p-3 -mr-3 ${scrolled ? "text-navy dark:text-white" : "text-white"}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-navy-dark/95 backdrop-blur-md text-white p-6 xl:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-2xl">
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col gap-6 mt-10">
              {NAVBAR_GROUPS.map((entry) =>
                entry.type === "dropdown" ? (
                  <MobileNavAccordion
                    key={entry.key}
                    label={entry.label}
                    items={entry.items}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ) : entry.external ? (
                  <a
                    key={entry.href}
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="text-xl font-display font-semibold py-2"
                  >
                    {entry.label}
                  </a>
                ) : (
                  <NavLink
                    key={entry.path}
                    to={entry.path}
                    onClick={() => setMobileOpen(false)}
                    /* py-2 brings the row to ~44px. At its natural 28px this
                       had the same too-small-to-hit problem as the hamburger,
                       which is why the mobile menu felt unreliable beyond the
                       hamburger itself. */
                    className="text-xl font-display font-semibold py-2"
                  >
                    {entry.label}
                  </NavLink>
                )
              )}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setQuoteOpen(true);
                }}
                className="btn-primary mt-4"
              >
                Get Free Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EnquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} source="hero_cta" />
    </>
  );
};

export default Navbar;
