import { motion } from "framer-motion";

/**
 * Reusable section heading — eyebrow + title + optional subtitle,
 * with a scroll-triggered fade/slide-up reveal.
 */
const SectionHeading = ({ eyebrow, title, subtitle, align = "center" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={align === "center" ? "text-center max-w-2xl mx-auto" : "text-left"}
  >
    {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
    <h2 className="section-heading">{title}</h2>
    {subtitle && <p className="subtitle-text">{subtitle}</p>}
  </motion.div>
);

export default SectionHeading;
