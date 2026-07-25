const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String },
    category: { type: String, enum: ["Installation", "Team", "Events", "Projects", "Office"], default: "Installation" },
    image: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
