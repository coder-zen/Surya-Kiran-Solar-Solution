const express = require("express");
const { registerUser, loginUser, logoutUser, getMe } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/register", protect, authorize("super_admin"), registerUser); // first admin seeded via seed script
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

module.exports = router;
