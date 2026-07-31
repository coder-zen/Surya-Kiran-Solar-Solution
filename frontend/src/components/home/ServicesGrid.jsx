import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaHome, FaBuilding, FaIndustry, FaSolarPanel, FaCar, FaTools,
  FaClipboardCheck, FaBroom, FaChartLine, FaTint, FaShieldAlt,
  FaCheckDouble, FaBolt, FaFileContract,
} from "react-icons/fa";
import SectionHeading from "../common/SectionHeading";

const services = [
  { icon: FaHome, title: "Residential Solar", slug: "residential-solar", desc: "Rooftop systems that slash your home electricity bill." },
  { icon: FaBuilding, title: "Commercial Solar", slug: "commercial-solar", desc: "Reliable power for shops, offices & establishments." },
  { icon: FaIndustry, title: "Industrial Solar", slug: "industrial-solar", desc: "MW-scale installations for factories & plants." },
  { icon: FaSolarPanel, title: "Ground Mounted Solar", slug: "ground-mounted-solar", desc: "Utility-scale solar farms on open land." },
  { icon: FaCar, title: "Solar Car Parking", slug: "solar-car-parking", desc: "Shaded, power-generating parking canopies." },
  { icon: FaTools, title: "Solar Fabrication", slug: "solar-fabrication", desc: "Custom structural fabrication at any scale." },
  { icon: FaFileContract, title: "Solar AMC", slug: "solar-amc", desc: "Annual maintenance to protect your investment." },
  { icon: FaBroom, title: "Panel Cleaning", slug: "panel-cleaning", desc: "Scheduled cleaning for maximum energy yield." },
  { icon: FaChartLine, title: "Remote Monitoring", slug: "remote-monitoring", desc: "Live performance tracking from your phone." },
  { icon: FaTint, title: "Solar Water Pump", slug: "solar-water-pump", desc: "Off-grid pumping solutions for agriculture." },
  { icon: FaShieldAlt, title: "Solar Insurance", slug: "solar-insurance", desc: "Comprehensive cover for your solar assets." },
  { icon: FaCheckDouble, title: "Testing & Commissioning", slug: "testing-commissioning", desc: "Certified end-to-end system commissioning." },
  { icon: FaBolt, title: "Earthing Solutions", slug: "earthing-solutions", desc: "Certified earthing & lightning protection." },
  { icon: FaClipboardCheck, title: "MSEDCL Work", slug: "msedcl-work", desc: "Complete net-metering paperwork, handled for you." },
];

const ServicesGrid = () => (
  <section className="py-24 bg-gray-50">
    <div className="container-custom">
      <SectionHeading
        eyebrow="What We Offer"
        title="Complete Solar Solutions, Under One Roof"
        subtitle="From residential rooftops to industrial-scale plants — we design, install, and maintain it all."
      />

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service, i) => (
          <motion.div
            key={service.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            whileHover={{ y: -6 }}
            className="group rounded-2xl bg-white p-7 shadow-sm hover:shadow-premium border border-gray-100 transition-shadow"
          >
            <div className="h-14 w-14 rounded-xl bg-solar-gradient flex items-center justify-center text-navy-dark text-2xl mb-5 group-hover:scale-110 transition-transform">
              <service.icon />
            </div>
            <h3 className="font-display font-semibold text-lg text-navy">{service.title}</h3>
            <p className="text-base sm:text-sm text-gray-500 mt-2 leading-relaxed">{service.desc}</p>
            <Link to={`/services/${service.slug}`} className="inline-block mt-4 text-sm font-semibold text-solar-orange hover:underline">
              Learn More →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesGrid;
