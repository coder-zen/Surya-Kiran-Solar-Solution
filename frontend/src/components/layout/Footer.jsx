import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { COMPANY, NAV_LINKS } from "../../config/constants";

const Footer = () => (
  <footer className="bg-navy-dark text-white pt-16 pb-8">
    <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      <div>
        <h3 className="font-display font-bold text-xl mb-4">{COMPANY.name}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Trusted Solar EPC solutions for residential, commercial, industrial and government
          projects across Maharashtra — engineered for maximum savings and long-term reliability.
        </p>
        <div className="flex gap-3 mt-5">
          {[
            [FaFacebookF, COMPANY.social.facebook],
            [FaInstagram, COMPANY.social.instagram],
            [FaLinkedinIn, COMPANY.social.linkedin],
            [FaYoutube, COMPANY.social.youtube],
          ].map(([Icon, href], i) => (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-solar-orange transition-colors"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <Link to={link.path} className="hover:text-solar-yellow transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-display font-semibold mb-4">Contact Info</h4>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-3">
            <FaMapMarkerAlt className="mt-1 text-solar-yellow shrink-0" /> {COMPANY.address}
          </li>
          <li className="flex items-center gap-3">
            <FaPhoneAlt className="text-solar-yellow shrink-0" /> {COMPANY.phone}
          </li>
          <li className="flex items-center gap-3">
            <FaEnvelope className="text-solar-yellow shrink-0" /> {COMPANY.email}
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-display font-semibold mb-4">Newsletter</h4>
        <p className="text-sm text-gray-300 mb-3">Subscribe for solar tips, subsidy updates and offers.</p>
        <form
          onSubmit={(e) => e.preventDefault() /* TODO: wire to newsletter endpoint */}
          className="flex gap-2"
        >
          <input
            type="email"
            required
            placeholder="Your email"
            className="w-full rounded-lg px-3 py-2 text-sm text-ink"
          />
          <button className="bg-solar-gradient text-navy-dark font-semibold px-4 rounded-lg text-sm shrink-0">
            Join
          </button>
        </form>
      </div>
    </div>

    <div className="container-custom mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
      <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
      <div className="flex gap-6">
        <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
