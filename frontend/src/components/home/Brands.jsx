import { motion } from "framer-motion";
import { Assets } from "../../config/images";

const Brands = () => (
  <section className="py-14 bg-white dark:bg-navy border-y border-gray-100 dark:border-white/10 overflow-hidden">
    <div className="container-custom">
      <p className="text-center text-sm uppercase tracking-widest text-gray-400 mb-8">
        Trusted Component Brands We Work With
      </p>
      <motion.div
        className="flex gap-16 items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Assets.brandLogos, ...Assets.brandLogos].map((brand, i) => (
          <img
            key={i}
            src={brand.src}
            alt={brand.name}
            className="h-9 opacity-60 hover:opacity-100 transition-opacity shrink-0"
            onError={(e) => {
              e.target.outerHTML = `<span class="text-gray-400 font-display font-semibold shrink-0">${brand.name}</span>`;
            }}
          />
        ))}
      </motion.div>
    </div>
  </section>
);

export default Brands;
