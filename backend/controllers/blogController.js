const asyncHandler = require("express-async-handler");
const Blog = require("../models/Blog");

const getBlogs = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: "i" };

  const blogs = await Blog.find(filter).sort({ publishedAt: -1 }).populate("author", "name avatar");
  res.json({ success: true, count: blogs.length, data: blogs });
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).populate("author", "name avatar");
  if (!blog) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  res.json({ success: true, data: blog });
});

// @desc    List every post including drafts (admin editor view)
// @route   GET /api/blogs/all
// @access  Private (admin/editor)
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 }).populate("author", "name avatar");
  res.json({ success: true, count: blogs.length, data: blogs });
});

const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    author: req.user._id,
    // Stamp the publish date the moment it first goes live, not on every edit.
    publishedAt: req.body.isPublished ? new Date() : undefined,
  });
  res.status(201).json({ success: true, data: blog });
});

// @desc    Update a post
// @route   PUT /api/blogs/:id
// @access  Private (admin/editor)
const updateBlog = asyncHandler(async (req, res) => {
  const existing = await Blog.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  const payload = { ...req.body };
  if (payload.isPublished && !existing.publishedAt) payload.publishedAt = new Date();

  const blog = await Blog.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json({ success: true, data: blog });
});

// @desc    Delete a post
// @route   DELETE /api/blogs/:id
// @access  Private (admin)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  res.json({ success: true, message: "Blog post deleted" });
});

module.exports = { getBlogs, getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog };
