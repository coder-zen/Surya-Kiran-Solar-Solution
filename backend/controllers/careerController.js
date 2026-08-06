const asyncHandler = require("express-async-handler");
const { Career, CareerApplication } = require("../models/Career");
const { cloudinary, isConfigured } = require("../config/cloudinary");
const { notifyNewLead } = require("../utils/leadNotification");

// ---------------------------------------------------------------------------
// Public: job postings
// ---------------------------------------------------------------------------

// @desc    List open positions
// @route   GET /api/careers
// @access  Public
const getCareers = asyncHandler(async (req, res) => {
  const jobs = await Career.find({ isOpen: true }).sort({ createdAt: -1 });
  res.json({ success: true, count: jobs.length, data: jobs });
});

// @desc    Single job posting, including closed ones (an applicant may still
//          have the link after a role closes)
// @route   GET /api/careers/:id
// @access  Public
const getCareerById = asyncHandler(async (req, res) => {
  const job = await Career.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job posting not found");
  }
  res.json({ success: true, data: job });
});

/**
 * Verify the upload really is a document by its leading bytes — the same
 * defense used for images in uploadController.js, since the client-supplied
 * mimetype multer checked is trivially forged. DOCX is a zip container, so a
 * PK signature only proves "some zip", not specifically DOCX — combined with
 * multer's mimetype filter that's a reasonable bar without over-engineering
 * a full zip-manifest inspection for a resume upload.
 */
const looksLikeDocument = (buf) => {
  if (!buf || buf.length < 4) return false;
  const sig = (bytes) => bytes.every((b, i) => buf[i] === b);
  if (sig([0x25, 0x50, 0x44, 0x46])) return true; // %PDF
  if (sig([0xd0, 0xcf, 0x11, 0xe0])) return true; // legacy .doc (OLE)
  if (sig([0x50, 0x4b, 0x03, 0x04])) return true; // .docx (zip)
  return false;
};

// @desc    Apply to a job posting — uploads the resume and saves the application
// @route   POST /api/careers/:id/apply
// @access  Public
const applyToCareer = asyncHandler(async (req, res) => {
  const job = await Career.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job posting not found");
  }
  if (!job.isOpen) {
    res.status(400);
    throw new Error("This position is no longer accepting applications");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("A resume file is required");
  }
  if (!looksLikeDocument(req.file.buffer)) {
    res.status(400);
    throw new Error("That file isn't a valid PDF, DOC or DOCX");
  }
  if (!isConfigured()) {
    res.status(503);
    throw new Error("Resume uploads aren't configured yet — set CLOUDINARY_* in backend/.env");
  }

  const uploadResult = await new Promise((resolve, reject) => {
    // resource_type: "raw" — Cloudinary's image pipeline (transforms, format
    // detection) doesn't apply to a PDF/DOC and will otherwise reject it.
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sk-solar/resumes", resource_type: "raw" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  const application = await CareerApplication.create({
    job: job._id,
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    resumeUrl: uploadResult.secure_url,
    coverLetter: req.body.coverLetter,
  });

  // Reuses the same admin-alert channel as the enquiry form — same best-effort,
  // non-blocking contract, so a slow/broken mail provider can never fail the
  // applicant's submission.
  //
  // Deliberately omits `email` here even though the application has one:
  // notifyNewLead's customer-acknowledgement branch (leadNotification.js)
  // sends fixed copy — "We've received your solar enquiry" — written for the
  // quote form. Passing the candidate's email would send that mismatched
  // message to a job applicant. The admin alert (which doesn't need an email
  // on the enquiry object) still fires either way.
  notifyNewLead({
    name: application.fullName,
    phone: application.phone,
    message: `Applied for: ${job.title}. Resume: ${application.resumeUrl}`,
    source: "career",
  });

  res.status(201).json({ success: true, data: application, message: "Application submitted successfully." });
});

// ---------------------------------------------------------------------------
// Admin: job postings
// ---------------------------------------------------------------------------

// @desc    List every job posting, open or closed
// @route   GET /api/careers/admin/all
// @access  Private (admin/editor)
const getAllCareers = asyncHandler(async (req, res) => {
  const jobs = await Career.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: jobs.length, data: jobs });
});

// @desc    Create a job posting
// @route   POST /api/careers
// @access  Private (admin/editor)
const createCareer = asyncHandler(async (req, res) => {
  const job = await Career.create(req.body);
  res.status(201).json({ success: true, data: job });
});

// @desc    Update a job posting
// @route   PUT /api/careers/:id
// @access  Private (admin/editor)
const updateCareer = asyncHandler(async (req, res) => {
  const job = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) {
    res.status(404);
    throw new Error("Job posting not found");
  }
  res.json({ success: true, data: job });
});

// @desc    Delete a job posting
// @route   DELETE /api/careers/:id
// @access  Private (admin)
const deleteCareer = asyncHandler(async (req, res) => {
  const job = await Career.findByIdAndDelete(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job posting not found");
  }
  res.json({ success: true, message: "Job posting deleted" });
});

// ---------------------------------------------------------------------------
// Admin: applications
// ---------------------------------------------------------------------------

// @desc    List applications, optionally filtered by ?job= or ?status=
// @route   GET /api/careers/admin/applications
// @access  Private (admin/employee)
const getApplications = asyncHandler(async (req, res) => {
  const { job, status } = req.query;
  const filter = {};
  if (job) filter.job = job;
  if (status) filter.status = status;

  const applications = await CareerApplication.find(filter).sort({ createdAt: -1 }).populate("job", "title department");
  res.json({ success: true, count: applications.length, data: applications });
});

// @desc    Move an application through the hiring pipeline
// @route   PUT /api/careers/admin/applications/:id
// @access  Private (admin/employee)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await CareerApplication.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  ).populate("job", "title department");
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }
  res.json({ success: true, data: application });
});

module.exports = {
  getCareers,
  getCareerById,
  applyToCareer,
  getAllCareers,
  createCareer,
  updateCareer,
  deleteCareer,
  getApplications,
  updateApplicationStatus,
};
