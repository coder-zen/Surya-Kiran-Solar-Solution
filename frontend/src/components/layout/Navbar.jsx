import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaPhoneAlt } from "react-icons/fa";
import { NAV_LINKS, COMPANY } from "../../config/constants";
import { Assets } from "../../config/images";
import EnquiryModal from "../common/EnquiryModal";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
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

          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.slice(0, 8).map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${scrolled ? "text-ink" : "text-white"
                  } ${isActive ? "text-solar-orange" : "hover:text-solar-orange"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className={`flex items-center gap-2 text-sm font-semibold ${scrolled ? "text-navy" : "text-white"}`}
            >
              <FaPhoneAlt /> {COMPANY.phone}
            </a>
            <button onClick={() => setQuoteOpen(true)} className="btn-primary !py-2.5 !px-5 text-sm">
              Get Free Quote
            </button>
          </div>

          <button
            className={`lg:hidden text-2xl ${scrolled ? "text-navy" : "text-white"}`}
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
            className="fixed inset-0 z-50 bg-navy-dark/95 backdrop-blur-md text-white p-6 lg:hidden"
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
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-xl font-display font-semibold"
                >
                  {link.label}
                </NavLink>
              ))}
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
