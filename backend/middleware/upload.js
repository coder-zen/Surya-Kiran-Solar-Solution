const multer = require("multer");
const { IMAGE_MAX_BYTES } = require("../config/uploadLimits");

/**
 * In-memory storage — the file buffer is streamed straight to Cloudinary in
 * uploadController.js, never written to local disk (works the same on a
 * serverless/container deployment as it does locally).
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: IMAGE_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;
