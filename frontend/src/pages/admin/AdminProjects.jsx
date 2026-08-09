import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaStar, FaPen, FaEyeSlash } from "react-icons/fa";
import api from "../../config/api";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { PROJECT_CATEGORIES, MAHARASHTRA_DISTRICTS } from "../../config/constants";

/** Mirrors the status enum on backend/models/Project.js. */
const PROJECT_STATUSES = ["In Progress", "Completed", "On Hold"];

/**
 * Admin list uses the same public GET /api/projects the website does, so what
 * an admin sees here is exactly what visitors see. Note this returns only
 * published projects — see the unpublish warning in the row actions below.
 */
const fetchProjects = async () => (await api.get("/projects")).data.data;

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  // Override the instance's default JSON content-type so the browser sets the
  // multipart boundary itself — see backend/routes/uploadRoutes.js.
  const { data } = await api.post("/upload", formData, { headers: { "Content-Type": undefined } });
  return data.url;
};

const EMPTY_PROJECT = {
  title: "",
  capacityKW: "",
  category: "",
  district: "",
  customerName: "",
  installationDate: "",
  description: "",
  status: "In Progress",
  isFeatured: false,
  isPublished: true,
  customerFeedback: { text: "", rating: 5 },
};

/** `<input type="date">` needs YYYY-MM-DD; Mongo returns a full ISO timestamp. */
const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

/**
 * Create *and* edit. Previously the admin could only add or delete a project —
 * there was no way to correct a typo, mark an installation complete, or even
 * review what had been saved, despite PUT /api/projects/:id already existing.
 * Fixing anything meant deleting and re-entering it, which also broke the
 * project's public URL.
 */
const ProjectForm = ({ initial, onCancel, onSaved }) => {
  const isEdit = Boolean(initial?._id);
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState(null);
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      ...EMPTY_PROJECT,
      ...initial,
      installationDate: toDateInput(initial?.installationDate),
      customerFeedback: { text: initial?.customerFeedback?.text || "", rating: initial?.customerFeedback?.rating || 5 },
      // Project.technologiesUsed is [String]; useFieldArray tracks objects.
      technologiesUsed: (initial?.technologiesUsed || []).map((value) => ({ value })),
    },
  });

  const technologies = useFieldArray({ control, name: "technologiesUsed" });

  const invalidateEverywhere = () => {
    // Every place on the site that reads Project data — see queryKeys in
    // Projects.jsx, FeaturedProjects.jsx, ProjectMap.jsx, AdminDashboard.jsx,
    // and AdminTestimonials.jsx's "Link to Project" dropdown.
    ["admin-projects-list", "projects", "featured-projects", "projects-map", "admin-projects", "admin-projects-dropdown"]
      .forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? api.put(`/projects/${initial._id}`, payload) : api.post("/projects", payload),
    onSuccess: () => {
      invalidateEverywhere();
      toast.success(isEdit ? "Project updated" : "Project added");
      onSaved();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not save project"),
  });

  const onSubmit = async (formData) => {
    try {
      // Only upload when a new file was picked; otherwise keep whatever the
      // project already had (or the empty string, if it was cleared).
      const finalCover = imageFile ? await uploadImage(imageFile) : coverImage;

      saveMutation.mutate({
        ...formData,
        capacityKW: Number(formData.capacityKW),
        coverImage: finalCover,
        installationDate: formData.installationDate || null,
        technologiesUsed: (formData.technologiesUsed || []).map((t) => t.value).filter(Boolean),
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2 flex justify-between items-center">
        <h2 className="font-display font-semibold text-navy">
          {isEdit ? `Edit — ${initial.title}` : "New Project"}
        </h2>
      </div>

      <div>
        <label className="section-label">Project Title</label>
        <input {...register("title", { required: "Required" })} className="input-field mt-1" placeholder="e.g. 15kW Rooftop — Kharadi Residence" />
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
          <option value="">— Select category —</option>
          {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
      </div>
      <div>
        <label className="section-label">District</label>
        <select {...register("district", { required: "Required" })} className="input-field mt-1">
          <option value="">— Select district —</option>
          {MAHARASHTRA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>}
        <p className="text-xs text-gray-400 mt-1">Places this project on the homepage map at the district center automatically.</p>
      </div>

      <div>
        <label className="section-label">Status</label>
        <select {...register("status")} className="input-field mt-1">
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-1">Marking a linked lead "Completed" also sets this.</p>
      </div>
      <div>
        <label className="section-label">Installation Date (optional)</label>
        <input type="date" {...register("installationDate")} className="input-field mt-1" />
      </div>

      <div>
        <label className="section-label">Customer Name (optional)</label>
        <input {...register("customerName")} className="input-field mt-1" placeholder="Shown only with customer consent" />
      </div>
      <div>
        <label className="section-label">Customer Rating (optional)</label>
        <select {...register("customerFeedback.rating")} className="input-field mt-1">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>)}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Description (optional)</label>
        <textarea {...register("description")} rows={3} className="input-field mt-1" placeholder="Brief summary of the installation..." />
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Customer Feedback (optional)</label>
        <textarea {...register("customerFeedback.text")} rows={2} className="input-field mt-1" placeholder="What the customer said about this installation..." />
      </div>

      <div className="sm:col-span-2">
        <div className="flex justify-between items-center">
          <label className="section-label">Technologies Used</label>
          <button type="button" onClick={() => technologies.append({ value: "" })} className="text-sm text-solar-orange font-semibold">
            + Add
          </button>
        </div>
        <div className="space-y-2 mt-2">
          {technologies.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`technologiesUsed.${i}.value`)} className="input-field flex-1" placeholder="e.g. Mono PERC Panels" />
              <button type="button" onClick={() => technologies.remove(i)} aria-label="Remove" className="text-gray-300 hover:text-red-500 shrink-0">
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Completed Project Image</label>
        <div className="flex items-start gap-4 mt-1">
          {coverImage && !imageFile && (
            <img src={cdnImage(coverImage, IMG.thumb)} alt="" className="h-20 w-28 rounded-lg object-cover bg-gray-100 shrink-0" />
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">
              {coverImage && !imageFile
                ? "Choose a file to replace the current photo, or leave empty to keep it."
                : "Uploaded to Cloudinary on save."}
            </p>
            {coverImage && !imageFile && (
              <button type="button" onClick={() => setCoverImage("")} className="text-xs text-red-500 mt-1">
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 accent-solar-orange" />
        Feature on homepage
      </label>
      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" {...register("isPublished")} className="h-4 w-4 accent-solar-orange" />
        Visible on the website
      </label>

      <div className="sm:col-span-2 flex gap-3">
        <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="btn-primary">
          {saveMutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Save Project"}
        </button>
        <button type="button" onClick={onCancel} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
      </div>
    </form>
  );
};

const AdminProjects = () => {
  // null = closed, {} = creating, {…project} = editing that project
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({ queryKey: ["admin-projects-list"], queryFn: fetchProjects });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      ["admin-projects-list", "projects", "featured-projects", "projects-map", "admin-projects", "admin-projects-dropdown"]
        .forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      toast.success("Project deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete project"),
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-2xl text-navy">Projects</h1>
          <button
            onClick={() => setEditing((prev) => (prev ? null : {}))}
            className="btn-primary !py-2.5 !px-5 text-sm"
          >
            <FaPlus /> {editing ? "Cancel" : "Add Project"}
          </button>
        </div>

        {editing && (
          <ProjectForm
            // Remount when switching between projects so the form re-seeds
            // its defaultValues instead of keeping the previous project's.
            key={editing._id || "new"}
            initial={editing._id ? editing : null}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading && <p className="p-6 text-gray-400 text-sm">Loading projects…</p>}
          {!isLoading && projects?.length === 0 && (
            <p className="p-6 text-gray-400 text-sm">No projects yet — add the first completed installation above.</p>
          )}
          {projects?.map((p) => (
            <div key={p._id} className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4 min-w-0">
                {p.coverImage ? (
                  <img
                    src={cdnImage(p.coverImage, IMG.thumb)}
                    alt={p.title}
                    className="h-14 w-14 rounded-lg object-cover bg-gray-100 shrink-0"
                    onError={(e) => (e.target.style.visibility = "hidden")}
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-navy-gradient shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-navy flex items-center gap-1.5 truncate">
                    {p.title}
                    {p.isFeatured && <FaStar className="text-solar-yellow text-xs shrink-0" title="Featured on homepage" />}
                    {p.isPublished === false && <FaEyeSlash className="text-gray-400 text-xs shrink-0" title="Hidden from the website" />}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.category} · {p.district} · {p.capacityKW}kW
                    {p.status ? ` · ${p.status}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setEditing(p)}
                  aria-label={`Edit ${p.title}`}
                  className="text-gray-400 hover:text-solar-orange"
                  title="Edit project"
                >
                  <FaPen />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(p._id)}
                  aria-label={`Delete ${p.title}`}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete project"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminProjects;
