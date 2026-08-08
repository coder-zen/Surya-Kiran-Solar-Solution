/**
 * ==========================================================================
 * CLOUDINARY DELIVERY TRANSFORMATIONS
 * ==========================================================================
 * Admins upload full-resolution originals — straight off a DSLR, 6-8MB each.
 * That is intentional: Cloudinary holds the archive copy. But the original
 * must never be what a visitor's browser downloads. A 30-photo gallery served
 * at full size is ~200MB per page view, which exhausts the account's monthly
 * bandwidth in a couple of hundred visits and takes minutes to load on 4G.
 *
 * Cloudinary generates a resized derivative on the fly for any transformation
 * segment inserted after `/upload/`, then caches it on their CDN. The stored
 * original is never modified, so switching a width here is free and
 * reversible — nothing is re-uploaded.
 *
 *   f_auto   WebP/AVIF when the browser supports it, original format otherwise
 *   q_auto   per-image quality tuning — typically 40-70% smaller, no visible loss
 *   w_<n>    cap the width
 *   c_limit  only ever shrinks; a photo narrower than <n> is left alone
 *
 * Anything that is not a Cloudinary URL — the /assets placeholders in
 * config/images.js, an externally hosted image — passes through untouched.
 * ==========================================================================
 */

const UPLOAD_SEGMENT = "/image/upload/";

/** Leading transformation segments look like `f_auto,q_auto` or `c_fill,g_face`. */
const ALREADY_TRANSFORMED = /^[a-z]{1,3}_[^/]*$/;

/**
 * Standard widths. Doubled against the CSS size they render at so the image
 * still looks sharp on a 2x phone screen — the dominant device for this site.
 */
export const IMG = {
  avatar: 200, // testimonial headshots
  thumb: 400, // map popups, small cards
  card: 800, // gallery grid tiles, project/blog cards
  hero: 1600, // full-width headers and the gallery lightbox
};

/**
 * @param {string} url    image URL, Cloudinary or otherwise
 * @param {number} width  max delivered width in px — use a value from IMG
 * @returns {string} the URL a visitor should actually download
 */
export const cdnImage = (url, width = IMG.card) => {
  if (typeof url !== "string" || !url.includes(UPLOAD_SEGMENT)) return url;

  const [base, path] = url.split(UPLOAD_SEGMENT);
  // A URL copied out of the Cloudinary console may already carry a
  // transformation; stacking a second one silently changes the crop.
  if (ALREADY_TRANSFORMED.test(path.split("/")[0])) return url;

  return `${base}${UPLOAD_SEGMENT}f_auto,q_auto,w_${width},c_limit/${path}`;
};

export default cdnImage;
