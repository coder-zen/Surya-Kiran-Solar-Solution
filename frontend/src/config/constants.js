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
  email: "sksolarsolutions.electrical@gmail.com",
  address: "Near Akshay Garden Hotel, Belekar Wasti, Manjari Budruk, Pune, Maharashtra 412307, India",
  officeCoordinates: { lat: 18.5124, lng: 73.9718 },
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
    youtube: "https://youtube.com/",
  },
};

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "Projects", path: "/projects" },
  { label: "Gallery", path: "/gallery" },
  { label: "Products", path: "/products" },
  { label: "AMC Plans", path: "/amc-plans" },
  { label: "Govt. Subsidy", path: "/government-subsidy" },
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
  { type: "link", label: "Govt. Subsidy", path: "/government-subsidy" },
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
