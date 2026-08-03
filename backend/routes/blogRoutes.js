const express = require("express");
const {
  getBlogs,
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getBlogs);
// Must precede /:slug, otherwise "all" is captured as a slug.
router.get("/all", protect, authorize("admin", "super_admin", "editor"), getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/", protect, authorize("admin", "super_admin", "editor"), createBlog);
router.put("/:id", protect, authorize("admin", "super_admin", "editor"), updateBlog);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteBlog);

module.exports = router;
