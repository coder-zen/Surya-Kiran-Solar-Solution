const asyncHandler = require("express-async-handler");
const Enquiry = require("../models/Enquiry");

// @desc    Create a new lead (used by every CTA/form on the public site)
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);
  // TODO: trigger email/WhatsApp notification to sales team here (see utils/notify.js)
  res.status(201).json({ success: true, data: enquiry, message: "Thank you! Our team will contact you shortly." });
});

// @desc    List leads (admin CRM view, filterable by status/source)
// @route   GET /api/enquiries
// @access  Private (admin/employee)
const getEnquiries = asyncHandler(async (req, res) => {
  const { status, source } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;

  const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 }).populate("assignedTo", "name email");
  res.json({ success: true, count: enquiries.length, data: enquiries });
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }
  res.json({ success: true, data: enquiry });
});

module.exports = { createEnquiry, getEnquiries, updateEnquiry };
