import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../config/api";
import SectionHeading from "../common/SectionHeading";
import { getServiceIcon } from "../../config/serviceIcons";

const fetchServices = async () => (await api.get("/services")).data.data;

/**
 * Fallback used only while the API is loading or unreachable, so the homepage
 * never renders an empty services section. Once /api/services responds, the
 * database is the source of truth — services are managed at /admin/services.
 */
const FALLBACK_SERVICES = [
  { _id: "f1", slug: "residential-solar", title: "Residential Solar", shortDescription: "Rooftop systems that slash your home electricity bill." },
  { _id: "f2", slug: "commercial-solar", title: "Commercial Solar", shortDescription: "Reliable power for shops, offices & establishments." },
  { _id: "f3", slug: "industrial-solar", title: "Industrial Solar", shortDescription: "MW-scale installations for factories & plants." },
  { _id: "f4", slug: "ground-mounted-solar", title: "Ground Mounted Solar", shortDescription: "Utility-scale solar farms on open land." },
];

const ServicesGrid = () => {
  const { data, isLoading } = useQuery({ queryKey: ["services"], queryFn: fetchServices });

  const services = !isLoading && data?.length > 0 ? data : FALLBACK_SERVICES;

  return (
    <section className="py-24 bg-gray-50 dark:bg-navy-dark">
      <div className="container-custom">
        <SectionHeading
          eyebrow="What We Offer"
          title="Complete Solar Solutions, Under One Roof"
          subtitle="From residential rooftops to industrial-scale plants — we design, install, and maintain it all."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = getServiceIcon(service);
            return (
              <motion.div
                key={service._id || service.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                whileHover={{ y: -6 }}
                className="group rounded-2xl bg-white dark:bg-navy p-7 shadow-sm hover:shadow-premium border border-gray-100 dark:border-white/10 transition-shadow"
              >
                <div className="h-14 w-14 rounded-xl bg-solar-gradient flex items-center justify-center text-navy-dark text-2xl mb-5 group-hover:scale-110 transition-transform">
                  <Icon />
                </div>
                <h3 className="font-display font-semibold text-lg text-navy dark:text-white">{service.title}</h3>
                <p className="text-base sm:text-sm text-gray-500 dark:text-gray-300 mt-2 leading-relaxed">{service.shortDescription}</p>
                <Link to={`/services/${service.slug}`} className="inline-block mt-4 text-sm font-semibold text-solar-orange hover:underline">
                  Learn More →
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
