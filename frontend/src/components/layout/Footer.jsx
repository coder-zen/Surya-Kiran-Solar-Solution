import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
// X's mark only exists in the Font Awesome 6 set; the rest stay on fa5, where
// this file's other icons (FaMapMarkerAlt, FaPhoneAlt) are still named.
import { FaXTwitter } from "react-icons/fa6";
import api from "../../config/api";
import { COMPANY, NAV_LINKS, resolveSocialLinks } from "../../config/constants";

const fetchSettings = async () => (await api.get("/settings")).data.data;

/** Icon and accessible name per network, keyed to Settings.socialLinks. */
const SOCIAL_META = {
  facebook: { Icon: FaFacebookF, label: "Facebook" },
  instagram: { Icon: FaInstagram, label: "Instagram" },
  linkedin: { Icon: FaLinkedinIn, label: "LinkedIn" },
  youtube: { Icon: FaYoutube, label: "YouTube" },
  twitter: { Icon: FaXTwitter, label: "X" },
};

const Footer = () => {
  // Shares the "settings" cache with Hero and AboutSection, so appearing on
  // every page costs no extra request.
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, retry: false });
  const socials = resolveSocialLinks(settings);

  return (
  <footer className="bg-navy-dark text-white pt-16 pb-8">
    <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      <div>
        <h3 className="font-display font-bold text-xl mb-4">{COMPANY.name}</h3>
        <p className="text-gray-300 text-base sm:text-sm leading-relaxed">
          MNRE &amp; IEC-certified on-grid rooftop solar solutions for homes, businesses and
          institutions across all districts of Maharashtra — engineered for maximum savings and
          long-term reliability.
        </p>
        <div className="flex gap-3 mt-5">
          {/* Only networks with a real profile — an icon linking to a bare
              domain sends visitors to that site's homepage, not to us. */}
          {Object.entries(socials).map(([network, href]) => {
            const meta = SOCIAL_META[network];
            if (!meta) return null;
            const { Icon, label } = meta;
            return (
              <a
                key={network}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${COMPANY.name} on ${label}`}
                title={label}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-solar-orange transition-colors"
              >
                <Icon size={14} />
              </a>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-display font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-2 text-base sm:text-sm text-gray-300">
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
        <ul className="space-y-3 text-base sm:text-sm text-gray-300">
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
        <p className="text-base sm:text-sm text-gray-300 mb-3">Subscribe for solar tips, subsidy updates and offers.</p>
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

    <div className="container-custom mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm sm:text-xs text-gray-400">
      <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
      <div className="flex gap-6">
        <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
