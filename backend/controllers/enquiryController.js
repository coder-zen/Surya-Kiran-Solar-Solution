const asyncHandler = require("express-async-handler");
const Enquiry = require("../models/Enquiry");
const { TERMINAL_STAGES, NEXT_STAGE, normalizeStage } = require("../models/Enquiry");
const Project = require("../models/Project");
const { pointForDistrict } = require("../config/districts");
const { notifyNewLead } = require("../utils/leadNotification");

// @desc    Create a new lead (used by every CTA/form on the public site)
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);

  // Best-effort, non-blocking — the lead is already saved above regardless of
  // whether this succeeds, fails, or SMTP isn't configured at all.
  notifyNewLead(enquiry);

  res.status(201).json({ success: true, data: enquiry, message: "Thank you! Our team will contact you shortly." });
});

// @desc    List leads (admin CRM view, filterable by status/source)
// @route   GET /api/enquiries
// @access  Private (admin/employee)
const getEnquiries = asyncHandler(async (req, res) => {
  const { status, source } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;

  const enquiries = await Enquiry.find(filter)
    .sort({ createdAt: -1 })
    .populate("assignedTo", "name email")
    .populate("convertedProjectId", "title slug status district capacityKW category");

  // Legacy pre-pipeline values ("New", "Contacted"…) are mapped to their
  // pipeline equivalent here so the admin UI only ever deals with the 6 real
  // stages — see LEGACY_STAGE_MAP in models/Enquiry.js.
  const data = enquiries.map((e) => ({
    ...e.toObject(),
    status: normalizeStage(e.status),
  }));

  res.json({ success: true, count: data.length, data });
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }
  res.json({ success: true, data: enquiry });
});

// @desc    Move a lead to the next pipeline stage
// @route   PUT /api/enquiries/:id/advance
// @access  Private (admin/employee)
// @body    Only when advancing Pending -> Converted: { title, capacityKW, category, district }
const advanceEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  const current = normalizeStage(enquiry.status);
  if (TERMINAL_STAGES.includes(current)) {
    res.status(400);
    throw new Error(`This lead is already "${current}" and cannot be advanced further.`);
  }

  const next = NEXT_STAGE[current];

  // Pending -> Converted creates the real Project record and links it both ways.
  if (next === "Converted") {
    const { title, capacityKW, category, district } = req.body;
    if (!title || !capacityKW || !category || !district) {
      res.status(400);
      throw new Error("Converting a lead requires a project title, capacity (kW), category and district.");
    }

    const project = await Project.create({
      title,
      capacityKW: Number(capacityKW),
      category,
      district,
      customerName: enquiry.name,
      description: enquiry.message,
      location: pointForDistrict(district),
      status: "In Progress",
    });

    enquiry.convertedProjectId = project._id;
  }

  // Completing the lead completes the linked project in the same action, so
  // delivery status never has to be updated in two places.
  if (next === "Completed" && enquiry.convertedProjectId) {
    await Project.findByIdAndUpdate(enquiry.convertedProjectId, {
      status: "Completed",
      ...(req.body?.installationDate && { installationDate: req.body.installationDate }),
    });
  }

  enquiry.status = next;
  await enquiry.save();

  const populated = await Enquiry.findById(enquiry._id)
    .populate("assignedTo", "name email")
    .populate("convertedProjectId", "title slug status district capacityKW category");

  res.json({ success: true, data: populated, message: `Lead moved to "${next}".` });
});

// @desc    Reject/lose a lead from any non-terminal stage
// @route   PUT /api/enquiries/:id/reject
// @access  Private (admin/employee)
const rejectEnquiry = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    res.status(400);
    throw new Error("A short reason is required when rejecting a lead.");
  }

  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  const current = normalizeStage(enquiry.status);
  if (TERMINAL_STAGES.includes(current)) {
    res.status(400);
    throw new Error(`This lead is already "${current}".`);
  }

  // The linked project (if any) is left in place rather than deleted — a lost
  // deal shouldn't silently erase work already recorded against it. It's put
  // On Hold so it stops reading as active delivery.
  if (enquiry.convertedProjectId) {
    await Project.findByIdAndUpdate(enquiry.convertedProjectId, { status: "On Hold" });
  }

  enquiry.status = "Rejected";
  enquiry.rejectionReason = reason.trim();
  enquiry.rejectedAt = new Date();
  await enquiry.save();

  res.json({ success: true, data: enquiry, message: "Lead marked as Rejected/Lost." });
});

module.exports = { createEnquiry, getEnquiries, updateEnquiry, advanceEnquiry, rejectEnquiry };
