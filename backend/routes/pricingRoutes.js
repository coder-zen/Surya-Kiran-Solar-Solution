const express = require("express");
const { getPricing, updatePricing } = require("../controllers/pricingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getPricing);
router.put("/", protect, authorize("admin", "super_admin", "editor"), updatePricing);

module.exports = router;
