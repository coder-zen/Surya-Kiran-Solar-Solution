const express = require("express");
const {
  getCareers,
  getCareerById,
  applyToCareer,
  getAllCareers,
  createCareer,
  updateCareer,
  deleteCareer,
  getApplications,
  updateApplicationStatus,
} = require("../controllers/careerController");
const { protect, authorize } = require("../middleware/auth");
const uploadDocument = require("../middleware/uploadDocument");

const router = express.Router();

// Applications carry candidate PII (email, phone, resume) — restricted to
// admin/super_admin/employee, deliberately excluding "editor" even though
// editor can manage the job postings themselves.
const staffOnly = [protect, authorize("admin", "super_admin", "employee")];

// Specific paths before "/:id" — otherwise Express would try to treat
// "admin" as an :id.
router.get("/admin/all", ...staffOnly, getAllCareers);
router.get("/admin/applications", ...staffOnly, getApplications);
router.put("/admin/applications/:id", ...staffOnly, updateApplicationStatus);

router.get("/", getCareers);
router.get("/:id", getCareerById);
router.post("/:id/apply", uploadDocument.single("resume"), applyToCareer);

router.post("/", protect, authorize("admin", "super_admin", "editor"), createCareer);
router.put("/:id", protect, authorize("admin", "super_admin", "editor"), updateCareer);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteCareer);

module.exports = router;
