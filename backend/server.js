// ---------------------------------------------------------------------------
// WORKAROUND: Some Windows/network setups fail to resolve the DNS SRV record
// that MongoDB Atlas's `mongodb+srv://` connection strings depend on
// (symptom: "querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net"),
// even though the system's default DNS works fine for normal lookups (e.g.
// MongoDB Compass connects without issue). Forcing Node's own DNS resolver
// to use Google's public DNS servers fixes this without needing to change
// Windows network settings system-wide. Safe to leave in for all environments.
// ---------------------------------------------------------------------------
require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

// ---------------------------------------------------------------------------
// Prefer IPv4 for every outbound lookup. Render's containers have no IPv6
// route, but smtp.gmail.com publishes AAAA records and Node otherwise tries
// those first — every email died with
//   connect ENETUNREACH 2404:6800:4003:c1a::6c:587
// then timed out. Set at the process level rather than per-connection so any
// outbound host (SMTP, Cloudinary, Atlas) is covered, not just the one that
// happened to break first.
// ---------------------------------------------------------------------------
require("dns").setDefaultResultOrder("ipv4first");

const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

dotenv.config();

const connectDB = require("./config/db");
const { logEmailConfigStatus } = require("./utils/sendEmail");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Route modules
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

connectDB();

const app = express();

// ------------------------------------------------------------------
// Security & core middleware
// ------------------------------------------------------------------
/*
 * Render (like most PaaS) puts a reverse proxy in front of the app, so the
 * client's real IP arrives in X-Forwarded-For rather than the socket address.
 * Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
 * on every request and — worse — would key every visitor off the proxy's single
 * IP, so one person hitting the login limit would lock out everyone.
 *
 * `1` trusts exactly one hop (Render's proxy). `true` would trust the whole
 * chain and let a client spoof its own IP to dodge rate limiting entirely.
 */
app.set("trust proxy", 1);

app.use(helmet());
// CLIENT_URL can be a single origin or a comma-separated list (e.g. while
// transitioning between a .vercel.app preview URL and a final custom domain,
// or to allow both "yourdomain.com" and "www.yourdomain.com" at once).
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
// 1mb is generous for the largest JSON this API takes (a blog post body).
// File uploads don't pass through here — they go through multer as multipart,
// which enforces its own 5mb cap in middleware/upload.js. A high limit on a
// public endpoint like POST /api/enquiries is just free memory to burn.
app.use(express.json({ limit: "1mb" }));

/*
 * express.urlencoded is deliberately NOT enabled — it was the app's main CSRF
 * vector. The auth cookie is SameSite=None (required: the frontend and this API
 * are on different domains), so the browser attaches it to cross-site requests.
 * A JSON request is protected by the CORS preflight, which this server fails for
 * unknown origins. But an HTML form POST is a "simple request": no preflight, so
 * a malicious page could silently fire a state-changing request with the admin's
 * cookie riding along. Without a urlencoded parser that body arrives unparsed,
 * req.body stays empty, and the request fails validation.
 *
 * If a form-encoded endpoint is ever genuinely needed, add real CSRF tokens
 * (the `csrf-csrf` package — `csurf` is deprecated) before re-enabling this.
 */
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ / . operators from req.body, req.query, req.params
app.use(xss()); // sanitizes user input from malicious HTML/JS

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate limit: protects auth & enquiry endpoints from abuse/spam
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
app.get("/api/health", (req, res) => res.json({ success: true, message: "API is healthy" }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/settings", settingsRoutes);
// TODO: mount remaining routers as they're built out — productRoutes, faqRoutes,
// careerRoutes, amcRoutes, quoteRoutes, siteVisitRoutes, settingsRoutes

// ------------------------------------------------------------------
// Serve frontend build in production (single-container deployment)
// ------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => res.sendFile(path.join(clientBuildPath, "index.html")));
} else {
  app.get("/", (req, res) => res.send("SK Solar Solutions API is running..."));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  // Surfaces a broken/absent mail setup at boot rather than silently at 3am.
  logEmailConfigStatus();
});