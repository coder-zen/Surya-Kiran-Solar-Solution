/**
 * Admin account recovery — for when you're locked out of /admin and the
 * "Forgot password" email can't reach you (e.g. the account is still on the
 * seeded admin@sksolarsolutions.com address, which is not a real mailbox).
 *
 * Run from the backend/ folder.
 *
 * RECOMMENDED — point the account at a mailbox you actually own, then use the
 * normal "Forgot password?" link on the login page to set your own password:
 *   node scripts/recover-admin.js --email=you@gmail.com
 *
 * Or set a password directly (note: it will appear in your shell history):
 *   node scripts/recover-admin.js --email=you@gmail.com --password=YourNewPass123
 *
 * Target a specific account instead of the super admin with --current-email=...
 * List every admin account without changing anything with --list.
 */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const User = require("../models/User");
const { ADMIN_ROLES } = require("../models/User");

const parseArgs = () =>
  process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    acc[key] = value === undefined ? true : value;
    return acc;
  }, {});

const run = async () => {
  const args = parseArgs();

  if (!process.env.MONGO_URI) {
    console.error("[recover-admin] MONGO_URI is not set in backend/.env — cannot connect.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("[recover-admin] Connected to MongoDB.\n");

  const admins = await User.find({ role: { $in: ADMIN_ROLES } }).select("name email role lastLogin");

  if (args.list || (!args.email && !args.password)) {
    console.log("Admin accounts currently in the database:");
    admins.forEach((a) => console.log(`  - ${a.email}  (${a.role})  ${a.name}`));
    console.log(
      "\nNothing changed. To fix a lockout, re-run with the email you want to use, e.g.:\n" +
        "  node scripts/recover-admin.js --email=you@gmail.com\n"
    );
    await mongoose.disconnect();
    return;
  }

  const target = args["current-email"]
    ? await User.findOne({ email: String(args["current-email"]).toLowerCase() }).select("+password")
    : await User.findOne({ role: "super_admin" }).select("+password");

  if (!target) {
    console.error("[recover-admin] No matching admin account found.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Target account: ${target.email} (${target.role})`);

  if (args.email) {
    const newEmail = String(args.email).toLowerCase().trim();
    const taken = await User.findOne({ email: newEmail, _id: { $ne: target._id } });
    if (taken) {
      console.error(`[recover-admin] "${newEmail}" is already used by another account. Aborting.`);
      await mongoose.disconnect();
      process.exit(1);
    }
    target.email = newEmail;
    console.log(`  → email changed to: ${newEmail}`);
  }

  if (args.password) {
    if (String(args.password).length < 8) {
      console.error("[recover-admin] Password must be at least 8 characters. Aborting.");
      await mongoose.disconnect();
      process.exit(1);
    }
    target.password = String(args.password); // pre-save hook hashes it
    console.log("  → password updated");
  }

  // Any pending reset link is invalidated, since the account just changed hands.
  target.resetPasswordToken = undefined;
  target.resetPasswordExpires = undefined;

  await target.save();
  console.log("\n[recover-admin] Saved successfully.\n");

  if (args.email && !args.password) {
    console.log("Next step — set your password without needing the old one:");
    console.log("  1. Go to http://localhost:5173/admin/login");
    console.log("  2. Click \"Forgot password?\"");
    console.log(`  3. Enter ${target.email} — the reset link will arrive in that inbox.\n`);
  } else {
    console.log(`You can now log in at http://localhost:5173/admin/login as ${target.email}\n`);
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error("[recover-admin] Failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
