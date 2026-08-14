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
  heroEyebrow: "Maharashtra's Trusted On-Grid Rooftop Solar EPC Company",
  heroHeadline: "Powering Homes & Businesses With Smart Solar Energy",
  heroSubtext:
    "MNRE & IEC-certified on-grid solar rooftop systems for homes, businesses and institutions — complete design, supply, installation, testing, commissioning and MSEDCL net-metering coordination, handled end-to-end.",
};

const Hero = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  /** Gates the <source> element — nothing downloads until this is true. */
  const [videoEnabled, setVideoEnabled] = useState(false);
  const videoRef = useRef(null);
  const whatsappLink = `https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, "")}`;

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, retry: false });
  const content = { ...FALLBACK, ...(settings?.homepageContent || {}) };

  // Admin-set URLs win; the bundled assets remain the default so an empty
  // Settings document still renders the original hero rather than nothing.
  const videoSrc = content.heroVideoUrl || Assets.heroVideo;
  const posterSrc = content.heroFallbackImageUrl || Assets.heroFallbackImage;

  useEffect(() => {
    // Decide whether this visitor should download the hero video at all.
    //
    // It is decoration behind a dark gradient, and it is by far the heaviest
    // thing on the site. Sending it to a phone on mobile data costs the
    // visitor real money to see almost nothing. preload="none" alone does not
    // help: calling play() starts the download immediately regardless, so the
    // source element itself is withheld until this says otherwise.
    const connection = navigator.connection;
    const saveData = connection?.saveData === true;
    const slowLink = /(^|-)(2g|3g)$/.test(connection?.effectiveType || "");
    const smallScreen = window.matchMedia("(max-width: 767px)").matches;

    if (saveData || slowLink || smallScreen) {
      // Poster only. The play button below lets them opt in deliberately.
      setVideoPaused(true);
      return undefined;
    }

    // Capable connection: still wait for an idle moment so the video never
    // competes with the poster and headline for the first paint.
    const enable = () => setVideoEnabled(true);
    if (window.requestIdleCallback) {
      const handle = window.requestIdleCallback(enable, { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(enable, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Some mobile browsers (Data Saver mode, in-app webviews) silently block
    // autoplay even when muted+playsInline — fall back to a tappable play
    // button sized for the viewport instead of leaving a frozen poster.
    if (!videoEnabled) return;
    const playPromise = videoRef.current?.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => setVideoPaused(true));
    }
  }, [videoEnabled]);

  const handlePlayClick = () => {
    // First tap on a phone both attaches the source and starts playback.
    setVideoEnabled(true);
    setVideoPaused(false);
    videoRef.current?.play().catch(() => setVideoPaused(true));
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ================================================================
          TODO: Replace hero background video with real drone/site footage.
          Path: src/assets/videos/hero-solar-plant.mp4 (see config/images.js)
          Recommended: 1920x1080, H.264 mp4, muted/looping, under 8MB
      ================================================================= */}
      {/* No autoPlay attribute: playback is started from the effect above,
          only once the source has been attached. Leaving it on would make the
          browser fetch the video the moment the element mounts. */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={posterSrc}
        className="absolute inset-0 h-full w-full object-cover"
        onPlay={() => setVideoPaused(false)}
        onPause={() => setVideoPaused(true)}
        onError={(e) => (e.target.style.display = "none")}
      >
        {videoEnabled && <source src={videoSrc} type="video/mp4" />}
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/80 via-navy-dark/70 to-navy-dark/90" />

      {videoPaused && (
        /* Deliberately a small corner control rather than a full-bleed overlay.
           It used to span the entire hero, so on a phone — where the video is
           held back by default — any stray tap or imprecise scroll started a
           19.5MB download on mobile data. Tucked out of the way of the
           headline and the CTAs, it stays an opt-in. */
        <button
          onClick={handlePlayClick}
          aria-label="Play background video"
          className="absolute bottom-6 right-6 z-[5] flex h-12 w-12 items-center justify-center rounded-full bg-white/20 border border-white/40 text-white text-lg"
        >
          <FaPlay className="ml-0.5" />
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
          className="text-[28px] sm:text-5xl lg:text-6xl font-display font-bold text-white max-w-3xl leading-tight"
        >
          {content.heroHeadline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-gray-200 max-w-xl"
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
