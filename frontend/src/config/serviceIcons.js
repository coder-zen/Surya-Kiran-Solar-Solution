import {
  FaHome, FaBuilding, FaIndustry, FaSolarPanel, FaCar, FaTools,
  FaClipboardCheck, FaBroom, FaChartLine, FaTint, FaShieldAlt,
  FaCheckDouble, FaBolt, FaFileContract, FaSun, FaPlug, FaBatteryFull, FaWrench,
} from "react-icons/fa";

/**
 * Icon keys an admin can pick from when creating/editing a Service.
 * The key string is what gets stored in Service.icon — never the component —
 * so the database stays free of frontend implementation details.
 */
export const SERVICE_ICONS = {
  home: FaHome,
  building: FaBuilding,
  industry: FaIndustry,
  "solar-panel": FaSolarPanel,
  car: FaCar,
  tools: FaTools,
  clipboard: FaClipboardCheck,
  broom: FaBroom,
  chart: FaChartLine,
  water: FaTint,
  shield: FaShieldAlt,
  "check-double": FaCheckDouble,
  bolt: FaBolt,
  contract: FaFileContract,
  sun: FaSun,
  plug: FaPlug,
  battery: FaBatteryFull,
  wrench: FaWrench,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICONS);

/**
 * The 14 originally-seeded services predate the icon picker and have an empty
 * `icon` field. Mapping them by slug keeps their original icons without needing
 * a data migration; anything created through the admin panel sets `icon` itself.
 */
const LEGACY_SLUG_ICONS = {
  "residential-solar": FaHome,
  "commercial-solar": FaBuilding,
  "industrial-solar": FaIndustry,
  "ground-mounted-solar": FaSolarPanel,
  "solar-car-parking": FaCar,
  "solar-fabrication": FaTools,
  "solar-amc": FaFileContract,
  "panel-cleaning": FaBroom,
  "remote-monitoring": FaChartLine,
  "solar-water-pump": FaTint,
  "solar-insurance": FaShieldAlt,
  "testing-commissioning": FaCheckDouble,
  "earthing-solutions": FaBolt,
  "msedcl-liaison-work": FaClipboardCheck,
  "msedcl-work": FaClipboardCheck,
};

/** Resolves a Service document to an icon component, with sensible fallbacks. */
export const getServiceIcon = (service) =>
  SERVICE_ICONS[service?.icon] || LEGACY_SLUG_ICONS[service?.slug] || FaSolarPanel;
