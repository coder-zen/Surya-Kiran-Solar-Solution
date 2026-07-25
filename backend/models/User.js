const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

module.exports = mongoose.model("User", userSchema);
