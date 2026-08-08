import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaExternalLinkAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import api from "../../config/api";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import AdminSidebar from "../../components/admin/AdminSidebar";

const fetchSettings = async () => (await api.get("/settings")).data.data;

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/upload", formData, { headers: { "Content-Type": undefined } });
  return data.url;
};

/** Image field with upload + live thumbnail. */
const ImageField = ({ label, hint, value, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handle = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <label className="section-label">{label}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      <div className="flex items-start gap-4 mt-2">
        {value && <img src={cdnImage(value, IMG.thumb)} alt="" className="h-24 w-36 rounded-lg object-cover bg-gray-100 shrink-0" />}
        <div className="flex-1">
          <input
            type="file" accept="image/*" disabled={uploading}
            onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ""; }}
            className="input-field"
          />
          {uploading && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-red-500 mt-1">
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Edits the homepage hero and About section, which used to be hardcoded in
 * Hero.jsx and AboutSection.jsx. Content lives on the Settings singleton
 * (see backend/models/Settings.js) and those components now fetch it, so
 * saving here changes the live homepage with no deploy.
 */
const AdminHomepage = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchSettings });

  const { register, handleSubmit, control, watch, setValue, reset, formState: { isDirty } } = useForm({
    values: settings
      ? {
          ...settings.homepageContent,
          // [String] → objects, which useFieldArray needs to track rows.
          aboutBulletPoints: (settings.homepageContent?.aboutBulletPoints || []).map((value) => ({ value })),
        }
      : undefined,
  });

  const bullets = useFieldArray({ control, name: "aboutBulletPoints" });
  const heroFallback = watch("heroFallbackImageUrl");
  const aboutImage = watch("aboutImageUrl");

  const saveMutation = useMutation({
    mutationFn: (homepageContent) => api.put("/settings", { homepageContent }),
    onSuccess: ({ data: res }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] }); // public Hero + AboutSection
      toast.success(res.message || "Homepage updated");
      reset({
        ...res.data.homepageContent,
        aboutBulletPoints: (res.data.homepageContent?.aboutBulletPoints || []).map((value) => ({ value })),
      });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not save homepage content"),
  });

  const onSubmit = (formData) =>
    saveMutation.mutate({
      ...formData,
      aboutBulletPoints: (formData.aboutBulletPoints || []).map((b) => b.value).filter(Boolean),
    });

  const move = (from, to) => {
    if (to < 0 || to >= bullets.fields.length) return;
    bullets.move(from, to);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-navy">Homepage Content</h1>
            <p className="text-sm text-gray-500 mt-0.5">Hero banner and About section on the public homepage.</p>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-solar-orange font-semibold flex items-center gap-1.5">
            View on site <FaExternalLinkAlt className="text-xs" />
          </a>
        </div>

        {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

        {settings && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-28">
            {/* ---------------- Hero ---------------- */}
            <div className="bg-white rounded-2xl p-6 shadow-sm grid sm:grid-cols-2 gap-5">
              <h3 className="font-display font-semibold text-navy sm:col-span-2">Hero Banner</h3>

              <div className="sm:col-span-2">
                <label className="section-label">Background Video URL</label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Paste a direct .mp4 link (Cloudinary or any CDN). Videos are too large for the
                  image uploader, so they're linked rather than uploaded. Leave blank to show only
                  the fallback image.
                </p>
                <input {...register("heroVideoUrl")} className="input-field mt-2" placeholder="https://res.cloudinary.com/.../hero.mp4" />
              </div>

              <ImageField
                label="Hero Fallback Image"
                hint="Shown while the video loads, if it fails, and on devices that block autoplay."
                value={heroFallback}
                onChange={(url) => setValue("heroFallbackImageUrl", url, { shouldDirty: true })}
              />

              <div className="sm:col-span-2">
                <label className="section-label">Eyebrow (small text above headline)</label>
                <input {...register("heroEyebrow")} className="input-field mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="section-label">Headline</label>
                <input {...register("heroHeadline")} className="input-field mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="section-label">Subtext</label>
                <textarea {...register("heroSubtext")} rows={3} className="input-field mt-1" />
              </div>
            </div>

            {/* ---------------- About ---------------- */}
            <div className="bg-white rounded-2xl p-6 shadow-sm grid sm:grid-cols-2 gap-5">
              <h3 className="font-display font-semibold text-navy sm:col-span-2">About Section</h3>

              <ImageField
                label="About Photo"
                hint="Team or installation photograph shown beside the About text."
                value={aboutImage}
                onChange={(url) => setValue("aboutImageUrl", url, { shouldDirty: true })}
              />

              <div>
                <label className="section-label">Eyebrow</label>
                <input {...register("aboutEyebrow")} className="input-field mt-1" />
              </div>
              <div>
                <label className="section-label">Headline</label>
                <input {...register("aboutHeadline")} className="input-field mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="section-label">Body Text</label>
                <textarea {...register("aboutBodyText")} rows={5} className="input-field mt-1" />
              </div>

              <div>
                <label className="section-label">Badge Value</label>
                <input {...register("aboutStatValue")} className="input-field mt-1" placeholder="70+" />
              </div>
              <div>
                <label className="section-label">Badge Label</label>
                <input {...register("aboutStatLabel")} className="input-field mt-1" placeholder="Homes Solarized" />
              </div>
            </div>

            {/* ---------------- Bullets ---------------- */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-semibold text-navy">About Bullet Points</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Ticked list under the About text. Use the arrows to reorder.</p>
                </div>
                <button type="button" onClick={() => bullets.append({ value: "" })} className="text-sm text-solar-orange font-semibold shrink-0">
                  + Add point
                </button>
              </div>
              {bullets.fields.length === 0 && <p className="text-xs text-gray-400 mt-3">None yet.</p>}
              <div className="space-y-3 mt-4">
                {bullets.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="flex flex-col shrink-0">
                      <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Move up" className="text-gray-300 hover:text-navy disabled:opacity-30 text-xs">
                        <FaArrowUp />
                      </button>
                      <button type="button" onClick={() => move(index, index + 1)} disabled={index === bullets.fields.length - 1} aria-label="Move down" className="text-gray-300 hover:text-navy disabled:opacity-30 text-xs">
                        <FaArrowDown />
                      </button>
                    </div>
                    <input {...register(`aboutBulletPoints.${index}.value`)} className="input-field flex-1" placeholder="e.g. MNRE & IEC-certified installation standards" />
                    <button type="button" onClick={() => bullets.remove(index)} aria-label="Remove point" className="text-gray-300 hover:text-red-500 shrink-0">
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white/95 backdrop-blur border-t border-gray-200 px-8 py-4 flex items-center gap-4">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? "Saving..." : "Save Homepage"}
              </button>
              {isDirty && <span className="text-sm text-amber-600">Unsaved changes</span>}
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminHomepage;
