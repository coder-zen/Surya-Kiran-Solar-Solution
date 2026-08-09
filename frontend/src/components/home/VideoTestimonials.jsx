import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import api from "../../config/api";
import SectionHeading from "../common/SectionHeading";
import { youTubeId, youTubeThumbnail, youTubeEmbedUrl } from "../../utils/youtube";

const fetchTestimonials = async () => {
  const { data } = await api.get("/testimonials");
  return data.data;
};

/**
 * Video customer reviews. Reads the same Testimonial collection as the text
 * marquee below it — a testimonial is a *video* review purely by virtue of
 * having a videoUrl, so the admin adds one in the same place with no separate
 * model, endpoint or screen to maintain.
 *
 * The two sections partition the collection rather than overlapping: this one
 * takes the testimonials with a playable video, Testimonials.jsx takes the
 * rest. The same react-query key backs both, so the list is fetched once and
 * served from cache to the second component.
 *
 * Nothing renders until there is at least one real video — an empty section
 * on a marketing homepage is worse than no section, and there is deliberately
 * no sample content to fall back on.
 */
const VideoTestimonials = () => {
  const { data, isLoading } = useQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });
  const [playing, setPlaying] = useState(null);

  // Escape closes the player — a click outside works too, but the iframe
  // swallows clicks over its own area once it has focus.
  useEffect(() => {
    if (!playing) return undefined;
    const onKeyDown = (e) => e.key === "Escape" && setPlaying(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playing]);

  // Resolve the id once here so a malformed link drops the card rather than
  // rendering a thumbnail that opens a dead player.
  const videos = (data || [])
    .map((t) => ({ ...t, videoId: youTubeId(t.videoUrl) }))
    .filter((t) => t.videoId);

  if (isLoading || !videos.length) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Video Reviews"
          title="Hear It From Our Customers"
          subtitle="Real installations, in their own words."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <motion.button
              key={video._id}
              type="button"
              onClick={() => setPlaying(video)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              aria-label={`Play video review from ${video.customerName}`}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-premium aspect-video text-left"
            >
              <img
                src={youTubeThumbnail(video.videoId)}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/30 to-navy-dark/10" />

              <span className="absolute inset-0 grid place-items-center">
                <span className="h-16 w-16 rounded-full bg-white/95 grid place-items-center shadow-premium group-hover:scale-110 transition-transform duration-300">
                  {/* Nudged right to optically centre the triangle in the circle. */}
                  <FaPlay className="text-solar-orange text-xl translate-x-0.5" />
                </span>
              </span>

              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="font-display font-semibold text-lg">{video.customerName}</h3>
                {video.location && (
                  <p className="text-xs text-gray-300 mt-1 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-solar-yellow" /> {video.location}, Maharashtra
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {playing && (
          <motion.div
            className="fixed inset-0 z-[70] bg-navy-dark/95 flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPlaying(null)}
          >
            <button onClick={() => setPlaying(null)} aria-label="Close video" className="absolute top-6 right-6 text-white text-2xl">
              <FaTimes />
            </button>
            <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={youTubeEmbedUrl(playing.videoId)}
                title={`Video review from ${playing.customerName}`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full rounded-xl border-0"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VideoTestimonials;
