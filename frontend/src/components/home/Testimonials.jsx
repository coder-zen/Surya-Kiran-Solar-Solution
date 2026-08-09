import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaStar, FaCheckCircle, FaQuoteLeft } from "react-icons/fa";
import api from "../../config/api";
import { Assets } from "../../config/images";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import { youTubeId } from "../../utils/youtube";
import SectionHeading from "../common/SectionHeading";

const fetchTestimonials = async () => {
  const { data } = await api.get("/testimonials");
  return data.data;
};

/**
 * Below this many cards the marquee is replaced by a static row.
 *
 * The scroll animates the track from 0% to -50%, which only loops seamlessly
 * because the list is rendered twice — at -50% the second copy sits exactly
 * where the first began. That is invisible with a full row, but with a single
 * testimonial the admin saw their one review rendered as two cards. Four
 * cards duplicated is ~2750px, wider than any common viewport, so the seam
 * stays off-screen from here up.
 */
const MARQUEE_MIN = 4;

const TestimonialCard = ({ t }) => (
  <div className="glass-card !bg-white p-7 h-full w-[320px] shrink-0 flex flex-col">
    <FaQuoteLeft className="text-solar-orange text-2xl mb-4" />
    <p className="text-gray-600 leading-relaxed flex-1">{t.message}</p>
    <div className="flex items-center gap-3 mt-6">
      {/* TODO: replace with real customer photo (consent required) */}
      <img
        src={cdnImage(t.image || Assets.testimonialPlaceholder, IMG.avatar)}
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

  // Testimonials with a video are shown by VideoTestimonials instead, so the
  // same customer never appears in both sections.
  const testimonials = (data || []).filter((t) => !youTubeId(t.videoUrl));

  // No sample content: an empty collection hides the section rather than
  // showing invented reviews under invented customer names.
  if (isLoading || !testimonials.length) return null;

  const isMarquee = testimonials.length >= MARQUEE_MIN;
  const track = isMarquee ? [...testimonials, ...testimonials] : testimonials;

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container-custom">
        <SectionHeading eyebrow="Customer Stories" title="What Our Customers Say" />

        <motion.div
          className={isMarquee ? "flex gap-6 mt-14 w-max" : "flex flex-wrap gap-6 mt-14 justify-center"}
          animate={isMarquee ? { x: ["0%", "-50%"] } : undefined}
          transition={isMarquee ? { duration: 35, repeat: Infinity, ease: "linear" } : undefined}
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
