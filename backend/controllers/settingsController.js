const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");

// @desc    Get site settings (company info, social links, homepage content)
// @route   GET /api/settings
// @access  Public — the homepage reads hero/about content from here
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json({ success: true, data: settings });
});

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private (admin/super_admin)
const updateSettings = asyncHandler(async (req, res) => {
  const existing = await Settings.getSingleton();
  const settings = await Settings.findByIdAndUpdate(existing._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: settings, message: "Site content updated" });
});

module.exports = { getSettings, updateSettings };
