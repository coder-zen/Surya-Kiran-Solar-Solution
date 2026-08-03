import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaStar } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { PROJECT_CATEGORIES, MAHARASHTRA_DISTRICTS } from "../../config/constants";

const fetchProjects = async () => (await api.get("/projects")).data.data;

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  // Override the instance's default JSON content-type so the browser sets the
  // multipart boundary itself — see backend/routes/uploadRoutes.js.
  const { data } = await api.post("/upload", formData, { headers: { "Content-Type": undefined } });
  return data.url;
};

/**
 * Admin CRUD screen for the Project portfolio. New projects go through the
 * existing /api/projects endpoint (see backend/controllers/projectController.js)
 * — the public Projects page, homepage Featured Projects, and homepage
 * project map all read from the same collection, so a project saved here
 * appears everywhere on next fetch. No separate publish step or deploy.
 */
const AdminProjects = () => {
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { category: "", district: "", isFeatured: false },
  });

  const { data: projects, isLoading } = useQuery({ queryKey: ["admin-projects-list"], queryFn: fetchProjects });

  const invalidateEverywhere = () => {
    // Every place on the site that reads Project data — see queryKeys in
    // Projects.jsx, FeaturedProjects.jsx, ProjectMap.jsx, AdminDashboard.jsx,
    // and AdminTestimonials.jsx's "Link to Project" dropdown.
    ["admin-projects-list", "projects", "featured-projects", "projects-map", "admin-projects", "admin-projects-dropdown"]
      .forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/projects", payload),
    onSuccess: () => {
      invalidateEverywhere();
      toast.success("Project added");
      reset();
      setImageFile(null);
      setShowForm(false);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not add project"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      invalidateEverywhere();
      toast.success("Project deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete project"),
  });

  const onSubmit = async (formData) => {
    try {
      let coverImage;
      if (imageFile) {
        coverImage = await uploadImage(imageFile);
      }
      const payload = {
        ...formData,
        capacityKW: Number(formData.capacityKW),
        ...(coverImage && { coverImage }),
      };
      createMutation.mutate(payload);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-2xl text-navy">Projects</h1>
          <button onClick={() => setShowForm((prev) => !prev)} className="btn-primary !py-2.5 !px-5 text-sm">
            <FaPlus /> {showForm ? "Cancel" : "Add Project"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-4">
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
              <label className="section-label">Customer Name (optional)</label>
              <input {...register("customerName")} className="input-field mt-1" placeholder="Shown only with customer consent" />
            </div>
            <div>
              <label className="section-label">Installation Date (optional)</label>
              <input type="date" {...register("installationDate")} className="input-field mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="section-label">Description (optional)</label>
              <textarea {...register("description")} rows={3} className="input-field mt-1" placeholder="Brief summary of the installation..." />
            </div>
            <div className="sm:col-span-2">
              <label className="section-label">Completed Project Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="input-field mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Uploaded to Cloudinary on save — requires CLOUDINARY_* set in backend/.env.</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy sm:col-span-2">
              <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 accent-solar-orange" />
              Feature on homepage
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Saving..." : "Save Project"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading && <p className="p-6 text-gray-400 text-sm">Loading projects…</p>}
          {!isLoading && projects?.length === 0 && (
            <p className="p-6 text-gray-400 text-sm">No projects yet — add the first completed installation above.</p>
          )}
          {projects?.map((p) => (
            <div key={p._id} className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={p.coverImage || "/assets/images/projects/placeholder.jpg"}
                  alt={p.title}
                  className="h-14 w-14 rounded-lg object-cover bg-gray-100 shrink-0"
                  onError={(e) => (e.target.style.visibility = "hidden")}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-navy flex items-center gap-1.5 truncate">
                    {p.title} {p.isFeatured && <FaStar className="text-solar-yellow text-xs shrink-0" title="Featured on homepage" />}
                  </p>
                  <p className="text-xs text-gray-400">{p.category} · {p.district} · {p.capacityKW}kW</p>
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(p._id)}
                aria-label="Delete project"
                className="text-gray-400 hover:text-red-500 shrink-0"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminProjects;
