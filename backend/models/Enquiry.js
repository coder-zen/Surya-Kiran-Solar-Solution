const mongoose = require("mongoose");

/**
 * Lead pipeline stages, in order. A lead starts at "Enquiry Received"
 * automatically on form submit and is advanced manually by staff; "Rejected"
 * is reachable from any non-terminal stage.
 */
const LEAD_STAGES = [
  "Enquiry Received",
  "Pending",
  "Converted",
  "Project In Progress",
  "Completed",
  "Rejected",
];

/** Stages with no outgoing transitions. */
const TERMINAL_STAGES = ["Completed", "Rejected"];

/** What "Advance" does from each stage, and what the button should say. */
const NEXT_STAGE = {
  "Enquiry Received": "Pending",
  Pending: "Converted",
  Converted: "Project In Progress",
  "Project In Progress": "Completed",
};

const ADVANCE_LABELS = {
  "Enquiry Received": "Start Working",
  Pending: "Convert to Project",
  Converted: "Mark Project In Progress",
  "Project In Progress": "Mark Completed",
};

/**
 * Values used before the pipeline existed. Kept valid in the enum so existing
 * documents don't fail validation, and mapped to their pipeline equivalent on
 * read (see normalizeStage) so the admin UI only ever sees the 6 real stages.
 */
const LEGACY_STAGE_MAP = {
  New: "Enquiry Received",
  Contacted: "Pending",
  Qualified: "Pending",
  Lost: "Rejected",
};

const normalizeStage = (status) => LEGACY_STAGE_MAP[status] || status;

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
    status: {
      type: String,
      enum: [...LEAD_STAGES, ...Object.keys(LEGACY_STAGE_MAP)],
      default: "Enquiry Received",
    },
    // Set when the lead is converted — links the two records both directions so
    // the Leads page can show the project's live execution status.
    convertedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    rejectionReason: { type: String },
    rejectedAt: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

const Enquiry = mongoose.model("Enquiry", enquirySchema);

module.exports = Enquiry;
module.exports.LEAD_STAGES = LEAD_STAGES;
module.exports.TERMINAL_STAGES = TERMINAL_STAGES;
module.exports.NEXT_STAGE = NEXT_STAGE;
module.exports.ADVANCE_LABELS = ADVANCE_LABELS;
module.exports.normalizeStage = normalizeStage;
