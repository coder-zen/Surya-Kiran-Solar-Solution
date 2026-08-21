import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaPhoneAlt } from "react-icons/fa";
import { NAVBAR_GROUPS, COMPANY } from "../../config/constants";
import { Assets } from "../../config/images";
import EnquiryModal from "../common/EnquiryModal";
import NavDropdown from "./NavDropdown";
import MobileNavAccordion from "./MobileNavAccordion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    // passive: the browser can start scrolling without waiting to see whether
    // this handler calls preventDefault. A non-passive scroll listener on
    // window is a standard cause of stuttery scrolling on phones.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
          }`}
      >
        <nav className="container-custom flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            {/* TODO: Replace with real logo — see src/config/images.js -> companyLogo */}
            <img
              src={scrolled ? Assets.companyLogo : Assets.companyLogoLight}
              alt={COMPANY.name}
              className="h-14 w-14 object-contain rounded-xl shadow-sm shrink-0"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span className={`font-display font-bold text-lg leading-tight ${scrolled ? "text-navy" : "text-white"}`}>
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
                    `shrink-0 whitespace-nowrap text-sm font-medium transition-colors ${scrolled ? "text-ink" : "text-white"
                    } ${isActive ? "text-solar-orange" : "hover:text-solar-orange"}`
                  }
                >
                  {entry.label}
                </NavLink>
              )
            )}
          </div>

          <div className="hidden xl:flex items-center gap-4 shrink-0">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className={`flex items-center gap-2 whitespace-nowrap text-sm font-semibold ${scrolled ? "text-navy" : "text-white"}`}
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
          <button
            className={`xl:hidden text-2xl p-3 -mr-3 ${scrolled ? "text-navy" : "text-white"}`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <FaBars />
          </button>
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
