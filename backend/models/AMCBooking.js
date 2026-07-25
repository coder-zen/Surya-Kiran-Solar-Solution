const mongoose = require("mongoose");

const amcPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Basic, Standard, Premium
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ["Monthly", "Yearly"], default: "Yearly" },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const amcBookingSchema = new mongoose.Schema(
  {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "AMCPlan", required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    systemCapacityKW: { type: Number },
    status: { type: String, enum: ["Pending", "Confirmed", "Active", "Cancelled"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = {
  AMCPlan: mongoose.model("AMCPlan", amcPlanSchema),
  AMCBooking: mongoose.model("AMCBooking", amcBookingSchema),
};
