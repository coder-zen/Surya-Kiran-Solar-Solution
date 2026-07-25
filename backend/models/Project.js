const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * Project collection powers BOTH the Projects portfolio page AND the
 * interactive Maharashtra project map on the homepage. `location.coordinates`
 * follows GeoJSON [lng, lat] order (MongoDB 2dsphere convention) so the same
 * document can be queried by district, by category, and geospatially.
 */
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    customerName: { type: String, trim: true }, // optional — shown only if customer consents
    category: {
      type: String,
      enum: ["Residential", "Commercial", "Industrial", "Ground Mounted", "Government"],
      required: true,
    },
    capacityKW: { type: Number, required: true },
    state: { type: String, default: "Maharashtra" },
    district: { type: String, required: true }, // Pune, Solapur, Satara, Kolhapur, Sangli, Ahmednagar...
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        required: true,
      },
    },
    installationDate: { type: Date },
    technologiesUsed: [{ type: String }], // e.g. ["Mono PERC Panels", "String Inverter", "Net Metering"]
    images: [{ type: String }],
    beforeImages: [{ type: String }],
    afterImages: [{ type: String }],
    coverImage: { type: String },
    customerFeedback: {
      text: { type: String },
      rating: { type: Number, min: 1, max: 5 },
    },
    description: { type: String },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

projectSchema.index({ location: "2dsphere" });

projectSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(`${this.title}-${this.district}`, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
