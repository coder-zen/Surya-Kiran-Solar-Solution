const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  registerUser,
  getAdminUsers,
  deleteAdminUser,
  loginUser,
  changePassword,
  changeEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
  getMe,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Much stricter than the general /api limiter (200/15min) — a login endpoint
// is the one place brute-force attempts actually matter. Keyed by IP; a
// legitimate user mistyping their password a few times won't hit this.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});

// Separate, tighter budget so the reset endpoint can't be used to spam
// someone's inbox with reset emails.
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset requests. Please try again later." },
});

router.post("/login", loginLimiter, loginUser);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.put("/reset-password/:token", forgotPasswordLimiter, resetPassword);

router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/change-email", protect, changeEmail);

// Admin team management — any admin-panel role can SEE the team, but only
// super_admin can add or remove members.
router.get("/users", protect, authorize("super_admin", "admin", "editor", "employee"), getAdminUsers);
router.post("/register", protect, authorize("super_admin"), registerUser);
router.delete("/users/:id", protect, authorize("super_admin"), deleteAdminUser);

module.exports = router;
