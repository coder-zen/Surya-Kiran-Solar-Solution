const mongoose = require("mongoose");
const slugify = require("slugify");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    icon: { type: String, default: "" }, // icon key (see src/constants/serviceIcons.js on frontend)
    shortDescription: { type: String, required: true },
    fullDescription: { type: String },
    benefits: [{ type: String }],
    process: [
      {
        step: Number,
        title: String,
        description: String,
      },
    ],
    images: [{ type: String }],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    order: { type: Number, default: 0 }, // controls display order on Services grid
    isPublished: { type: Boolean, default: true },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

serviceSchema.pre("validate", function (next) {
  if (this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model("Service", serviceSchema);
