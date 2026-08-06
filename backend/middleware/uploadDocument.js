const multer = require("multer");

/**
 * Separate multer instance from upload.js — that one is image-only (mimetype
 * + magic-byte checked for JPEG/PNG/GIF/WebP), which would reject every real
 * resume. Same in-memory approach: the buffer streams straight to Cloudinary,
 * never touching local disk.
 */
const storage = multer.memoryStorage();

const uploadDocument = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB — generous for a resume with a portfolio page or two
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword", // legacy .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF, DOC or DOCX files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = uploadDocument;
