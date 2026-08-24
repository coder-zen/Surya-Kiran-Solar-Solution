import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaTimes,
  FaMapMarkerAlt,
  FaYoutube,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
} from "react-icons/fa";
import api from "../../config/api";
import { COMPANY } from "../../config/constants";
import SectionHeading from "../common/SectionHeading";
import { youTubeId, youTubeThumbnails, youTubeEmbedUrl } from "../../utils/youtube";

const fetchTestimonials = async () => {
  const { data } = await api.get("/testimonials");
  return data.data;
};

const fetchSettings = async () => {
  const { data } = await api.get("/settings");
  return data.data;
};

/** One page of the grid. Six keeps two full rows of three on desktop. */
const PER_PAGE = 6;

/**
 * A single clickable video card. `size` only changes the typography — the
 * thumbnail, gradient and play affordance stay identical between the featured
 * card and the grid so the section reads as one family.
 */
const VideoCard = ({ video, onPlay, size = "grid", badge }) => {
  // Start at the sharpest thumbnail and step down only if it 404s. maxres does
  // not exist for videos uploaded below 720p, and there is no way to know
  // which without asking for it.
  const sources = youTubeThumbnails(video.videoId, size);
  const [sourceIndex, setSourceIndex] = useState(0);

  return (
  <motion.button
    type="button"
    onClick={() => onPlay(video)}
    whileHover={{ y: -6 }}
    aria-label={`Play video: ${video.title}`}
    className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-premium aspect-video w-full text-left"
  >
    <img
      src={sources[sourceIndex]}
      alt=""
      loading="lazy"
      onError={() => setSourceIndex((i) => Math.min(i + 1, sources.length - 1))}
      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/25 to-navy-dark/10" />

    {badge && (
      <span className="absolute top-4 left-4 rounded-full bg-solar-yellow/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-dark">
        {badge}
      </span>
    )}

    <span className="absolute inset-0 grid place-items-center">
      <span
        className={`${size === "featured" ? "h-20 w-20" : "h-14 w-14"} rounded-full bg-white/95 grid place-items-center shadow-premium group-hover:scale-110 transition-transform duration-300`}
      >
        {/* Nudged right to optically centre the triangle inside the circle. */}
        <FaPlay className={`text-solar-orange ${size === "featured" ? "text-2xl" : "text-lg"} translate-x-0.5`} />
      </span>
    </span>

    <div className={`absolute bottom-0 text-white ${size === "featured" ? "p-6" : "p-4"}`}>
      <h3 className={`font-display font-semibold ${size === "featured" ? "text-xl lg:text-2xl" : "text-base"}`}>
        {video.title}
      </h3>
      {video.subtitle && (
        <p className={`text-gray-300 mt-1 flex items-center gap-1.5 ${size === "featured" ? "text-sm" : "text-xs"}`}>
          {video.location && <FaMapMarkerAlt className="text-solar-yellow shrink-0" />}
          {video.subtitle}
        </p>
      )}
    </div>
  </motion.button>
  );
};

/**
 * Video Reviews — a large featured film about the company, then a paginated
 * grid of customer video reviews, then a link to the channel.
 *
 * The two halves come from different places on purpose. The featured video is
 * about SK Solar itself and lives on the Settings singleton (admin edits it
 * under Homepage Content). The grid is Testimonial documents that carry a
 * videoUrl, so adding a customer review is the same flow as adding a written
 * one. Testimonials.jsx renders the ones without a video, so no customer ever
 * appears in both sections.
 *
 * Nothing renders until there is real content — an empty section on a
 * marketing homepage is worse than no section, and there is deliberately no
 * sample video to fall back on.
 */
const VideoTestimonials = () => {
  const { data: testimonials, isLoading } = useQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, retry: false });

  const [playing, setPlaying] = useState(null);
  const [page, setPage] = useState(0);

  // Escape closes the player — clicking outside works too, but the iframe
  // swallows clicks over its own area once it has focus.
  useEffect(() => {
    if (!playing) return undefined;
    const onKeyDown = (e) => e.key === "Escape" && setPlaying(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playing]);

  const content = settings?.homepageContent || {};

  // Resolve ids up front so a malformed link drops the card rather than
  // rendering a thumbnail that opens a dead player.
  const featuredId = youTubeId(content.featuredVideoUrl);
  const featured = featuredId && {
    videoId: featuredId,
    title: content.featuredVideoTitle || COMPANY.name,
    subtitle: content.featuredVideoSubtitle,
  };

  const reviews = (testimonials || [])
    .map((t) => ({
      _id: t._id,
      videoId: youTubeId(t.videoUrl),
      title: t.customerName,
      subtitle: t.location ? `${t.location}, Maharashtra` : null,
      location: t.location,
    }))
    .filter((t) => t.videoId);

  const pageCount = Math.ceil(reviews.length / PER_PAGE);
  // Guard against the page index stranding past the end when reviews are
  // deleted in the admin while someone is on the last page.
  const safePage = Math.min(page, Math.max(pageCount - 1, 0));
  const visible = reviews.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  const channelUrl = content.youtubeChannelUrl || settings?.socialLinks?.youtube || COMPANY.social.youtube;

  if (isLoading || (!featured && !reviews.length)) return null;

  return (
    <section className="py-24 bg-white dark:bg-navy">
      <div className="container-custom">
        <SectionHeading
          eyebrow={content.videoSectionEyebrow || "Video Reviews"}
          title={content.videoSectionHeadline || "Hear It From Our Customers"}
          subtitle={content.videoSectionSubtext || "Real installations, in their own words."}
        />

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mt-14 max-w-4xl mx-auto"
          >
            <VideoCard video={featured} onPlay={setPlaying} size="featured" badge="Featured Story" />
          </motion.div>
        )}

        {reviews.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-16 mb-8">
              <h3 className="font-display font-semibold text-xl lg:text-2xl text-navy dark:text-white">More Customer Stories</h3>

              {pageCount > 1 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 tabular-nums">
                    {safePage + 1} / {pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={safePage === 0}
                    aria-label="Previous page of video reviews"
                    className="h-9 w-9 grid place-items-center rounded-full border border-gray-200 dark:border-white/15 text-navy dark:text-white hover:bg-gray-50 dark:bg-navy-dark disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
                    disabled={safePage >= pageCount - 1}
                    aria-label="Next page of video reviews"
                    className="h-9 w-9 grid place-items-center rounded-full border border-gray-200 dark:border-white/15 text-navy dark:text-white hover:bg-gray-50 dark:bg-navy-dark disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((video, i) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                >
                  <VideoCard video={video} onPlay={setPlaying} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {channelUrl && (
          <div className="text-center mt-14">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 dark:border-white/15 bg-white dark:bg-navy px-6 py-3.5 text-sm font-semibold text-navy dark:text-white shadow-sm hover:shadow-premium transition-shadow"
            >
              <FaYoutube className="text-red-600 text-lg" />
              Watch All Reviews on YouTube
              <FaExternalLinkAlt className="text-gray-400 text-xs" />
            </a>
          </div>
        )}
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
                title={`Video: ${playing.title}`}
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
