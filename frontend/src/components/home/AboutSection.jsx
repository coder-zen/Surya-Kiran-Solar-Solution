import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Assets } from "../../config/images";
import SectionHeading from "../common/SectionHeading";

const points = [
  "12+ years of solar EPC experience across Maharashtra",
  "MNRE-certified installation standards on every project",
  "In-house engineering, fabrication & commissioning teams",
  "End-to-end handling of subsidy and net-metering paperwork",
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
          alt="Surya Kiran Solar Solution team"
          className="rounded-3xl shadow-premium w-full h-[420px] object-cover"
          onError={(e) => (e.target.style.background = "linear-gradient(135deg,#19376D,#0B2447)")}
        />
        <div className="absolute -bottom-8 -right-6 glass-card p-6 hidden sm:block">
          <p className="text-3xl font-display font-bold text-navy">12+</p>
          <p className="text-sm text-gray-500">Years of Excellence</p>
        </div>
      </motion.div>

      <div>
        <SectionHeading
          align="left"
          eyebrow="About Surya Kiran Solar Solution"
          title="Engineering A Cleaner, More Independent Future"
        />
        <p className="mt-6 text-gray-600 leading-relaxed">
          What began as a small team of engineers passionate about renewable energy has grown into
          one of Maharashtra&apos;s most trusted solar EPC partners. We&apos;ve helped homeowners,
          factories, schools and government bodies cut their electricity costs dramatically —
          without ever compromising on installation quality or after-sales support.
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
