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

// Approx district-center coordinates [lng, lat] — replace with exact site coordinates per project in the admin panel
const districtCoords = {
  Pune: [73.8567, 18.5204],
  Solapur: [75.9064, 17.6599],
  Satara: [74.0183, 17.6805],
  Kolhapur: [74.2433, 16.705],
  Sangli: [74.5815, 16.8524],
  Ahmednagar: [74.7480, 19.0952],
};

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

const projects = [
  { title: "Riverside Bungalow Rooftop Plant", category: "Residential", capacityKW: 5, district: "Pune", location: { coordinates: districtCoords.Pune }, isFeatured: true },
  { title: "Solapur Textile Mill Industrial Plant", category: "Industrial", capacityKW: 500, district: "Solapur", location: { coordinates: districtCoords.Solapur }, isFeatured: true },
  { title: "Satara School Campus Solar", category: "Government", capacityKW: 40, district: "Satara", location: { coordinates: districtCoords.Satara } },
  { title: "Kolhapur Sugar Factory Ground Mount", category: "Ground Mounted", capacityKW: 1000, district: "Kolhapur", location: { coordinates: districtCoords.Kolhapur }, isFeatured: true },
  { title: "Sangli Showroom Commercial Rooftop", category: "Commercial", capacityKW: 25, district: "Sangli", location: { coordinates: districtCoords.Sangli } },
  { title: "Ahmednagar Farmhouse Water Pump Plant", category: "Residential", capacityKW: 3, district: "Ahmednagar", location: { coordinates: districtCoords.Ahmednagar } },
];

const testimonials = [
  { customerName: "Rohit Deshmukh", location: "Pune", rating: 5, message: "Excellent installation quality and the team handled all MSEDCL paperwork for us. Highly recommended.", isVerified: true },
  { customerName: "Sanjay Patil", location: "Kolhapur", rating: 5, message: "Our factory's power bill dropped dramatically within the first month. Professional crew, clean work.", isVerified: true },
  { customerName: "Anita Kulkarni", location: "Satara", rating: 4, message: "Smooth process from site visit to commissioning. Would use them again for our next branch.", isVerified: true },
];

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

    const adminExists = await User.findOne({ email: "admin@suryakiransolar.com" });
    if (!adminExists) {
      await User.create({
        name: "Super Admin",
        email: "admin@suryakiransolar.com",
        password: "ChangeMe@123", // change immediately after first login
        role: "super_admin",
      });
      console.log("[Seed] Default admin created — admin@suryakiransolar.com / ChangeMe@123 (change this password!)");
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

if (process.argv.includes("--destroy")) {
  destroyData();
} else {
  importData();
}
