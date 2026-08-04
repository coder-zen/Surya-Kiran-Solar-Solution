/**
 * Single source of truth for the production site URL. Update SITE_URL here
 * the moment a custom domain is connected (e.g. https://sksolarsolutions.com)
 * — every canonical tag, Open Graph URL, and the sitemap/robots.txt below
 * all key off this one value.
 *
 * NOTE: robots.txt and sitemap.xml live in frontend/public/ as static files
 * (a Vite SPA can't generate them per-request), so when SITE_URL changes,
 * also update the URLs inside those two files to match.
 */
export const SITE_URL = "https://www.sksolarsolution.com";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/logo/company-logo.jpeg`;

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
