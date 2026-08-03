const express = require("express");
const upload = require("../middleware/upload");
const { uploadImage } = require("../controllers/uploadController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("admin", "super_admin", "editor"), upload.single("image"), uploadImage);

module.exports = router;
