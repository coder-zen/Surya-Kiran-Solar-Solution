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

export const PROJECT_CATEGORIES = ["Residential", "Commercial", "Industrial", "Ground Mounted", "Government"];

export const MAHARASHTRA_DISTRICTS = ["Pune", "Solapur", "Satara", "Kolhapur", "Sangli", "Ahmednagar"];
