const express = require("express");
const {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getServices);
router.get("/:slug", getServiceBySlug);
router.post("/", protect, authorize("admin", "super_admin", "editor"), createService);
router.put("/:id", protect, authorize("admin", "super_admin", "editor"), updateService);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteService);

module.exports = router;
