import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    // passive: the browser can start scrolling without waiting to see whether
    // this handler calls preventDefault. A non-passive scroll listener on
    // window is a standard cause of stuttery scrolling on phones.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /*
   * Hold the page still while the drawer is open. The drawer covers the
   * viewport but the document behind it still scrolls, so dragging anywhere on
   * the menu scrolled the page underneath — the menu appeared to stick while
   * the content slid, which is most of why the interaction felt broken on a
   * phone. Restores whatever inline value was there rather than assuming none.
   */
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  /*
   * Belt and braces: shut the drawer whenever the route changes. Every link
   * inside it already closes it on click, but that relies on each one
   * remembering to — and a menu left open over the new page is exactly the
   * failure that looks like the tap did nothing.
   */
  useEffect(() => setMobileOpen(false), [location.pathname]);

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
                          ? "py-2 bg-white/75 dark:bg-navy/75 backdrop-blur-xl ring-1 ring-navy/[0.06] dark:ring-white/[0.08] shadow-[0_10px_40px_-14px_rgba(11,36,71,0.35)]"
                          /* Over the hero the ring was white/20 — an outline
                             bright enough to read as a drawn border on top of
                             the highlight above it. Halved, so the bar is
                             defined by its blur and shadow rather than a line
                             around it. */
                          : "py-3 bg-white/10 backdrop-blur-md ring-1 ring-white/[0.10] shadow-[0_14px_50px_-18px_rgba(0,0,0,0.55)]"
                      }`}
        >
          {/*
            Glass edge, kept faint. At white/70 this was a hard bright line
            drawn across the top rather than a rim catching light — the eye read
            it as a stray border. It also only earns its place once the bar has
            a solid background to sit against; over the hero there is nothing
            for it to define, so it fades out there entirely.

            Inset from the sides so it ends before the curve begins, instead of
            running toward corners it can't follow.
          */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r
                        from-transparent to-transparent transition-opacity duration-500
                        ${scrolled ? "via-white/30 dark:via-white/20 opacity-100" : "via-white/20 opacity-0"}`}
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
          {/*
            min-w-0 instead of shrink-0. Held rigid, the logo plus wordmark
            needed 229px of a 319px content width on a 375px screen, leaving too
            little for the theme switch and burger — they were pushed 48px
            outside the bar. Allowed to give way, the wordmark truncates and
            everything stays inside.
          */}
          <NavLink
            to="/"
            className="group/logo flex items-center gap-2 min-w-0"
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
                          shrink-0
                          ${scrolled ? "h-10 w-10 sm:h-11 sm:w-11" : "h-11 w-11 sm:h-14 sm:w-14"}`}
              onError={(e) => (e.target.style.display = "none")}
            />
            {/* truncate needs the min-w-0 above to have any effect — without a
                shrinkable parent a flex child refuses to go below its content
                width and overflows instead. */}
            <span className={`font-display font-bold text-base sm:text-lg leading-tight truncate ${scrolled ? "text-navy dark:text-white" : "text-white"}`}>
              {COMPANY.name}
            </span>
          </NavLink>

          {/*
            Tight gap because the links now carry their own px-3 padding for the
            hover pill. Keeping the original gap-5 on top of that padding made
            the row wider than the bar, which pushed the Get Free Quote button
            out past the rounded edge.
          */}
          <div className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 min-w-0">
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
            {/*
              -mr-3 removed. It pulled the icon back toward the old full-width
              bar's content edge, but this bar has its own padding, so the
              negative margin pushed the button past the rounded edge — 48px
              outside it on a 375px screen, and outside the viewport too.
              -mr-1 keeps the optical alignment without leaving the bar.
            */}
            <button
              className={`text-2xl p-3 -mr-1 ${scrolled ? "text-navy dark:text-white" : "text-white"}`}
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
              {/* Was 24px — the smallest target in the menu, and the one a
                  visitor reaches for when they want out of it. p-3 with a
                  matching negative margin keeps the icon where it looks right
                  while giving it a 48px box. */}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-2xl p-3 -m-3"
              >
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
