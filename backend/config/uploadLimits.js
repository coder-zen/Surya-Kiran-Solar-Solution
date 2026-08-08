/**
 * Upload size ceilings, in one place so the multer middleware that enforces
 * them and the error handler that explains them can never drift apart.
 *
 * IMAGE_MAX_BYTES is 10MB because admins upload straight off a DSLR — those
 * files run 6-8MB, and the originals are kept deliberately (Cloudinary is the
 * archive; visitors are served resized derivatives, see frontend/src/utils/
 * cloudinaryImage.js). 10MB is also the per-image ceiling on Cloudinary's free
 * plan, so raising this further would just move the rejection from here to
 * Cloudinary, after the bytes have already crossed the wire.
 */
const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const DOCUMENT_MAX_BYTES = 8 * 1024 * 1024; // 8MB

const asMb = (bytes) => `${Math.round(bytes / (1024 * 1024))}MB`;

module.exports = { IMAGE_MAX_BYTES, DOCUMENT_MAX_BYTES, asMb };
