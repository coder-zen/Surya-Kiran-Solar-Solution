import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlus } from "react-icons/fa";
import api from "../../config/api";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import AdminSidebar from "../../components/admin/AdminSidebar";

const GALLERY_CATEGORIES = ["Installation", "Team", "Events", "Projects", "Office"];

const fetchGalleryImages = async () => (await api.get("/gallery")).data.data;

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  // Override the instance's default JSON content-type so the browser sets the
  // multipart boundary itself — see backend/routes/uploadRoutes.js.
  const { data } = await api.post("/upload", formData, { headers: { "Content-Type": undefined } });
  return data.url;
};

/**
 * Admin CRUD screen for Gallery images. Saving here writes straight to the
 * same Gallery collection the public /gallery page reads (see
 * backend/controllers/galleryController.js) — no separate publish step.
 * The public page currently shows placeholder images whenever this
 * collection is empty (see Gallery.jsx's Assets.galleryPlaceholders
 * fallback); the first image saved here replaces that fallback everywhere.
 */
const AdminGallery = () => {
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { category: "Installation" },
  });

  const { data: images, isLoading } = useQuery({ queryKey: ["admin-gallery-list"], queryFn: fetchGalleryImages });

  const invalidateEverywhere = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-gallery-list"] });
    queryClient.invalidateQueries({ queryKey: ["gallery"] }); // public /gallery page
  };

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/gallery", payload),
    onSuccess: () => {
      invalidateEverywhere();
      toast.success("Image added");
      reset();
      setImageFile(null);
      setShowForm(false);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not add image"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/gallery/${id}`),
    onSuccess: () => {
      invalidateEverywhere();
      toast.success("Image deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete image"),
  });

  const onSubmit = async (formData) => {
    if (!imageFile) {
      toast.error("Choose an image file first");
      return;
    }
    try {
      const image = await uploadImage(imageFile);
      createMutation.mutate({ ...formData, image });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-2xl text-navy">Gallery</h1>
          <button onClick={() => setShowForm((prev) => !prev)} className="btn-primary !py-2.5 !px-5 text-sm">
            <FaPlus /> {showForm ? "Cancel" : "Add Image"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="section-label">Title (optional)</label>
              <input {...register("title")} className="input-field mt-1" placeholder="e.g. Rooftop install — Kharadi" />
            </div>
            <div>
              <label className="section-label">Category</label>
              <select {...register("category", { required: "Required" })} className="input-field mt-1">
                {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="section-label">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="input-field mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Uploaded to Cloudinary on save.</p>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Saving..." : "Save Image"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {isLoading && <p className="text-gray-400 text-sm">Loading gallery…</p>}
          {!isLoading && images?.length === 0 && (
            <p className="text-gray-400 text-sm">
              No images yet — the public Gallery page is showing placeholder photos until the first
              one is added here.
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images?.map((img) => (
              <div key={img._id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
                <img src={cdnImage(img.image, IMG.thumb)} alt={img.title || "Gallery image"} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-navy-dark/0 group-hover:bg-navy-dark/60 transition-colors flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                  <span className="text-xs text-white bg-navy-dark/70 rounded px-2 py-0.5 self-start">{img.category}</span>
                  <button
                    onClick={() => deleteMutation.mutate(img._id)}
                    aria-label="Delete image"
                    className="self-end text-white hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminGallery;
