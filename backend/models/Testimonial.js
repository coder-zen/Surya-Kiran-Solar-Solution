const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    location: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true },
    image: { type: String, default: "" },
    /**
     * YouTube link for a video review. A testimonial carrying one renders in
     * the video wall on the homepage instead of the text marquee, so the two
     * sections never show the same customer twice.
     *
     * Stored as the URL the admin pasted rather than a bare video id — the id
     * is derived at render time (frontend/src/utils/youtube.js), which keeps
     * the admin free to paste a watch link, a youtu.be link or a Short.
     * Validated here because a mistyped link fails silently in an <iframe>:
     * the section would render a dead black box with no error anywhere.
     */
    videoUrl: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (v) => !v || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//i.test(v),
        message: "Video link must be a YouTube URL (youtube.com or youtu.be).",
      },
    },
    isVerified: { type: Boolean, default: false },
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
