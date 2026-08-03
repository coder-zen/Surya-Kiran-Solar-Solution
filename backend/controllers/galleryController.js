const asyncHandler = require("express-async-handler");
const Gallery = require("../models/Gallery");

// @desc    List published gallery images (optionally filter by ?category=)
// @route   GET /api/gallery
// @access  Public
const getGalleryImages = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isPublished: true };
  if (category && category !== "All") filter.category = category;

  const images = await Gallery.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: images.length, data: images });
});

// @desc    Add a gallery image
// @route   POST /api/gallery
// @access  Private (admin/editor)
const createGalleryImage = asyncHandler(async (req, res) => {
  const image = await Gallery.create(req.body);
  res.status(201).json({ success: true, data: image });
});

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private (admin)
const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findByIdAndDelete(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error("Gallery image not found");
  }
  res.json({ success: true, message: "Gallery image deleted" });
});

module.exports = { getGalleryImages, createGalleryImage, deleteGalleryImage };
