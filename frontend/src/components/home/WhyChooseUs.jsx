import { motion } from "framer-motion";
import { FaUserTie, FaCertificate, FaAward, FaHeadset, FaBolt, FaCoins } from "react-icons/fa";
import SectionHeading from "../common/SectionHeading";

const reasons = [
  { icon: FaUserTie, title: "In-House Engineering Team", desc: "Dedicated survey, design, fabrication and commissioning teams — no subcontracted guesswork." },
  { icon: FaCertificate, title: "MNRE & IEC Standards", desc: "Every installation uses MNRE & IEC-certified components and follows national safety codes." },
  { icon: FaAward, title: "25-Year Panel Warranty", desc: "Monocrystalline panels rated for minimum 90% output at 10 years, 84% at 25 years." },
  { icon: FaBolt, title: "Fast Installation", desc: "Installation & commissioning typically completed within 2–3 weeks of material delivery." },
  { icon: FaCoins, title: "Transparent Pricing", desc: "Clear, itemized quotes with no hidden costs before you commit." },
  { icon: FaHeadset, title: "MSEDCL Liaisoning Included", desc: "We handle net-metering, bill updates and system initialization paperwork for you." },
];

const WhyChooseUs = () => (
  <section className="py-24 bg-navy-gradient relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]" />
    <div className="container-custom relative">
      <SectionHeading
        eyebrow="Why Choose Us"
        title="Built On Trust, Backed By Results"
        subtitle="A track record that speaks for itself — across residential, commercial, industrial and government projects."
      />
      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reasons.map((reason, i) => (
          <motion.div
            key={reason.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-card !bg-white/10 !border-white/20 p-7"
          >
            <reason.icon className="text-solar-yellow text-3xl mb-4" />
            <h3 className="font-display font-semibold text-lg text-white">{reason.title}</h3>
            <p className="text-base sm:text-sm text-gray-300 mt-2 leading-relaxed">{reason.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
