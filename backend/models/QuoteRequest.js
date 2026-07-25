const mongoose = require("mongoose");

/**
 * Structured output of the Solar Savings Calculator — distinct from generic
 * Enquiry so calculator inputs/outputs are preserved for sales follow-up.
 */
const quoteRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    electricityBill: { type: Number, required: true },
    location: { type: String },
    roofAreaSqFt: { type: Number },
    estimatedSystemSizeKW: { type: Number },
    estimatedMonthlySavings: { type: Number },
    estimatedROIYears: { type: Number },
    estimatedCarbonOffsetKg: { type: Number },
    status: { type: String, enum: ["New", "Contacted", "Converted", "Lost"], default: "New" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuoteRequest", quoteRequestSchema);
