const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { ADMIN_ROLES, ADMIN_SEAT_LIMIT } = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// @desc    Register a new admin/staff user (super_admin only)
// @route   POST /api/auth/register
// @access  Private (super_admin)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!ADMIN_ROLES.includes(role)) {
    res.status(400);
    throw new Error(`Role must be one of: ${ADMIN_ROLES.join(", ")}`);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const seatsUsed = await User.countDocuments({ role: { $in: ADMIN_ROLES } });
  if (seatsUsed >= ADMIN_SEAT_LIMIT) {
    res.status(400);
    throw new Error(
      `Admin limit reached (${ADMIN_SEAT_LIMIT} of ${ADMIN_SEAT_LIMIT} seats used). Remove an existing admin before adding another.`
    );
  }

  const user = await User.create({ name, email, password, phone, role });

  // NOTE: deliberately does NOT call generateToken() — doing so would overwrite
  // the creating super_admin's own auth cookie and log them out.
  res.status(201).json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    List all admin-panel users (so the team can see who has access)
// @route   GET /api/auth/users
// @access  Private (any admin-panel role)
const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $in: ADMIN_ROLES } })
    .select("name email role isActive lastLogin createdAt")
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    count: users.length,
    seatLimit: ADMIN_SEAT_LIMIT,
    seatsRemaining: Math.max(0, ADMIN_SEAT_LIMIT - users.length),
    data: users,
  });
});

// @desc    Remove an admin user (frees a seat)
// @route   DELETE /api/auth/users/:id
// @access  Private (super_admin)
const deleteAdminUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot remove your own account");
  }

  const user = await User.findOne({ _id: req.params.id, role: { $in: ADMIN_ROLES } });
  if (!user) {
    res.status(404);
    throw new Error("Admin user not found");
  }

  // Guard against removing the last super_admin, which would leave nobody able
  // to add users or manage the team.
  if (user.role === "super_admin") {
    const superAdmins = await User.countDocuments({ role: "super_admin" });
    if (superAdmins <= 1) {
      res.status(400);
      throw new Error("Cannot remove the only super admin");
    }
  }

  await user.deleteOne();
  res.json({ success: true, message: "Admin user removed" });
});

// @desc    Login user & set JWT cookie
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  generateToken(res, user._id);

  res.json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Change the logged-in user's own password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are both required");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword; // pre-save hook rehashes
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

// @desc    Change the logged-in user's own login email
// @route   PUT /api/auth/change-email
// @access  Private
const changeEmail = asyncHandler(async (req, res) => {
  const { currentPassword, newEmail } = req.body;

  if (!currentPassword || !newEmail) {
    res.status(400);
    throw new Error("Current password and new email are both required");
  }

  const normalizedEmail = newEmail.toLowerCase().trim();

  // Require the password even though the user is already logged in — otherwise
  // an unattended open session could be used to hijack the account by pointing
  // it (and password recovery) at an attacker's mailbox.
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  if (normalizedEmail === user.email) {
    res.status(400);
    throw new Error("That is already your current email");
  }

  const taken = await User.findOne({ email: normalizedEmail });
  if (taken) {
    res.status(400);
    throw new Error("That email is already in use by another account");
  }

  user.email = normalizedEmail;
  await user.save();

  res.json({
    success: true,
    message: "Email updated successfully. Use it to log in from now on.",
    data: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Start password recovery — emails a single-use reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Always return the same response whether or not the account exists, so this
  // endpoint can't be used to discover which emails are registered.
  const genericResponse = {
    success: true,
    message: "If that email is registered, a password reset link has been sent to it.",
  };

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase(), role: { $in: ADMIN_ROLES } });
  if (!user) return res.json(genericResponse);

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim();
  const resetUrl = `${clientUrl}/admin/reset-password/${rawToken}`;

  const result = await sendEmail({
    to: user.email,
    subject: "Reset your SK Solar admin password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0B2447,#19376D);padding:24px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;color:#fff;font-size:20px;">Password Reset Request</h1>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;">
          <p style="color:#2B2D42;font-size:14px;">Hi ${user.name},</p>
          <p style="color:#2B2D42;font-size:14px;">
            We received a request to reset the password for your SK Solar admin account.
            This link expires in 60 minutes and can only be used once.
          </p>
          <p style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:#FF7A00;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:999px;">
              Reset Password
            </a>
          </p>
          <p style="color:#6B7280;font-size:12px;">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
        </div>
      </div>
    `,
  });

  // If the mail couldn't be sent, clear the token rather than leaving a live
  // reset token stranded on the account with no way to deliver it.
  if (!result.sent) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("[forgotPassword] Reset email failed to send:", result.reason);
  }

  res.json(genericResponse);
});

// @desc    Complete password recovery using the emailed token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    res.status(400);
    throw new Error("This reset link is invalid or has expired. Please request a new one.");
  }

  user.password = password; // pre-save hook rehashes
  user.resetPasswordToken = undefined; // single-use
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successfully. You can now log in." });
});

// @desc    Logout — clear the auth cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out successfully" });
});

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = {
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
};
