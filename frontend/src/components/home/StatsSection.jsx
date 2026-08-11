import { motion } from "framer-motion";
import { FaSolarPanel, FaBolt, FaSmile, FaCalendarAlt, FaMapMarkedAlt } from "react-icons/fa";
import CountUp from "../ui/CountUp";
import { MAHARASHTRA_DISTRICTS } from "../../config/constants";

const stats = [
  { icon: FaSolarPanel, value: 25, suffix: "", label: "Year Panel Warranty" },
  { icon: FaBolt, value: 98, suffix: "%", label: "Inverter Efficiency" },
  { icon: FaSmile, value: 70, suffix: "+", label: "Homes Solarized Pan-India" },
  { icon: FaCalendarAlt, value: 22, suffix: "+", label: "Year System Life" },
  // Counted from the district list rather than typed, so this can't fall out of
  // step with the service area again — it read 6 long after the map subtitle,
  // the district dropdowns and the search schema had all moved to the full 36.
  { icon: FaMapMarkedAlt, value: MAHARASHTRA_DISTRICTS.length, suffix: "", label: "Districts We Serve" },
];

const StatsSection = () => (
  <section className="py-20 bg-white border-y border-gray-100">
    <div className="container-custom grid grid-cols-2 md:grid-cols-5 gap-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="text-center"
        >
          <stat.icon className="mx-auto text-solar-orange text-3xl mb-3" />
          <p className="text-3xl lg:text-4xl font-display font-bold text-navy">
            <CountUp end={stat.value} />{stat.suffix}
          </p>
          <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default StatsSection;
