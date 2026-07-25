const mongoose = require("mongoose");

/**
 * Single-document collection (site-wide singleton) for admin-editable
 * company info, social links, and theme tokens.
 */
const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "Surya Kiran Solar Solution" },
    phone: { type: String },
    whatsapp: { type: String },
    email: { type: String },
    address: { type: String },
    officeLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [73.8567, 18.5204] }, // Pune default
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      twitter: String,
    },
    seoDefaults: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
