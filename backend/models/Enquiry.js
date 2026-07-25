const mongoose = require("mongoose");

/**
 * Generic lead-capture collection used by every CTA on the site:
 * "Get Free Quote", contact form, exit-intent popup, sticky WhatsApp form, etc.
 * `source` records which UI element generated the lead, for marketing attribution.
 */
const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    city: { type: String },
    propertyType: { type: String, enum: ["Residential", "Commercial", "Industrial", "Government", "Other"] },
    monthlyBill: { type: Number },
    message: { type: String },
    source: {
      type: String,
      enum: ["hero_cta", "contact_form", "exit_intent", "whatsapp_widget", "service_page", "calculator", "career", "amc", "other"],
      default: "other",
    },
    status: { type: String, enum: ["New", "Contacted", "Qualified", "Converted", "Lost"], default: "New" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
