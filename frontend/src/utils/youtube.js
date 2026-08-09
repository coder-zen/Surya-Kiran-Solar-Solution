/**
 * ==========================================================================
 * YOUTUBE VIDEO REVIEWS
 * ==========================================================================
 * Video testimonials are YouTube links, not uploaded files. Video would burn
 * the Cloudinary bandwidth allowance far faster than photos do, and YouTube
 * gives us hosting, transcoding, adaptive streaming and thumbnails for free.
 *
 * The admin pastes whatever URL YouTube handed them, so all four shapes have
 * to resolve to the same id:
 *   youtube.com/watch?v=ID   youtu.be/ID   youtube.com/embed/ID   /shorts/ID
 * ==========================================================================
 */

/** Extract the 11-character video id, or null if this isn't a YouTube URL. */
export const youTubeId = (url) => {
  if (typeof url !== "string" || !url) return null;

  const patterns = [
    /[?&]v=([\w-]{11})/, // watch?v=ID
    /youtu\.be\/([\w-]{11})/, // youtu.be/ID
    /\/embed\/([\w-]{11})/, // /embed/ID
    /\/shorts\/([\w-]{11})/, // /shorts/ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Poster frame. `hqdefault` rather than `maxresdefault` on purpose —
 * maxres only exists for videos uploaded above 720p and 404s silently
 * otherwise, which would leave holes in the grid for phone-shot reviews.
 */
export const youTubeThumbnail = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/**
 * Embed URL for the lightbox player. youtube-nocookie.com does not write
 * tracking cookies until the visitor actually hits play, and rel=0 keeps
 * YouTube from suggesting a competitor's video when this one ends.
 */
export const youTubeEmbedUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

/** Public watch page — used for the "open on YouTube" affordance. */
export const youTubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
