const asyncHandler = require("express-async-handler");
const Pricing = require("../models/Pricing");

// @desc    Get the pricing page content
// @route   GET /api/pricing
// @access  Public
const getPricing = asyncHandler(async (req, res) => {
  const pricing = await Pricing.getSingleton();
  res.json({ success: true, data: pricing });
});

// @desc    Update the pricing page content
// @route   PUT /api/pricing
// @access  Private (admin/editor)
const updatePricing = asyncHandler(async (req, res) => {
  const existing = await Pricing.getSingleton();
  const pricing = await Pricing.findByIdAndUpdate(existing._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: pricing, message: "Pricing page updated" });
});

module.exports = { getPricing, updatePricing };
