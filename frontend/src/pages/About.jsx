import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FaBullseye, FaEye, FaHistory } from "react-icons/fa";
import { Assets } from "../config/images";
import SectionHeading from "../components/common/SectionHeading";

const About = () => (
  <>
    <Helmet><title>About Us | Surya Kiran Solar Solution</title></Helmet>

    <section className="pt-32 pb-16 bg-navy-gradient text-white text-center">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-display font-bold">About Surya Kiran Solar Solution</h1>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto">
          12+ years of engineering trust, one installation at a time.
        </p>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="container-custom grid lg:grid-cols-2 gap-14 items-center">
        <img
          src={Assets.aboutSecondaryImage}
          alt="Our story"
          className="rounded-3xl shadow-premium h-96 w-full object-cover"
          onError={(e) => (e.target.style.background = "#0B2447")}
        />
        <div>
          <SectionHeading align="left" eyebrow="Our Story" title="Why We Started" />
          <p className="mt-6 text-gray-600 leading-relaxed">
            Surya Kiran Solar Solution was founded with a simple belief: clean energy should be
            accessible, reliable, and financially rewarding for every Indian household and
            business. What started as a two-person engineering team in Pune has grown into a
            full-scale EPC company trusted by hundreds of families, factories, and institutions
            across Maharashtra.
          </p>
        </div>
      </div>
    </section>

    <section className="py-20 bg-gray-50">
      <div className="container-custom grid md:grid-cols-3 gap-8">
        {[
          { icon: FaHistory, title: "Our Journey", desc: "From a two-person team to a 100+ project-a-year EPC company." },
          { icon: FaBullseye, title: "Our Mission", desc: "Make solar adoption effortless, transparent, and financially rewarding." },
          { icon: FaEye, title: "Our Vision", desc: "A Maharashtra where every rooftop contributes to a cleaner grid." },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-sm text-center"
          >
            <item.icon className="mx-auto text-solar-orange text-3xl mb-4" />
            <h3 className="font-display font-semibold text-xl text-navy">{item.title}</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </>
);

export default About;
