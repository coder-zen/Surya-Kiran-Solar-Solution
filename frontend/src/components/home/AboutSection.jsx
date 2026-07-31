import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Assets } from "../../config/images";
import SectionHeading from "../common/SectionHeading";

const points = [
  "MNRE & IEC-certified installation standards on every project",
  "In-house engineering, fabrication & commissioning teams",
  "Complete MSEDCL net-metering and subsidy paperwork, handled for you",
  "25-year panel performance warranty and up to 10-year inverter warranty",
];

const AboutSection = () => (
  <section className="py-24 bg-white overflow-hidden">
    <div className="container-custom grid lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="relative"
      >
        {/* TODO: Replace with real team/office photograph — see config/images.js -> aboutImage */}
        <img
          src={Assets.aboutImage}
          alt="SK Solar Solutions installation team"
          className="rounded-3xl shadow-premium w-full h-[420px] object-cover"
          onError={(e) => (e.target.style.background = "linear-gradient(135deg,#19376D,#0B2447)")}
        />
        <div className="absolute -bottom-8 -right-6 glass-card p-6 hidden sm:block">
          <p className="text-3xl font-display font-bold text-navy">70+</p>
          <p className="text-sm text-gray-500">Homes Solarized</p>
        </div>
      </motion.div>

      <div>
        <SectionHeading
          align="left"
          eyebrow="About SK Solar Solutions"
          title="Engineering A Cleaner, More Independent Future"
        />
        <p className="mt-6 text-gray-600 leading-relaxed">
          SK Solar Solutions (Surya Kiran Solar Solutions), led by Director Suraj Dhotre, plans and
          delivers rooftop and ground-mounted solar power plants end-to-end — site survey, system
          design, module &amp; BOS selection, erection, commissioning and MSEDCL liaisoning. Our
          residential solar solutions have helped solarize 70+ homes across India, using
          high-efficiency Monocrystalline panels backed by a 25-year performance warranty.
        </p>

        <ul className="mt-8 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <FaCheckCircle className="text-solar-orange mt-1 shrink-0" />
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>

        <Link to="/about" className="btn-navy inline-flex mt-9">
          More About Us
        </Link>
      </div>
    </div>
  </section>
);

export default AboutSection;
