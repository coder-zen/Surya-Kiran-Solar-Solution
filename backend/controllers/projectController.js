const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const { pointForDistrict } = require("../config/districts");
const geocodePincode = require("../utils/geocodePincode");

/**
 * Best available position for a project, most precise first:
 *
 *   1. coordinates sent explicitly — a hand-placed pin always wins
 *   2. the PIN code's locality — accurate to a few streets
 *   3. the district centre — the old behaviour, and still the fallback when
 *      there is no PIN code or the lookup fails
 *
 * Returns null when nothing can be resolved, leaving the caller's existing
 * value untouched.
 */
const resolveLocation = async ({ explicit, pincode, district }) => {
  if (explicit?.coordinates?.length === 2) return null; // caller already has it

  if (pincode) {
    const coords = await geocodePincode(pincode);
    if (coords) return { type: "Point", coordinates: coords };
  }

  return pointForDistrict(district) || null;
};

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

  const located = await resolveLocation({
    explicit: payload.location,
    pincode: payload.pincode,
    district: payload.district,
  });
  if (located) payload.location = located;

  const project = await Project.create(payload);
  res.status(201).json({ success: true, data: project });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (admin)
const updateProject = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  /*
   * Re-derive the map pin whenever the inputs to it change — district (the old
   * bug: editing Pune to Nagpur relabelled the card but left the marker over
   * Pune) or now the PIN code, which is the whole point of entering one.
   *
   * Skipped entirely when the caller sends explicit coordinates, so a precise
   * pin set by hand is never overwritten.
   */
  if (!payload.location?.coordinates && (payload.district || payload.pincode)) {
    const existing = await Project.findById(req.params.id).select("district pincode");
    const districtChanged = payload.district && existing?.district !== payload.district;
    const pincodeChanged = payload.pincode !== undefined && existing?.pincode !== payload.pincode;

    if (districtChanged || pincodeChanged) {
      const located = await resolveLocation({
        pincode: payload.pincode ?? existing?.pincode,
        district: payload.district || existing?.district,
      });
      if (located) payload.location = located;
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
