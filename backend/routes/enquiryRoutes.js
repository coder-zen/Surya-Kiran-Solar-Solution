const express = require("express");
const {
  createEnquiry,
  getEnquiries,
  updateEnquiry,
  advanceEnquiry,
  rejectEnquiry,
  deleteEnquiry,
} = require("../controllers/enquiryController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const staffOnly = [protect, authorize("admin", "super_admin", "employee")];

router.post("/", createEnquiry); // public — every lead form/CTA posts here
router.get("/", ...staffOnly, getEnquiries);
router.put("/:id", ...staffOnly, updateEnquiry);
router.put("/:id/advance", ...staffOnly, advanceEnquiry);
router.put("/:id/reject", ...staffOnly, rejectEnquiry);

// Narrower than staffOnly on purpose — deleting a lead is irreversible, so it
// is kept away from the employee role that can otherwise work the pipeline.
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteEnquiry);

module.exports = router;
