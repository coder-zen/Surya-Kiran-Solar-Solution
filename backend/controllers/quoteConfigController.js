const asyncHandler = require("express-async-handler");
const QuoteConfig = require("../models/QuoteConfig");

/**
 * Two getters, deliberately. The configurator and its admin screen need the
 * same document but must not receive the same fields: purchase cost and the
 * margin derived from it are internal, and an API response is as public as the
 * page that calls it. Splitting the routes means the customer-facing one can
 * never be widened by accident — it has no code path that reaches the costing
 * fields at all.
 */

// @desc    Pricing options for the public configurator (no cost/margin data)
// @route   GET /api/quote-config
// @access  Public
const getQuoteConfig = asyncHandler(async (req, res) => {
  const config = await QuoteConfig.getSingleton();
  res.json({ success: true, data: config.toCustomerJSON() });
});

// @desc    Full pricing config including purchase cost and margin
// @route   GET /api/quote-config/admin
// @access  Private (admin/editor)
const getQuoteConfigAdmin = asyncHandler(async (req, res) => {
  const config = await QuoteConfig.getSingleton();

  /*
   * Margin is computed here rather than stored, so it can never disagree with
   * the two numbers it comes from. Per option, and only on this route.
   */
  const withMargin = config.toObject({ versionKey: false });
  const OPTION_GROUPS = [
    "panelBrands", "inverterBrands", "structureTypes", "walkwayOptions",
    "railingOptions", "ladderOptions", "protectionCoverOptions",
    "sprinklerOptions", "addOns",
  ];
  for (const group of OPTION_GROUPS) {
    withMargin[group] = (withMargin[group] || []).map((opt) => ({
      ...opt,
      margin: (opt.price || 0) - (opt.purchaseCost || 0),
    }));
  }

  res.json({ success: true, data: withMargin });
});

// @desc    Update the pricing config
// @route   PUT /api/quote-config
// @access  Private (admin/editor)
const updateQuoteConfig = asyncHandler(async (req, res) => {
  const existing = await QuoteConfig.getSingleton();

  /*
   * `margin` is sent back by the admin form because it renders it, but it is
   * derived and has no column — dropping it here keeps Mongoose from storing a
   * number that would immediately go stale when price or cost changes.
   */
  const payload = { ...req.body };
  const OPTION_GROUPS = [
    "panelBrands", "inverterBrands", "structureTypes", "walkwayOptions",
    "railingOptions", "ladderOptions", "protectionCoverOptions",
    "sprinklerOptions", "addOns",
  ];
  for (const group of OPTION_GROUPS) {
    if (Array.isArray(payload[group])) {
      payload[group] = payload[group].map(({ margin, ...opt }) => opt);
    }
  }

  const config = await QuoteConfig.findByIdAndUpdate(existing._id, payload, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: config, message: "Pricing configuration updated" });
});

module.exports = { getQuoteConfig, getQuoteConfigAdmin, updateQuoteConfig };
