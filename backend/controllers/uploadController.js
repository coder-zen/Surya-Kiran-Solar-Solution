const asyncHandler = require("express-async-handler");
const { cloudinary, isConfigured } = require("../config/cloudinary");

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
