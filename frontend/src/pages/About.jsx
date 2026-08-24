import SeoHead from "../components/common/SeoHead";
import { motion } from "framer-motion";
import { FaBullseye, FaEye, FaHistory } from "react-icons/fa";
import { Assets } from "../config/images";
import SectionHeading from "../components/common/SectionHeading";

const About = () => (
  <>
    <SeoHead title="About Us" path="/about" description="SK Solar Solutions (Surya Kiran Solar Solutions) is a Pune-based on-grid rooftop solar EPC company led by Director Suraj Dhotre, with 70+ homes solarized across India." />

    <section className="pt-32 pb-16 bg-navy-gradient text-white text-center">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-display font-bold">About SK Solar Solutions</h1>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto">
          MNRE &amp; IEC-certified rooftop solar, engineered and commissioned one home at a time.
        </p>
      </div>
    </section>

    <section className="py-20 bg-white dark:bg-navy">
      <div className="container-custom grid lg:grid-cols-2 gap-14 items-center">
        <img
          src={Assets.aboutSecondaryImage}
          alt="Our story"
          className="rounded-3xl shadow-premium h-96 w-full object-cover"
          onError={(e) => (e.target.style.background = "#0B2447")}
        />
        <div>
          <SectionHeading align="left" eyebrow="Our Story" title="Why We Started" />
          <p className="mt-6 text-gray-600 dark:text-gray-300 leading-relaxed">
            SK Solar Solutions (Surya Kiran Solar Solutions), led by Director Suraj Dhotre, was
            founded with a simple belief: clean energy should be accessible, reliable, and
            financially rewarding for every Indian household and business. We plan and deliver
            rooftop and ground-mounted solar power plants end-to-end — site survey, system
            design, module &amp; BOS selection, erection, commissioning and MSEDCL liaisoning —
            backed by a dynamic team of solar experts and designers who have helped solarize 70+
            homes across India.
          </p>
        </div>
      </div>
    </section>

    <section className="py-20 bg-gray-50 dark:bg-navy-dark">
      <div className="container-custom grid md:grid-cols-3 gap-8">
        {[
          { icon: FaHistory, title: "Our Journey", desc: "70+ residential homes solarized across India, with rooftop and ground-mounted plants for businesses and institutions." },
          { icon: FaBullseye, title: "Our Mission", desc: "Make solar adoption effortless, transparent, and financially rewarding." },
          { icon: FaEye, title: "Our Vision", desc: "A Maharashtra where every rooftop contributes to a cleaner grid." },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-navy rounded-2xl p-8 shadow-sm text-center"
          >
            <item.icon className="mx-auto text-solar-orange text-3xl mb-4" />
            <h3 className="font-display font-semibold text-xl text-navy dark:text-white">{item.title}</h3>
            <p className="text-gray-500 dark:text-gray-300 mt-2 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </>
);

export default About;
