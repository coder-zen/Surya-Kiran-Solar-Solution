import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaWhatsapp, FaPlay } from "react-icons/fa";
import CountUp from "../ui/CountUp";
import api from "../../config/api";
import { Assets } from "../../config/images";
import { COMPANY } from "../../config/constants";
import EnquiryModal from "../common/EnquiryModal";

const stats = [
  { label: "Year Panel Warranty", value: 25, suffix: "" },
  { label: "Inverter Efficiency", value: 98, suffix: "%" },
  { label: "Homes Solarized Pan-India", value: 70, suffix: "+" },
  { label: "Year System Life", value: 22, suffix: "+" },
];

const fetchSettings = async () => (await api.get("/settings")).data.data;

/**
 * Used while /api/settings is loading or if it's unreachable, so the hero is
 * never blank on first paint. Editable at /admin/homepage once loaded.
 */
const FALLBACK = {
  heroVideoUrl: "",
  heroFallbackImageUrl: "",
  heroEyebrow: "Pune's Trusted On-Grid Rooftop Solar EPC Partner",
  heroHeadline: "Powering Homes & Businesses With Smart Solar Energy",
  heroSubtext:
    "MNRE & IEC-certified on-grid solar rooftop systems for homes, businesses and institutions — complete design, supply, installation, testing, commissioning and MSEDCL net-metering coordination, handled end-to-end.",
};

const Hero = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const videoRef = useRef(null);
  const whatsappLink = `https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, "")}`;

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, retry: false });
  const content = { ...FALLBACK, ...(settings?.homepageContent || {}) };

  // Admin-set URLs win; the bundled assets remain the default so an empty
  // Settings document still renders the original hero rather than nothing.
  const videoSrc = content.heroVideoUrl || Assets.heroVideo;
  const posterSrc = content.heroFallbackImageUrl || Assets.heroFallbackImage;

  useEffect(() => {
    // Some mobile browsers (Data Saver mode, in-app webviews) silently block
    // autoplay even when muted+playsInline — fall back to a tappable play
    // button sized for the viewport instead of leaving a frozen poster.
    const video = videoRef.current;
    if (!video) return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => setVideoPaused(true));
    }
  }, []);

  const handlePlayClick = () => {
    videoRef.current?.play();
    setVideoPaused(false);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ================================================================
          TODO: Replace hero background video with real drone/site footage.
          Path: src/assets/videos/hero-solar-plant.mp4 (see config/images.js)
          Recommended: 1920x1080, H.264 mp4, muted/looping, under 8MB
      ================================================================= */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        className="absolute inset-0 h-full w-full object-cover"
        onPlay={() => setVideoPaused(false)}
        onPause={() => setVideoPaused(true)}
        onError={(e) => (e.target.style.display = "none")}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/80 via-navy-dark/70 to-navy-dark/90" />

      {videoPaused && (
        <button
          onClick={handlePlayClick}
          aria-label="Play background video"
          className="absolute inset-0 z-[5] flex items-center justify-center"
        >
          <span className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-lg sm:text-xl">
            <FaPlay className="ml-0.5" />
          </span>
        </button>
      )}

      <div className="container-custom relative z-10 pt-28 pb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-eyebrow !text-solar-yellow"
        >
          {content.heroEyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white max-w-3xl leading-tight"
        >
          {content.heroHeadline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg text-gray-200 max-w-xl"
        >
          {content.heroSubtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <button onClick={() => setQuoteOpen(true)} className="btn-primary">
            Get Free Quote
          </button>
          <a href={`tel:${COMPANY.phoneRaw}`} className="btn-outline">
            <FaPhoneAlt /> Call Now
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-outline !border-[#25D366] !text-[#25D366] hover:!bg-[#25D366] hover:!text-white">
            <FaWhatsapp /> WhatsApp
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card !bg-white/10 !border-white/20 p-5 text-center">
              <p className="text-3xl font-display font-bold text-solar-yellow">
                <CountUp end={stat.value} />
                {stat.suffix}
              </p>
              <p className="text-sm sm:text-xs text-gray-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <EnquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} source="hero_cta" />
    </section>
  );
};

export default Hero;
