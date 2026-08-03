const express = require("express");
const { getGalleryImages, createGalleryImage, deleteGalleryImage } = require("../controllers/galleryController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getGalleryImages);
router.post("/", protect, authorize("admin", "super_admin", "editor"), createGalleryImage);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteGalleryImage);

module.exports = router;
