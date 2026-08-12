const express = require("express");
const {
  getQuoteConfig,
  getQuoteConfigAdmin,
  updateQuoteConfig,
} = require("../controllers/quoteConfigController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Must be declared before "/" so the literal path isn't shadowed.
router.get("/admin", protect, authorize("admin", "super_admin", "editor"), getQuoteConfigAdmin);

router.get("/", getQuoteConfig); // customer-safe: no purchase cost, no margin
router.put("/", protect, authorize("admin", "super_admin", "editor"), updateQuoteConfig);

module.exports = router;
