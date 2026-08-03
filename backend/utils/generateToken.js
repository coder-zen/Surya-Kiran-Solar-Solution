const jwt = require("jsonwebtoken");

/**
 * Signs a JWT and sets it as an httpOnly cookie (XSS-safe storage).
 * Also returns the raw token in the JSON body for clients (e.g. mobile apps)
 * that prefer the Authorization: Bearer header approach.
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    // Frontend (Vercel) and backend (Render) are different sites, so the
    // cookie must be SameSite=None to be sent cross-site — this requires
    // Secure to always be true in production (browsers reject None without it).
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: (Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateToken;
