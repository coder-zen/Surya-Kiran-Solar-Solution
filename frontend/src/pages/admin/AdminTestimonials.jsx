import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaStar, FaTrash, FaCheckCircle, FaPlus } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { MAHARASHTRA_DISTRICTS } from "../../config/constants";

const fetchTestimonials = async () => (await api.get("/testimonials")).data.data;
const fetchProjects = async () => (await api.get("/projects")).data.data;

/**
 * Admin CRUD screen for Testimonial documents. Creates/deletes go straight
 * through the existing /api/testimonials REST endpoints (see
 * backend/routes/testimonialRoutes.js) — the public Customer Stories section
 * on the homepage reads from the same collection, so a new testimonial saved
 * here appears there on next fetch, no publish step or deploy involved.
 */
const AdminTestimonials = () => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { rating: 5, isVerified: true, relatedProject: "", location: "" },
  });
  const relatedProjectField = register("relatedProject");

  const { data: testimonials, isLoading } = useQuery({ queryKey: ["admin-testimonials"], queryFn: fetchTestimonials });
  const { data: projects } = useQuery({ queryKey: ["admin-projects-dropdown"], queryFn: fetchProjects });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/testimonials", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] }); // public Customer Stories section
      toast.success("Testimonial added");
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not add testimonial"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete testimonial"),
  });

  const onSubmit = (formData) => {
    const payload = { ...formData, rating: Number(formData.rating) };
    if (!payload.relatedProject) delete payload.relatedProject;
    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-2xl text-navy">Testimonials</h1>
          <button onClick={() => setShowForm((prev) => !prev)} className="btn-primary !py-2.5 !px-5 text-sm">
            <FaPlus /> {showForm ? "Cancel" : "Add Testimonial"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="section-label">Customer Name</label>
              <input {...register("customerName", { required: "Required" })} className="input-field mt-1" />
              {errors.customerName && <p className="text-sm text-red-500 mt-1">{errors.customerName.message}</p>}
            </div>
            <div>
              <label className="section-label">Location (District)</label>
              <select {...register("location")} className="input-field mt-1">
                <option value="">— Select district —</option>
                {MAHARASHTRA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="section-label">Star Rating</label>
              <select {...register("rating")} className="input-field mt-1">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="section-label">Link to Project (optional)</label>
              <select
                {...relatedProjectField}
                className="input-field mt-1"
                onChange={(e) => {
                  relatedProjectField.onChange(e); // keep react-hook-form's own state update
                  const project = projects?.find((p) => p._id === e.target.value);
                  if (project) setValue("location", project.district);
                }}
              >
                <option value="">— None —</option>
                {projects?.map((p) => (
                  <option key={p._id} value={p._id}>{p.title} ({p.district})</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Picking a project auto-fills Location with its district — you can still change it manually after.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="section-label">Message</label>
              <textarea
                {...register("message", { required: "Required" })}
                rows={3}
                className="input-field mt-1"
                placeholder="What the customer said about the installation..."
              />
              {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-navy sm:col-span-2">
              <input type="checkbox" {...register("isVerified")} className="h-4 w-4 accent-solar-orange" />
              Mark as verified customer
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Saving..." : "Save Testimonial"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading && <p className="p-6 text-gray-400 text-sm">Loading testimonials…</p>}
          {!isLoading && testimonials?.length === 0 && (
            <p className="p-6 text-gray-400 text-sm">
              No testimonials yet — the public Customer Stories section is showing fallback sample
              content until the first one is added here.
            </p>
          )}
          {testimonials?.map((t) => (
            <div key={t._id} className="flex items-start justify-between gap-4 p-5 border-b border-gray-100 last:border-0">
              <div className="min-w-0">
                <p className="font-semibold text-navy flex items-center gap-1.5">
                  {t.customerName} {t.isVerified && <FaCheckCircle className="text-blue-500 text-xs shrink-0" />}
                  <span className="text-xs text-gray-400 font-normal">{t.location}</span>
                </p>
                <div className="flex gap-0.5 mt-1 text-solar-yellow text-xs">
                  {Array.from({ length: t.rating }).map((_, i) => <FaStar key={i} />)}
                </div>
                <p className="text-sm text-gray-600 mt-2">{t.message}</p>
                {t.relatedProject?.title && (
                  <p className="text-xs text-gray-400 mt-1">Linked project: {t.relatedProject.title}</p>
                )}
              </div>
              <button
                onClick={() => deleteMutation.mutate(t._id)}
                aria-label="Delete testimonial"
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

export default AdminTestimonials;
