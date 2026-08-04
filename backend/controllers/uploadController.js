const asyncHandler = require("express-async-handler");
const { cloudinary, isConfigured } = require("../config/cloudinary");

/**
 * Verify the file really is an image by inspecting its leading bytes.
 *
 * multer's fileFilter can only see `file.mimetype`, which is supplied by the
 * client and trivially forged — anything can be sent as "image/png". The magic
 * number is part of the file itself, so it can't be faked without actually
 * being that format. Checked here rather than in the middleware because with
 * memoryStorage the buffer isn't available until multer has finished.
 */
const IMAGE_SIGNATURES = [
  { name: "jpeg", bytes: [0xff, 0xd8, 0xff] },
  { name: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { name: "gif", bytes: [0x47, 0x49, 0x46, 0x38] },
];

const looksLikeImage = (buf) => {
  if (!buf || buf.length < 12) return false;
  const matches = (sig) => sig.bytes.every((b, i) => buf[i] === b);
  if (IMAGE_SIGNATURES.some(matches)) return true;
  // WebP is a RIFF container: "RIFF" at 0, "WEBP" at offset 8.
  return buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
};

// @desc    Upload a single image, return its hosted URL
// @route   POST /api/upload
// @access  Private (admin/editor)
const uploadImage = asyncHandler(async (req, res) => {
  if (!isConfigured()) {
    res.status(503);
    throw new Error(
      "Image uploads aren't configured yet — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and " +
        "CLOUDINARY_API_SECRET in backend/.env (see the Cloudinary dashboard for these values)."
    );
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }

  if (!looksLikeImage(req.file.buffer)) {
    res.status(400);
    throw new Error("That file isn't a valid image. Upload a JPEG, PNG, GIF or WebP.");
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sk-solar" },
      (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
    );
    stream.end(req.file.buffer);
  });

  res.status(201).json({ success: true, url: result.secure_url });
});

module.exports = { uploadImage };
