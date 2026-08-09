/**
 * ==========================================================================
 * CENTRALIZED ASSET CONFIGURATION
 * ==========================================================================
 * Every image/logo/video used across the site is referenced from here —
 * NEVER hardcode an image path inside a component. This lets a future
 * developer swap every placeholder for the real Surya Kiran brand assets
 * by editing ONLY this file.
 *
 * IMPORTANT: These paths point into `frontend/public/assets/...` (NOT
 * `frontend/src/assets/...`). Vite copies everything in `public/` as-is to
 * both the dev server and the production build, so a path like
 * `/assets/logo/company-logo.svg` works identically in `npm run dev` and
 * after `npm run build` — no import statements needed anywhere else in the
 * app. Just drop your real file at the matching path below and refresh.
 *
 * Your ACTUAL FILES must physically live at:
 *   frontend/public/assets/logo/...
 *   frontend/public/assets/images/hero/...
 *   frontend/public/assets/images/about/...
 *   frontend/public/assets/images/projects/...
 *   frontend/public/assets/images/gallery/...
 *   frontend/public/assets/images/team/...
 *   frontend/public/assets/images/testimonials/...
 *   frontend/public/assets/images/brands/...
 *   frontend/public/assets/videos/...
 *   frontend/public/assets/illustrations/...
 * NOT under frontend/src/assets/... (that location silently breaks in the
 * production build, even though it works fine locally in `npm run dev`).
 * ==========================================================================
 */

export const Assets = {
  // ------------------------------------------------------------------------
  // LOGO
  // ------------------------------------------------------------------------
  companyLogo: "/assets/logo/company-logo.jpeg",
  companyLogoLight: "/assets/logo/company-logo-light.png", // white version for dark navy header/footer
  favicon: "/assets/logo/favicon.png", // 512x512 PNG

  // ------------------------------------------------------------------------
  // HERO SECTION
  // ------------------------------------------------------------------------
  heroVideo: "/assets/videos/hero-solar-plant.mp4",
  heroFallbackImage: "/assets/images/hero/hero-banner.JPG",

  // ------------------------------------------------------------------------
  // ABOUT SECTION
  // ------------------------------------------------------------------------
  aboutImage: "/assets/images/about/about-team.JPG",
  aboutSecondaryImage: "/assets/images/about/about-installation.png",

  // ------------------------------------------------------------------------
  // SERVICES (one icon-illustration per service card)
  // ------------------------------------------------------------------------
  serviceIllustrations: {
    residential: "/assets/illustrations/service-residential.JPG",
    commercial: "/assets/illustrations/service-commercial.JPG",
    industrial: "/assets/illustrations/service-industriall.JPG",
    groundMounted: "/assets/illustrations/service-ground-mounted.JPG",
  },

  // NOTE: there are deliberately no project placeholders here. Project cards
  // render only real photos uploaded through the admin panel — the database is
  // the single source of truth for the portfolio. A project with no photo of
  // its own falls back to the brand gradient, never to a stock image of a
  // different installation.

  // ------------------------------------------------------------------------
  // GALLERY
  // ------------------------------------------------------------------------
  galleryPlaceholders: [
    "/assets/images/gallery/gallery-1.JPG",
    "/assets/images/gallery/gallery-2.JPG",
    "/assets/images/gallery/gallery-3.JPG",
    "/assets/images/gallery/gallery-4.JPG",
    "/assets/images/gallery/gallery-5.JPG",
    "/assets/images/gallery/gallery-6.JPG",
  ],

  // ------------------------------------------------------------------------
  // TEAM
  // ------------------------------------------------------------------------
  teamPlaceholders: [
    "/assets/images/team/team-1.JPG",
    "/assets/images/team/team-2.JPG",
    "/assets/images/team/team-3.JPG",
  ],

  // ------------------------------------------------------------------------
  // TESTIMONIALS
  // ------------------------------------------------------------------------
  testimonialPlaceholder: "/assets/images/testimonials/customer-avatar-placeholder.jpg",

  // ------------------------------------------------------------------------
  // BRAND / PARTNER LOGOS (carousel)
  // ------------------------------------------------------------------------
  brandLogos: [
    { name: "Waaree", src: "/assets/images/brands/waaree.svg" },
    { name: "Adani Solar", src: "/assets/images/brands/adani.svg" },
    { name: "Havells", src: "/assets/images/brands/havells.svg" },
    { name: "Growatt", src: "/assets/images/brands/growatt.svg" },
    { name: "UTL Solar", src: "/assets/images/brands/utl.svg" },
    { name: "Australian Premium Solar", src: "/assets/images/brands/aps.svg" },
  ],

  // ------------------------------------------------------------------------
  // 404 PAGE ILLUSTRATION
  // ------------------------------------------------------------------------
  notFoundIllustration: "/assets/illustrations/404-illustration.svg",
};

export default Assets;