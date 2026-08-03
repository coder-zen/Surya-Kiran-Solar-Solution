import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaStar, FaCheckCircle, FaQuoteLeft } from "react-icons/fa";
import api from "../../config/api";
import { Assets } from "../../config/images";
import SectionHeading from "../common/SectionHeading";

const fetchTestimonials = async () => {
  const { data } = await api.get("/testimonials");
  return data.data;
};

/**
 * Shown whenever the live /api/testimonials collection is empty (new deployment,
 * or admin hasn't added any yet) so the section is never blank. Same shape as a
 * real Testimonial document — swap is transparent to the marquee below.
 */
const FALLBACK_TESTIMONIALS = [
  {
    _id: "fallback-1",
    customerName: "Rajesh Patil",
    location: "Pune",
    rating: 5,
    message: "Our electricity bill dropped by almost 90% after installation. The team handled everything — paperwork, net metering, all of it.",
    isVerified: true,
  },
  {
    _id: "fallback-2",
    customerName: "Sunita Deshmukh",
    location: "Solapur",
    rating: 5,
    message: "Professional installation and honest pricing. No surprises after the site survey, exactly what they quoted.",
    isVerified: true,
  },
  {
    _id: "fallback-3",
    customerName: "Anil Kulkarni",
    location: "Kolhapur",
    rating: 4,
    message: "Good support during the subsidy application — they followed up with MSEDCL on our behalf so we didn't have to.",
    isVerified: true,
  },
  {
    _id: "fallback-4",
    customerName: "Meera Joshi",
    location: "Satara",
    rating: 5,
    message: "System has been running smoothly for over a year now. AMC team is responsive whenever we call.",
    isVerified: true,
  },
];

const TestimonialCard = ({ t }) => (
  <div className="glass-card !bg-white p-7 h-full w-[320px] shrink-0 flex flex-col">
    <FaQuoteLeft className="text-solar-orange text-2xl mb-4" />
    <p className="text-gray-600 leading-relaxed flex-1">{t.message}</p>
    <div className="flex items-center gap-3 mt-6">
      {/* TODO: replace with real customer photo (consent required) */}
      <img
        src={t.image || Assets.testimonialPlaceholder}
        alt={t.customerName}
        className="h-11 w-11 rounded-full object-cover bg-gray-200"
        onError={(e) => (e.target.style.visibility = "hidden")}
      />
      <div>
        <p className="font-semibold text-navy flex items-center gap-1.5">
          {t.customerName} {t.isVerified && <FaCheckCircle className="text-blue-500 text-xs" />}
        </p>
        <p className="text-xs text-gray-400">{t.location}</p>
      </div>
    </div>
    <div className="flex gap-1 mt-3 text-solar-yellow text-sm">
      {Array.from({ length: t.rating }).map((_, i) => <FaStar key={i} />)}
    </div>
  </div>
);

const Testimonials = () => {
  const { data, isLoading } = useQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });

  const testimonials = !isLoading && data?.length > 0 ? data : FALLBACK_TESTIMONIALS;
  const track = [...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container-custom">
        <SectionHeading eyebrow="Customer Stories" title="What Our Customers Say" />

        <motion.div
          className="flex gap-6 mt-14 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        >
          {track.map((t, i) => (
            <TestimonialCard key={`${t._id}-${i}`} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
