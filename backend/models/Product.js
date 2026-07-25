const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    brand: { type: String }, // Waaree, Adani, Luminous, Growatt, UTL, Australian Premium Solar...
    category: { type: String, enum: ["Panel", "Inverter", "Battery", "Mounting Structure", "Cable", "Accessory"] },
    specifications: [{ key: String, value: String }],
    brochureUrl: { type: String },
    images: [{ type: String }],
    warranty: { type: String },
    description: { type: String },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre("validate", function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model("Product", productSchema);
