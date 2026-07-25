const express = require("express");
const { getBlogs, getBlogBySlug, createBlog } = require("../controllers/blogController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/", protect, authorize("admin", "super_admin", "editor"), createBlog);

module.exports = router;
