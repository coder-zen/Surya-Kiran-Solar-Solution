const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    category: { type: String },
    tags: [{ type: String }],
    coverImage: { type: String },
    excerpt: { type: String },
    contentMarkdown: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    seo: { metaTitle: String, metaDescription: String },
  },
  { timestamps: true }
);

blogSchema.pre("validate", function (next) {
  if (this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
