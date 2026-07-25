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

const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, data: blog });
});

module.exports = { getBlogs, getBlogBySlug, createBlog };
