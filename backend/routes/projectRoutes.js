const express = require("express");
const {
  getProjects,
  getProjectsForMap,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/map", getProjectsForMap); // must come before /:slug
router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);
router.post("/", protect, authorize("admin", "super_admin", "editor"), createProject);
router.put("/:id", protect, authorize("admin", "super_admin", "editor"), updateProject);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteProject);

module.exports = router;
