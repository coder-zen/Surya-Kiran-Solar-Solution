import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaArrowRight, FaTimes, FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { PROJECT_CATEGORIES, MAHARASHTRA_DISTRICTS } from "../../config/constants";

/** Mirrors LEAD_STAGES / ADVANCE_LABELS in backend/models/Enquiry.js. */
const STAGES = ["Enquiry Received", "Pending", "Converted", "Project In Progress", "Completed", "Rejected"];
const TERMINAL_STAGES = ["Completed", "Rejected"];
const ADVANCE_LABELS = {
  "Enquiry Received": "Start Working",
  Pending: "Convert to Project",
  Converted: "Mark Project In Progress",
  "Project In Progress": "Mark Completed",
};
const STAGE_STYLES = {
  "Enquiry Received": "bg-blue-50 text-blue-700",
  Pending: "bg-amber-50 text-amber-700",
  Converted: "bg-violet-50 text-violet-700",
  "Project In Progress": "bg-orange-50 text-orange-700",
  Completed: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

const SOURCE_LABELS = {
  hero_cta: "Hero CTA",
  contact_form: "Contact Form",
  exit_intent: "Exit Popup",
  whatsapp_widget: "WhatsApp Widget",
  service_page: "Service Page",
  calculator: "Calculator",
  career: "Careers",
  amc: "AMC Page",
  other: "Other",
};

const fetchLeads = async () => (await api.get("/enquiries")).data.data;
const waLink = (phone) => `https://wa.me/${String(phone || "").replace(/[^\d]/g, "").replace(/^(\d{10})$/, "91$1")}`;

/** Shown when advancing Pending -> Converted, which creates the real Project record. */
const ConvertModal = ({ lead, onClose, onConfirm, isSaving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: `${lead.propertyType || "Solar"} Installation — ${lead.name}`,
      category: PROJECT_CATEGORIES.includes(lead.propertyType) ? lead.propertyType : "",
      district: MAHARASHTRA_DISTRICTS.includes(lead.city) ? lead.city : "",
    },
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-dark/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-premium" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-xl text-navy mb-1">Convert to Project</h3>
        <p className="text-sm text-gray-500 mb-6">
          Creates a linked project record for {lead.name}. Prefilled from the enquiry where possible.
        </p>
        <form onSubmit={handleSubmit(onConfirm)} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="section-label">Project Title</label>
            <input {...register("title", { required: "Required" })} className="input-field mt-1" />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="section-label">Capacity (kW)</label>
            <input type="number" step="0.1" {...register("capacityKW", { required: "Required", min: 0.1 })} className="input-field mt-1" />
            {errors.capacityKW && <p className="text-sm text-red-500 mt-1">{errors.capacityKW.message}</p>}
          </div>
          <div>
            <label className="section-label">Category</label>
            <select {...register("category", { required: "Required" })} className="input-field mt-1">
              <option value="">— Select —</option>
              {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="section-label">District</label>
            <select {...register("district", { required: "Required" })} className="input-field mt-1">
              <option value="">— Select —</option>
              {MAHARASHTRA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>}
            {lead.city && !MAHARASHTRA_DISTRICTS.includes(lead.city) && (
              <p className="text-xs text-gray-400 mt-1">Customer wrote "{lead.city}" — pick the closest district.</p>
            )}
          </div>
          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button type="submit" disabled={isSaving} className="btn-primary flex-1">
              {isSaving ? "Converting..." : "Create Project & Convert"}
            </button>
            <button type="button" onClick={onClose} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RejectModal = ({ lead, onClose, onConfirm, isSaving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-dark/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-premium" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-xl text-navy mb-1">Reject Lead</h3>
        <p className="text-sm text-gray-500 mb-6">Marking {lead.name} as Rejected/Lost. This is final.</p>
        <form onSubmit={handleSubmit(onConfirm)}>
          <label className="section-label">Reason</label>
          <textarea
            {...register("reason", { required: "A short reason is required" })}
            rows={3}
            className="input-field mt-1"
            placeholder="e.g. Budget too low, went with competitor, not reachable…"
          />
          {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>}
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={isSaving} className="btn-primary flex-1 !bg-none !bg-red-500 !text-white">
              {isSaving ? "Saving..." : "Confirm Reject"}
            </button>
            <button type="button" onClick={onClose} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Deleting is for rows that were never real leads — test submissions and form
 * spam. Requires typing the lead's name rather than a single "are you sure",
 * because the button sits on a list of otherwise-identical cards and there is
 * no undo: a mis-click on the neighbouring row would destroy a real customer's
 * details with no way back. Typing forces the eye onto the row being removed.
 */
const DeleteModal = ({ lead, onClose, onConfirm, isSaving }) => {
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === (lead.name || "").trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-dark/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-premium" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-xl text-navy mb-1">Delete Lead</h3>
        <p className="text-sm text-gray-500 mb-4">
          This permanently removes <strong className="text-navy">{lead.name}</strong> and their contact
          details. It cannot be undone.
        </p>
        <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5">
          Only for test entries and spam. If this was a genuine lead you didn't win,
          use <strong>Reject</strong> instead — that keeps the record.
        </p>

        <label className="section-label">
          Type <span className="text-navy font-semibold">{lead.name}</span> to confirm
        </label>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="input-field mt-1"
          placeholder={lead.name}
          autoFocus
        />

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            disabled={!matches || isSaving}
            onClick={() => onConfirm(lead)}
            className="btn-primary flex-1 !bg-none !bg-red-500 !text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? "Deleting..." : "Delete Permanently"}
          </button>
          <button type="button" onClick={onClose} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
        </div>
      </div>
    </div>
  );
};

/**
 * Leads / Enquiries pipeline. Every lead from the public site lands here at
 * "Enquiry Received" and is advanced manually through the stages defined in
 * backend/models/Enquiry.js. The next stage is computed server-side from the
 * current one, so this page only ever says "advance" — it can't skip stages.
 */
const AdminLeads = () => {
  const [filter, setFilter] = useState("All");
  const [convertTarget, setConvertTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({ queryKey: ["admin-leads"], queryFn: fetchLeads });

  const invalidate = () => {
    ["admin-leads", "admin-projects-list", "projects", "featured-projects", "projects-map", "admin-projects"]
      .forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const advanceMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/enquiries/${id}/advance`, body || {}),
    onSuccess: ({ data }) => {
      invalidate();
      toast.success(data.message);
      setConvertTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not advance lead"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.put(`/enquiries/${id}/reject`, { reason }),
    onSuccess: ({ data }) => {
      invalidate();
      toast.success(data.message);
      setRejectTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not reject lead"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/enquiries/${id}`),
    onSuccess: ({ data }) => {
      invalidate();
      toast.success(data.message);
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete lead"),
  });

  const handleAdvance = (lead) => {
    // Pending -> Converted needs project details, so it opens a modal first.
    if (lead.status === "Pending") return setConvertTarget(lead);
    advanceMutation.mutate({ id: lead._id });
  };

  const counts = STAGES.reduce((acc, s) => ({ ...acc, [s]: leads?.filter((l) => l.status === s).length || 0 }), {});
  const visible = filter === "All" ? leads : leads?.filter((l) => l.status === filter);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="font-display font-bold text-2xl text-navy mb-1">Leads / Enquiries</h1>
        <p className="text-sm text-gray-500 mb-6">{leads?.length ?? "—"} total leads from every form on the site.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "All" ? "bg-navy text-white" : "bg-white text-gray-600 shadow-sm"}`}
          >
            All ({leads?.length ?? 0})
          </button>
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === s ? "bg-navy text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading && <p className="text-gray-400 text-sm">Loading leads…</p>}
          {!isLoading && visible?.length === 0 && (
            <p className="text-gray-400 text-sm bg-white rounded-2xl p-6 shadow-sm">No leads in this stage.</p>
          )}

          {visible?.map((lead) => {
            const isTerminal = TERMINAL_STAGES.includes(lead.status);
            const project = lead.convertedProjectId;

            return (
              <div key={lead._id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display font-semibold text-navy">{lead.name}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STAGE_STYLES[lead.status] || "bg-gray-100 text-gray-600"}`}>
                        {lead.status}
                      </span>
                      <span className="text-xs text-gray-400">via {SOURCE_LABELS[lead.source] || lead.source}</span>
                      <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-navy font-medium">
                        <FaPhoneAlt className="text-solar-orange text-xs" /> {lead.phone}
                      </a>
                      <a href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-navy font-medium">
                        <FaWhatsapp className="text-[#25D366]" /> WhatsApp
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-navy font-medium min-w-0">
                          <FaEnvelope className="text-solar-orange text-xs shrink-0" /> <span className="truncate">{lead.email}</span>
                        </a>
                      )}
                      {lead.city && <span className="text-gray-500">{lead.city}</span>}
                      {lead.propertyType && <span className="text-gray-500">{lead.propertyType}</span>}
                    </div>

                    {lead.message && <p className="text-sm text-gray-600 mt-3">{lead.message}</p>}

                    {project && (
                      <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                        <FaExternalLinkAlt className="text-gray-300" />
                        Linked project: <span className="font-semibold text-navy">{project.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100">{project.capacityKW}kW · {project.district}</span>
                        {/* Live status read straight off the Project — not duplicated on the lead. */}
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold">
                          Project: {project.status}
                        </span>
                      </p>
                    )}

                    {lead.status === "Rejected" && lead.rejectionReason && (
                      <p className="text-xs text-red-600 mt-3">Rejected: {lead.rejectionReason}</p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0 items-center">
                    {!isTerminal && (
                      <>
                        <button
                          onClick={() => handleAdvance(lead)}
                          disabled={advanceMutation.isPending}
                          className="btn-primary !py-2 !px-4 text-sm whitespace-nowrap"
                        >
                          {ADVANCE_LABELS[lead.status]} <FaArrowRight className="text-xs" />
                        </button>
                        <button
                          onClick={() => setRejectTarget(lead)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 whitespace-nowrap"
                        >
                          <FaTimes className="text-xs" /> Reject
                        </button>
                      </>
                    )}
                    {/* Outside the isTerminal guard: spam and test rows land in
                        every stage, including Completed and Rejected, and those
                        are exactly the ones skewing the dashboard counts. */}
                    <button
                      onClick={() => setDeleteTarget(lead)}
                      aria-label={`Delete lead ${lead.name}`}
                      title="Delete this lead permanently"
                      className="p-2 text-gray-300 hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {convertTarget && (
        <ConvertModal
          lead={convertTarget}
          isSaving={advanceMutation.isPending}
          onClose={() => setConvertTarget(null)}
          onConfirm={(form) => advanceMutation.mutate({ id: convertTarget._id, body: form })}
        />
      )}
      {rejectTarget && (
        <RejectModal
          lead={rejectTarget}
          isSaving={rejectMutation.isPending}
          onClose={() => setRejectTarget(null)}
          onConfirm={({ reason }) => rejectMutation.mutate({ id: rejectTarget._id, reason })}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          lead={deleteTarget}
          isSaving={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={(lead) => deleteMutation.mutate(lead._id)}
        />
      )}
    </div>
  );
};

export default AdminLeads;
