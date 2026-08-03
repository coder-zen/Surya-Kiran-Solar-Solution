/**
 * Seed script — populates MongoDB with realistic sample data so the site
 * is demo-ready immediately after `npm install && npm run seed`.
 *
 * Usage:
 *   node seed/seed.js            → inserts sample data
 *   node seed/seed.js --destroy  → wipes the seeded collections
 */
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

dotenv.config();

const User = require("../models/User");
const Project = require("../models/Project");
const Service = require("../models/Service");
const Testimonial = require("../models/Testimonial");
const FAQ = require("../models/FAQ");

// Single source of truth for all 36 Maharashtra districts — replace with exact
// site coordinates per project in the admin panel.
const { DISTRICT_COORDS: districtCoords } = require("../config/districts");

const services = [
  { title: "Residential Solar", shortDescription: "Rooftop solar systems for homes — cut your electricity bill by up to 90%.", order: 1 },
  { title: "Commercial Solar", shortDescription: "Reliable solar power for shops, offices, and commercial establishments.", order: 2 },
  { title: "Industrial Solar", shortDescription: "Large-scale MW installations engineered for factories and industrial plants.", order: 3 },
  { title: "Ground Mounted Solar", shortDescription: "Utility-scale ground-mount solar farms for open land and agricultural sites.", order: 4 },
  { title: "Solar Car Parking", shortDescription: "Shaded car parks that double as power-generating solar canopies.", order: 5 },
  { title: "Solar Fabrication", shortDescription: "Custom structural fabrication for mounting systems of any scale.", order: 6 },
  { title: "Solar AMC", shortDescription: "Annual maintenance contracts to keep your system running at peak output.", order: 7 },
  { title: "Panel Cleaning", shortDescription: "Scheduled professional cleaning to maximize energy yield year-round.", order: 8 },
  { title: "Remote Monitoring", shortDescription: "Real-time performance monitoring accessible from your phone or desktop.", order: 9 },
  { title: "Solar Water Pump", shortDescription: "Off-grid solar-powered pumping solutions for agriculture.", order: 10 },
  { title: "Solar Insurance", shortDescription: "Comprehensive insurance coverage for your solar investment.", order: 11 },
  { title: "Testing & Commissioning", shortDescription: "End-to-end testing and commissioning to national safety standards.", order: 12 },
  { title: "Earthing Solutions", shortDescription: "Certified earthing and lightning protection for solar installations.", order: 13 },
  { title: "MSEDCL Liaison Work", shortDescription: "Complete handling of net-metering and MSEDCL paperwork on your behalf.", order: 14 },
];

// SK Solar Solutions' real service area is concentrated in Pune, with
// additional coverage in Solapur and Kolhapur. Only the first entry below is
// a specific completed project (from a current quotation, see customerName
// note); the rest are undated service-area markers for the homepage map —
// no fabricated customer names/addresses are attached to them.
// customerName is stored for internal records only — the Project model notes
// it should be shown publicly on the site only with the customer's consent,
// and FeaturedProjects.jsx does not render this field.
const projects = [
  {
    title: "15kW On-Grid Rooftop Solar Installation",
    customerName: "Sachin Shinde",
    category: "Residential",
    capacityKW: 15,
    district: "Pune",
    address: "Loni Kalbhor, Pune, Maharashtra 412201",
    location: { coordinates: districtCoords.Pune },
    technologiesUsed: ["Monocrystalline TOPCon Panels", "On-Grid String Inverter", "Net Metering", "Apollo GI Elevated Structure"],
    description: "On-grid rooftop solar power plant with complete design, supply, installation, testing, commissioning and MSEDCL net-metering coordination.",
    isFeatured: true,
  },
  {
    title: "Residential Rooftop Solar Installation",
    category: "Residential",
    capacityKW: 5,
    district: "Pune",
    location: { coordinates: [districtCoords.Pune[0] + 0.08, districtCoords.Pune[1] + 0.05] },
    technologiesUsed: ["Monocrystalline Panels", "On-Grid Inverter", "Net Metering"],
    description: "On-grid rooftop solar installation for a residential customer in the Pune service area.",
  },
  {
    title: "Commercial Rooftop Solar Installation",
    category: "Commercial",
    capacityKW: 20,
    district: "Pune",
    location: { coordinates: [districtCoords.Pune[0] - 0.1, districtCoords.Pune[1] - 0.04] },
    technologiesUsed: ["Monocrystalline Panels", "On-Grid Inverter", "Net Metering"],
    description: "On-grid rooftop solar installation for a commercial establishment in the Pune service area.",
  },
  {
    title: "Residential Rooftop Solar Installation",
    category: "Residential",
    capacityKW: 4,
    district: "Solapur",
    location: { coordinates: districtCoords.Solapur },
    technologiesUsed: ["Monocrystalline Panels", "On-Grid Inverter", "Net Metering"],
    description: "On-grid rooftop solar installation for a residential customer in the Solapur service area.",
  },
  {
    title: "Residential Rooftop Solar Installation",
    category: "Residential",
    capacityKW: 6,
    district: "Kolhapur",
    location: { coordinates: districtCoords.Kolhapur },
    technologiesUsed: ["Monocrystalline Panels", "On-Grid Inverter", "Net Metering"],
    description: "On-grid rooftop solar installation for a residential customer in the Kolhapur service area.",
  },
];

// No real customer testimonials are available yet — left empty so the
// Testimonials section stays hidden until genuine reviews are added via
// the admin panel (see components/home/Testimonials.jsx: it only renders
// when the API returns at least one testimonial).
const testimonials = [];

const faqs = [
  { question: "How much subsidy is available for residential solar in Maharashtra?", answer: "Central government subsidy under the PM Surya Ghar scheme is available for residential rooftop systems up to 3kW, with tiered support up to 10kW. Exact amounts are updated regularly on our Government Subsidy page.", category: "Subsidy", order: 1 },
  { question: "How long does installation typically take?", answer: "A standard residential rooftop system is typically installed within 3-7 days after all approvals are in place, depending on system size and roof complexity.", category: "Installation", order: 2 },
  { question: "What does the AMC plan cover?", answer: "Our AMC plans cover periodic panel cleaning, performance monitoring, inverter health checks, and priority breakdown support. See the AMC Plans page for a full comparison.", category: "AMC", order: 3 },
];

const importData = async () => {
  try {
    await connectDB();

    await Promise.all([
      Service.deleteMany(),
      Project.deleteMany(),
      Testimonial.deleteMany(),
      FAQ.deleteMany(),
    ]);

    await Service.insertMany(services);
    await Project.insertMany(projects);
    await Testimonial.insertMany(testimonials);
    await FAQ.insertMany(faqs);

    const adminExists = await User.findOne({ email: "admin@sksolarsolutions.com" });
    if (!adminExists) {
      await User.create({
        name: "Super Admin",
        email: "admin@sksolarsolutions.com",
        password: "ChangeMe@123", // change immediately after first login
        role: "super_admin",
      });
      console.log("[Seed] Default admin created — admin@sksolarsolutions.com / ChangeMe@123 (change this password!)");
    }

    console.log("[Seed] Sample data imported successfully.");
    process.exit();
  } catch (error) {
    console.error(`[Seed] Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Promise.all([
      Service.deleteMany(),
      Project.deleteMany(),
      Testimonial.deleteMany(),
      FAQ.deleteMany(),
      User.deleteMany(),
    ]);
    console.log("[Seed] All seeded data destroyed.");
    process.exit();
  } catch (error) {
    console.error(`[Seed] Error: ${error.message}`);
    process.exit(1);
  }
};

// Only run when invoked directly (`npm run seed`), never on require().
// importData() deletes and replaces the Service/Project/Testimonial/FAQ
// collections, so merely importing this file must not be able to trigger it.
if (require.main === module) {
  if (process.argv.includes("--destroy")) {
    destroyData();
  } else {
    importData();
  }
} else {
  module.exports = { importData, destroyData };
}
