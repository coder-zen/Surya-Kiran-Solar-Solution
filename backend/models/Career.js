const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String },
    location: { type: String },
    type: { type: String, enum: ["Full-Time", "Part-Time", "Internship", "Contract"], default: "Full-Time" },
    experience: { type: String },
    description: { type: String },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Career", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String },
    status: { type: String, enum: ["New", "Shortlisted", "Interviewing", "Rejected", "Hired"], default: "New" },
  },
  { timestamps: true }
);

module.exports = {
  Career: mongoose.model("Career", careerSchema),
  CareerApplication: mongoose.model("CareerApplication", applicationSchema),
};
