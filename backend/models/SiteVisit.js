const mongoose = require("mongoose");

const siteVisitSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    preferredDate: { type: Date },
    status: { type: String, enum: ["Requested", "Scheduled", "Completed", "Cancelled"], default: "Requested" },
    assignedEngineer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteVisit", siteVisitSchema);
