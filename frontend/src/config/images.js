/**
 * ==========================================================================
 * CENTRALIZED ASSET CONFIGURATION
 * ==========================================================================
 * Every image/logo/video used across the site is referenced from here —
 * NEVER hardcode an image path inside a component. This lets a future
 * developer swap every placeholder for the real Surya Kiran brand assets
 * by editing ONLY this file.
 *
 * All paths below currently point to royalty-free stock/placeholder images
 * (see comments on each key for exact replacement instructions). Once real
 * brand assets exist, drop them into the matching folder under
 * src/assets/images/... and update the path here — no component changes needed.
 * ==========================================================================
 */

export const Assets = {
  // ------------------------------------------------------------------------
  // LOGO
  // ------------------------------------------------------------------------
  // TODO: Replace with Surya Kiran Solar Solution official logo.
  // File location: src/assets/logo/company-logo.svg
  // Recommended format: SVG, transparent background, min 512px wide source
  companyLogo: "/src/assets/logo/company-logo.svg",
  companyLogoLight: "/src/assets/logo/company-logo-light.svg", // white version for dark navy header/footer
  favicon: "/src/assets/logo/favicon.png", // 512x512 PNG

  // ------------------------------------------------------------------------
  // HERO SECTION
  // ------------------------------------------------------------------------
  // TODO: Replace with real drone/site footage of a completed Surya Kiran plant.
  // Recommended: 1920x1080 (16:9), H.264 mp4, under 8MB, muted/looping
  heroVideo: "/src/assets/videos/hero-solar-plant.mp4",
  // TODO: Replace with a high-res photograph of a flagship installation (used as
  // the <video> poster / fallback for slow connections or reduced-motion users).
  // Recommended size: 1920x1080 JPG, optimized/compressed
  heroFallbackImage: "/src/assets/images/hero/hero-banner.jpg",

  // ------------------------------------------------------------------------
  // ABOUT SECTION
  // ------------------------------------------------------------------------
  // TODO: Replace with a real photo of the founder/team or office building.
  // Recommended: 1200x1400 portrait JPG
  aboutImage: "/src/assets/images/about/about-team.jpg",
  aboutSecondaryImage: "/src/assets/images/about/about-installation.jpg",

  // ------------------------------------------------------------------------
  // SERVICES (one icon-illustration per service card)
  // ------------------------------------------------------------------------
  // TODO: These currently use react-icons (see components/home/ServicesGrid.jsx).
  // Replace with custom brand-illustrated icons if desired — SVG, 64x64, single color.
  serviceIllustrations: {
    residential: "/src/assets/illustrations/service-residential.svg",
    commercial: "/src/assets/illustrations/service-commercial.svg",
    industrial: "/src/assets/illustrations/service-industrial.svg",
    groundMounted: "/src/assets/illustrations/service-ground-mounted.svg",
  },

  // ------------------------------------------------------------------------
  // PROJECTS — featured project cards & portfolio grid
  // ------------------------------------------------------------------------
  // TODO: Replace each with an actual completed-project photograph.
  // Recommended: 1200x900 JPG, consistent aspect ratio across all project cards
  projectPlaceholders: [
    "/src/assets/images/projects/project-residential-1.jpg",
    "/src/assets/images/projects/project-industrial-1.jpg",
    "/src/assets/images/projects/project-groundmount-1.jpg",
    "/src/assets/images/projects/project-commercial-1.jpg",
  ],

  // ------------------------------------------------------------------------
  // GALLERY
  // ------------------------------------------------------------------------
  // TODO: Replace with real installation/team/event photos as they become available.
  // Recommended: 1000x1000 JPG (square works best for masonry + lightbox)
  galleryPlaceholders: [
    "/src/assets/images/gallery/gallery-1.jpg",
    "/src/assets/images/gallery/gallery-2.jpg",
    "/src/assets/images/gallery/gallery-3.jpg",
    "/src/assets/images/gallery/gallery-4.jpg",
    "/src/assets/images/gallery/gallery-5.jpg",
    "/src/assets/images/gallery/gallery-6.jpg",
  ],

  // ------------------------------------------------------------------------
  // TEAM
  // ------------------------------------------------------------------------
  // TODO: Replace with real employee headshots.
  // Recommended: 600x600 JPG, consistent lighting/background across all staff
  teamPlaceholders: [
    "/src/assets/images/team/team-1.jpg",
    "/src/assets/images/team/team-2.jpg",
    "/src/assets/images/team/team-3.jpg",
  ],

  // ------------------------------------------------------------------------
  // TESTIMONIALS
  // ------------------------------------------------------------------------
  // TODO: Replace with real customer photos (only with their consent).
  // Recommended: 200x200 JPG, cropped to square/circle
  testimonialPlaceholder: "/src/assets/images/testimonials/customer-avatar-placeholder.jpg",

  // ------------------------------------------------------------------------
  // BRAND / PARTNER LOGOS (carousel)
  // ------------------------------------------------------------------------
  // TODO: Replace placeholder brand logos with official ones once permission/assets
  // are confirmed with each brand (Waaree, Adani, Luminous, Growatt, UTL, Australian
  // Premium Solar). Recommended: SVG or transparent PNG, consistent height ~60px
  brandLogos: [
    { name: "Waaree", src: "/src/assets/images/brands/waaree.svg" },
    { name: "Adani Solar", src: "/src/assets/images/brands/adani.svg" },
    { name: "Luminous", src: "/src/assets/images/brands/luminous.svg" },
    { name: "Growatt", src: "/src/assets/images/brands/growatt.svg" },
    { name: "UTL Solar", src: "/src/assets/images/brands/utl.svg" },
    { name: "Australian Premium Solar", src: "/src/assets/images/brands/aps.svg" },
  ],

  // ------------------------------------------------------------------------
  // 404 PAGE ILLUSTRATION
  // ------------------------------------------------------------------------
  // TODO: Replace with a branded illustration (e.g. a solar panel with a "lost" theme).
  notFoundIllustration: "/src/assets/illustrations/404-illustration.svg",
};

export default Assets;
