const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * Single User collection used for both admin & staff accounts (role-based access).
 * Customer-facing "Users" (future customer portal) can reuse this same schema
 * with role: "customer" — kept generic so the FUTURE FEATURES roadmap
 * (customer login, dealer portal, employee portal) doesn't need a schema migration.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "editor", "employee", "dealer", "customer"],
      default: "customer",
    },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // Only the SHA-256 hash of the reset token is stored — the raw token exists
    // solely in the emailed link, so a leaked DB dump can't be used to reset.
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/** Roles that count against ADMIN_SEAT_LIMIT and can reach the /admin panel. */
const ADMIN_ROLES = ["super_admin", "admin", "editor", "employee"];
const ADMIN_SEAT_LIMIT = 5;

/**
 * Generates a reset token, stores only its hash + expiry on the document, and
 * returns the RAW token for emailing. Caller must save() afterwards.
 */
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 60 minutes
  return rawToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.ADMIN_ROLES = ADMIN_ROLES;
module.exports.ADMIN_SEAT_LIMIT = ADMIN_SEAT_LIMIT;
