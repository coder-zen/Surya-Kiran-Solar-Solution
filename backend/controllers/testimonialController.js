const asyncHandler = require("express-async-handler");
const Testimonial = require("../models/Testimonial");

const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .populate("relatedProject", "title district");
  res.json({ success: true, count: testimonials.length, data: testimonials });
});

const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json({ success: true, data: testimonial });
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }
  res.json({ success: true, data: testimonial });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }
  res.json({ success: true, message: "Testimonial deleted" });
});

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
