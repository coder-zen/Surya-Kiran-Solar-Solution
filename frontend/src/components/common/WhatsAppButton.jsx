import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { COMPANY } from "../../config/constants";

/**
 * Sticky WhatsApp button — appears on every page (mounted once in Layout.jsx).
 * Deep-links straight into a WhatsApp chat with a pre-filled enquiry message.
 */
const WhatsAppButton = () => {
  const message = encodeURIComponent(
    `Hi ${COMPANY.name}, I'm interested in getting a free solar quote. Please share more details.`
  );
  const link = `https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, "")}?text=${message}`;

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-premium"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
      <FaWhatsapp className="relative z-10 h-7 w-7" />
    </motion.a>
  );
};

export default WhatsAppButton;
