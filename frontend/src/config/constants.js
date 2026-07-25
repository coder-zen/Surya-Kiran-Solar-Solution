/**
 * Site-wide constants. Update phone/WhatsApp/address here once — every
 * component (sticky WhatsApp button, footer, contact page, header) imports
 * from this single file.
 */
export const COMPANY = {
  name: "Surya Kiran Solar Solution",
  tagline: "Powering India With Smart Solar Energy",
  phone: "+91 98765 43210", // TODO: replace with real number
  phoneRaw: "+919876543210",
  whatsapp: "+919876543210", // TODO: replace with real WhatsApp Business number
  email: "info@suryakiransolar.com", // TODO: replace with real email
  address: "Shivaji Nagar, Pune, Maharashtra, India", // TODO: replace with real office address
  officeCoordinates: { lat: 18.5204, lng: 73.8567 },
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
