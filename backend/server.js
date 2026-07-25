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
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Route modules
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const blogRoutes = require("./routes/blogRoutes");

connectDB();

const app = express();

// ------------------------------------------------------------------
// Security & core middleware
// ------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
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
// TODO: mount remaining routers as they're built out — productRoutes, faqRoutes,
// careerRoutes, amcRoutes, quoteRoutes, siteVisitRoutes, galleryRoutes, settingsRoutes

// ------------------------------------------------------------------
// Serve frontend build in production (single-container deployment)
// ------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => res.sendFile(path.join(clientBuildPath, "index.html")));
} else {
  app.get("/", (req, res) => res.send("Surya Kiran Solar Solution API is running..."));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});