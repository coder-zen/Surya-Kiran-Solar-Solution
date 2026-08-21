/**
 * Site-wide constants. Update phone/WhatsApp/address here once — every
 * component (sticky WhatsApp button, footer, contact page, header) imports
 * from this single file.
 */
export const COMPANY = {
  name: "SK Solar Solutions",
  legalName: "Surya Kiran Solar Solutions",
  tagline: "Solar Experts By Surya Kiran Solar Solutions",
  director: "Suraj Dhotre",
  phone: "+91 90678 56576",
  phoneRaw: "+919067856576",
  whatsapp: "+919067856576",
  email: "info@sksolarsolution.com",
  address: "Near Akshay Garden Hotel, Belekar Wasti, Manjari Budruk, Pune, Maharashtra 412307, India",
  officeCoordinates: { lat: 18.5124, lng: 73.9718 },
  /*
   * Defaults only. The live values come from Settings.socialLinks, editable at
   * /admin/homepage — these are the fallback while that loads, and for any
   * network the admin hasn't filled in.
   *
   * A bare domain here means "no profile yet": Footer and the search-engine
   * schema both treat a URL with no path as absent rather than linking
   * visitors to facebook.com's front page.
   */
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://www.instagram.com/sk_solar_solutions",
    linkedin: "https://linkedin.com/",
    youtube: "https://www.youtube.com/@sksolarsolution30",
    twitter: "https://x.com/",
  },
};

/**
 * True only for a URL that points at an actual profile.
 *
 * "https://facebook.com/" parses fine and would render a perfectly clickable
 * icon that dumps a visitor on Facebook's homepage, so a bare domain counts as
 * absent. Malformed strings are absent too — an admin typing "instagram.com/x"
 * without a scheme shouldn't crash the footer.
 */
const isRealProfile = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    return new URL(url).pathname.replace(/\/+$/, "").length > 0;
  } catch {
    return false;
  }
};

/**
 * Live social links: whatever the admin has saved, falling back to the defaults
 * above for anything unset. Networks without a real profile are dropped, so the
 * footer and the search-engine schema both show only what exists.
 *
 * Clearing a field in the admin removes its icon — an empty string overrides
 * the default and then fails the profile check.
 */
export const resolveSocialLinks = (settings) => {
  const merged = { ...COMPANY.social, ...(settings?.socialLinks || {}) };
  return Object.fromEntries(Object.entries(merged).filter(([, url]) => isRealProfile(url)));
};

/**
 * The government's own PM Surya Ghar portal.
 *
 * The subsidy nav item points here rather than at a page of our own. Scheme
 * rates, eligibility and the application process change by notification, and a
 * summary of them on our site is wrong the moment one does — quoting a stale
 * subsidy figure to a customer is worse than sending them to the source.
 */
export const PM_SURYA_GHAR_URL = "https://pmsuryaghar.gov.in/#/";

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "Projects", path: "/projects" },
  { label: "Gallery", path: "/gallery" },
  { label: "Products", path: "/products" },
  { label: "AMC Plans", path: "/amc-plans" },
  { label: "Govt. Subsidy", href: PM_SURYA_GHAR_URL, external: true },
  { label: "Blog", path: "/blog" },
  { label: "Career", path: "/career" },
  { label: "Contact", path: "/contact" },
];

/**
 * Grouped structure for the header navbar (dropdowns to shorten the bar).
 * "Home", "Blog", "Career" and "Contact" are intentionally left out here —
 * they remain reachable via the footer, which still renders the full
 * NAV_LINKS list above.
 */
export const NAVBAR_GROUPS = [
  {
    type: "dropdown",
    key: "about-services",
    label: "About/Services",
    items: [
      { label: "About Us", path: "/about" },
      { label: "Services", path: "/services" },
    ],
  },
  {
    type: "dropdown",
    key: "projects-gallery",
    label: "Projects/Gallery",
    items: [
      { label: "Projects", path: "/projects" },
      { label: "Gallery", path: "/gallery" },
    ],
  },
  { type: "link", label: "Pricing", path: "/pricing" },
  { type: "link", label: "AMC Plan", path: "/amc-plans" },
  { type: "link", label: "Govt. Subsidy", href: PM_SURYA_GHAR_URL, external: true },
];

export const PROJECT_CATEGORIES = ["Residential", "Commercial", "Industrial", "Ground Mounted", "Government"];

/**
 * All 36 districts of Maharashtra — the company serves the whole state.
 * Mirrors DISTRICT_COORDS in backend/config/districts.js, which holds the
 * matching map coordinates. Frontend and backend are separate packages with
 * no shared module, so these two lists must be kept in sync by hand.
 */
export const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Beed", "Bhandara", "Buldhana",
  "Chandrapur", "Chhatrapati Sambhajinagar", "Dharashiv", "Dhule",
  "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
  "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
  "Nandurbar", "Nashik", "Palghar", "Parbhani", "Pune", "Raigad",
  "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane",
  "Wardha", "Washim", "Yavatmal",
];
