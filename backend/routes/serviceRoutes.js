const express = require("express");
const {
  getServices,
  getAllServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getServices);
// Must precede /:slug, otherwise "all" is captured as a slug.
router.get("/all", protect, authorize("admin", "super_admin", "editor"), getAllServices);
router.get("/:slug", getServiceBySlug);
router.post("/", protect, authorize("admin", "super_admin", "editor"), createService);
router.put("/:id", protect, authorize("admin", "super_admin", "editor"), updateService);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteService);

module.exports = router;
