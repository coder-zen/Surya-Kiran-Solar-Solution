const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const { pointForDistrict } = require("../config/districts");

// @desc    Get all published projects (supports ?category= &district= &featured=true)
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const { category, district, featured, search } = req.query;
  const filter = { isPublished: true };

  if (category) filter.category = category;
  if (district) filter.district = district;
  if (featured) filter.isFeatured = featured === "true";
  if (search) filter.title = { $regex: search, $options: "i" };

  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: projects.length, data: projects });
});

// @desc    Get lightweight project points for the homepage map (GeoJSON-friendly)
// @route   GET /api/projects/map
// @access  Public
const getProjectsForMap = asyncHandler(async (req, res) => {
  const projects = await Project.find({ isPublished: true }).select(
    "title slug district capacityKW location coverImage category installationDate"
  );
  res.json({ success: true, count: projects.length, data: projects });
});

// @desc    Get single project by slug
// @route   GET /api/projects/:slug
// @access  Public
const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, isPublished: true });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ success: true, data: project });
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private (admin)
const createProject = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.location?.coordinates) {
    const point = pointForDistrict(payload.district);
    if (point) payload.location = point;
  }

  const project = await Project.create(payload);
  res.status(201).json({ success: true, data: project });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (admin)
const updateProject = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  /*
   * Re-derive the map pin when the district changes. createProject did this but
   * update never did, so editing a project from Pune to Nagpur relabelled the
   * card while leaving its marker sitting over Pune. Harmless while the admin
   * had no edit screen; a visible wrong-city bug the moment one exists.
   *
   * Only when the caller didn't send explicit coordinates, so a precise GPS pin
   * set by hand is never overwritten by the district centre.
   */
  if (!payload.location?.coordinates && payload.district) {
    const existing = await Project.findById(req.params.id).select("district");
    if (existing && existing.district !== payload.district) {
      const point = pointForDistrict(payload.district);
      if (point) payload.location = point;
    }
  }

  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ success: true, data: project });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (admin)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ success: true, message: "Project deleted" });
});

module.exports = {
  getProjects,
  getProjectsForMap,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
};
