import { motion } from "framer-motion";
import { FaPhoneAlt } from "react-icons/fa";
import { COMPANY } from "../../config/constants";

/**
 * Floating "Call Now" button — sits above the WhatsApp button on mobile
 * where tap targets need extra spacing. Hidden on desktop (header CTA covers it).
 */
const CallButton = () => (
  <motion.a
    href={`tel:${COMPANY.phoneRaw}`}
    aria-label="Call us now"
    className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy-gradient text-white shadow-premium lg:hidden"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <FaPhoneAlt className="h-5 w-5" />
  </motion.a>
);

export default CallButton;
