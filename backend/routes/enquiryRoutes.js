const express = require("express");
const { createEnquiry, getEnquiries, updateEnquiry } = require("../controllers/enquiryController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", createEnquiry); // public — every lead form/CTA posts here
router.get("/", protect, authorize("admin", "super_admin", "employee"), getEnquiries);
router.put("/:id", protect, authorize("admin", "super_admin", "employee"), updateEnquiry);

module.exports = router;
