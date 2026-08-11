const mongoose = require("mongoose");

/**
 * Single-document collection (site-wide singleton) for admin-editable
 * company info, social links, and theme tokens.
 */
const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "SK Solar Solutions" },
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

    /**
     * Homepage hero + About section content, previously hardcoded in
     * Hero.jsx / AboutSection.jsx. Defaults reproduce exactly what those
     * components shipped with, so the singleton self-populates on first read
     * and the admin form opens pre-filled rather than blank.
     *
     * heroVideoUrl is a URL rather than an upload: hero videos are far larger
     * than the 10MB image cap on POST /api/upload, and streaming big files
     * through the API risks request timeouts on hosted platforms. Point it at
     * a Cloudinary/CDN URL, or leave it blank to show the fallback image only.
     */
    homepageContent: {
      heroVideoUrl: { type: String, default: "" },
      heroFallbackImageUrl: { type: String, default: "" },
      heroEyebrow: { type: String, default: "Pune's Trusted On-Grid Rooftop Solar EPC Partner" },
      heroHeadline: { type: String, default: "Powering Homes & Businesses With Smart Solar Energy" },
      heroSubtext: {
        type: String,
        default:
          "MNRE & IEC-certified on-grid solar rooftop systems for homes, businesses and institutions — complete design, supply, installation, testing, commissioning and MSEDCL net-metering coordination, handled end-to-end.",
      },
      aboutImageUrl: { type: String, default: "" },
      aboutEyebrow: { type: String, default: "About SK Solar Solutions" },
      aboutHeadline: { type: String, default: "Engineering A Cleaner, More Independent Future" },
      aboutBodyText: {
        type: String,
        default:
          "SK Solar Solutions (Surya Kiran Solar Solutions), led by Director Suraj Dhotre, plans and delivers rooftop and ground-mounted solar power plants end-to-end — site survey, system design, module & BOS selection, erection, commissioning and MSEDCL liaisoning. Our residential solar solutions have helped solarize 70+ homes across India, using high-efficiency Monocrystalline panels backed by a 25-year performance warranty.",
      },
      aboutBulletPoints: {
        type: [String],
        default: () => [
          "MNRE & IEC-certified installation standards on every project",
          "In-house engineering, fabrication & commissioning teams",
          "Complete MSEDCL net-metering and subsidy paperwork, handled for you",
          "25-year panel performance warranty and up to 10-year inverter warranty",
        ],
      },
      aboutStatValue: { type: String, default: "70+" },
      aboutStatLabel: { type: String, default: "Homes Solarized" },

      /**
       * Video Reviews section.
       *
       * The featured video is about the company itself, so it belongs here
       * rather than in the Testimonial collection — it has no customer, no
       * rating and no location. The six-up grid below it is fed by
       * Testimonial documents carrying a videoUrl.
       *
       * youtubeChannelUrl drives the "Watch All Reviews on YouTube" button.
       * It is separate from socialLinks.youtube so saving this form cannot
       * overwrite the other social links, and falls back to socialLinks.youtube
       * when left blank.
       */
      videoSectionEyebrow: { type: String, default: "Video Reviews" },
      videoSectionHeadline: { type: String, default: "Hear It From Our Customers" },
      videoSectionSubtext: { type: String, default: "Real installations, in their own words." },
      featuredVideoUrl: { type: String, default: "" },
      featuredVideoTitle: { type: String, default: "" },
      featuredVideoSubtitle: { type: String, default: "" },
      youtubeChannelUrl: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

/** Site settings are a single document — created on first read so callers never see null. */
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model("Settings", settingsSchema);
