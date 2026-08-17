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
 * Poster frames, largest first.
 *
 * Resolution matters more than it looks: `hqdefault` is only 480x360, so a
 * featured card ~1120px wide upscales it past 2x and it reads as blurry on
 * first sight. It is also a 4:3 frame of a 16:9 video, so it carries black
 * letterbox bars that have to be cropped away, leaving barely 480x270 of
 * real picture.
 *
 * `maxresdefault` is a true 1280x720 with no bars, but it only exists for
 * videos uploaded above 720p — it 404s otherwise. So callers render the first
 * entry and fall back through the rest on error, rather than committing to
 * one and getting either blur or a hole in the grid.
 */
const THUMB = {
  maxres: (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, // 1280x720, 16:9, ~270KB
  sd: (id) => `https://i.ytimg.com/vi/${id}/sddefault.jpg`, //         640x480,  4:3, ~100KB
  hq: (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, //         480x360,  4:3, ~30KB
};

/**
 * @param {string} id
 * @param {"featured"|"grid"} slot how large this will be displayed
 *
 * The slot matters because maxres is roughly nine times the weight of hq.
 * Spending that on the one card that renders ~900px wide is worth it; spending
 * it on six thumbnails that render at 384px would add close to 2MB to the page
 * for detail nobody can see.
 */
export const youTubeThumbnails = (id, slot = "grid") =>
  slot === "featured"
    ? [THUMB.maxres(id), THUMB.sd(id), THUMB.hq(id)]
    : [THUMB.sd(id), THUMB.hq(id)];

/**
 * Embed URL for the lightbox player. youtube-nocookie.com does not write
 * tracking cookies until the visitor actually hits play, and rel=0 keeps
 * YouTube from suggesting a competitor's video when this one ends.
 */
export const youTubeEmbedUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

/** Public watch page — used for the "open on YouTube" affordance. */
export const youTubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
