const asyncHandler = require("express-async-handler");
const Service = require("../models/Service");

const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ isPublished: true }).sort({ order: 1 });
  res.json({ success: true, count: services.length, data: services });
});

// @desc    List every service including unpublished drafts (admin editor view)
// @route   GET /api/services/all
// @access  Private (admin/editor)
const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ order: 1 });
  res.json({ success: true, count: services.length, data: services });
});

const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, isPublished: true });
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }
  res.json({ success: true, data: service });
});

const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, data: service });
});

const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }
  res.json({ success: true, data: service });
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }
  res.json({ success: true, message: "Service deleted" });
});

module.exports = { getServices, getAllServices, getServiceBySlug, createService, updateService, deleteService };
