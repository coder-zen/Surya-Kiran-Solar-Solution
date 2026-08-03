import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaPen, FaTimes, FaEyeSlash } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import RichTextEditor from "../../components/admin/RichTextEditor";
import { SERVICE_ICONS, SERVICE_ICON_KEYS, getServiceIcon } from "../../config/serviceIcons";

// /services/all (not /services) so unpublished drafts are visible in the editor.
const fetchServices = async () => (await api.get("/services/all")).data.data;

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/upload", formData, { headers: { "Content-Type": undefined } });
  return data.url;
};

const EMPTY_SERVICE = {
  title: "",
  icon: "solar-panel",
  shortDescription: "",
  fullDescription: "",
  benefits: [],
  process: [],
  faqs: [],
  images: [],
  order: 0,
  isPublished: true,
};

/** Small add/remove list used for benefits, process steps and FAQs. */
const RepeatableSection = ({ label, fields, onAdd, onRemove, addLabel, children }) => (
  <div className="sm:col-span-2">
    <div className="flex justify-between items-center">
      <label className="section-label">{label}</label>
      <button type="button" onClick={onAdd} className="text-sm text-solar-orange font-semibold">
        + {addLabel}
      </button>
    </div>
    {fields.length === 0 && <p className="text-xs text-gray-400 mt-1">None yet.</p>}
    <div className="space-y-3 mt-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-start">
          <div className="flex-1 grid gap-2">{children(index)}</div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${label} item`}
            className="text-gray-300 hover:text-red-500 mt-3 shrink-0"
          >
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ServiceForm = ({ initial, onCancel, onSaved }) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = Boolean(initial?._id);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      ...EMPTY_SERVICE,
      ...initial,
      // Service.benefits is [String], but useFieldArray needs objects to track rows.
      benefits: (initial?.benefits || []).map((value) => ({ value })),
    },
  });

  const benefits = useFieldArray({ control, name: "benefits" });
  const process = useFieldArray({ control, name: "process" });
  const faqs = useFieldArray({ control, name: "faqs" });

  const images = watch("images") || [];
  const selectedIcon = watch("icon");
  const IconPreview = SERVICE_ICONS[selectedIcon] || SERVICE_ICONS["solar-panel"];

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? api.put(`/services/${initial._id}`, payload) : api.post("/services", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] }); // public grid + Services page
      toast.success(isEdit ? "Service updated" : "Service created");
      onSaved();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not save service"),
  });

  const onSubmit = (formData) => {
    saveMutation.mutate({
      ...formData,
      order: Number(formData.order) || 0,
      // react-hook-form keeps empty rows as {} — strip anything the user left blank.
      benefits: (formData.benefits || []).map((b) => (typeof b === "string" ? b : b.value)).filter(Boolean),
      process: (formData.process || [])
        .filter((p) => p.title?.trim())
        .map((p, i) => ({ ...p, step: i + 1 })),
      faqs: (formData.faqs || []).filter((f) => f.question?.trim()),
    });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setValue("images", [...images, url]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2 flex justify-between items-center">
        <h2 className="font-display font-semibold text-navy">{isEdit ? `Edit — ${initial.title}` : "New Service"}</h2>
        <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-navy">
          <FaTimes />
        </button>
      </div>

      <div>
        <label className="section-label">Title</label>
        <input {...register("title", { required: "Required" })} className="input-field mt-1" />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="section-label">Icon</label>
        <div className="flex items-center gap-3 mt-1">
          <span className="h-11 w-11 shrink-0 rounded-lg bg-solar-orange/10 text-solar-orange grid place-items-center text-xl">
            <IconPreview />
          </span>
          <select {...register("icon")} className="input-field">
            {SERVICE_ICON_KEYS.map((key) => <option key={key} value={key}>{key}</option>)}
          </select>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Short Description (card blurb)</label>
        <input {...register("shortDescription", { required: "Required" })} className="input-field mt-1" />
        {errors.shortDescription && <p className="text-sm text-red-500 mt-1">{errors.shortDescription.message}</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Full Description (service detail page)</label>
        <Controller
          name="fullDescription"
          control={control}
          render={({ field }) => (
            <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Full write-up for this service…" />
          )}
        />
      </div>

      <RepeatableSection
        label="Benefits" addLabel="Add benefit" fields={benefits.fields}
        onAdd={() => benefits.append({ value: "" })} onRemove={benefits.remove}
      >
        {(i) => <input {...register(`benefits.${i}.value`)} className="input-field" placeholder="e.g. Cuts bills by up to 90%" />}
      </RepeatableSection>

      <RepeatableSection
        label="Process Steps" addLabel="Add step" fields={process.fields}
        onAdd={() => process.append({ title: "", description: "" })} onRemove={process.remove}
      >
        {(i) => (
          <>
            <input {...register(`process.${i}.title`)} className="input-field" placeholder={`Step ${i + 1} title`} />
            <input {...register(`process.${i}.description`)} className="input-field" placeholder="Step description" />
          </>
        )}
      </RepeatableSection>

      <RepeatableSection
        label="FAQs" addLabel="Add FAQ" fields={faqs.fields}
        onAdd={() => faqs.append({ question: "", answer: "" })} onRemove={faqs.remove}
      >
        {(i) => (
          <>
            <input {...register(`faqs.${i}.question`)} className="input-field" placeholder="Question" />
            <textarea {...register(`faqs.${i}.answer`)} rows={2} className="input-field" placeholder="Answer" />
          </>
        )}
      </RepeatableSection>

      <div className="sm:col-span-2">
        <label className="section-label">Images</label>
        <div className="flex flex-wrap gap-3 mt-2">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setValue("images", images.filter((u) => u !== url))}
                className="absolute top-0.5 right-0.5 bg-navy-dark/70 text-white rounded-full p-1 text-[10px]"
                aria-label="Remove image"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => { handleImageUpload(e.target.files?.[0]); e.target.value = ""; }}
          className="input-field mt-2"
        />
        {uploading && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
      </div>

      <div>
        <label className="section-label">Display Order</label>
        <input type="number" {...register("order")} className="input-field mt-1" />
        <p className="text-xs text-gray-400 mt-1">Lower numbers appear first on the public grid.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy self-end pb-3">
        <input type="checkbox" {...register("isPublished")} className="h-4 w-4 accent-solar-orange" />
        Published (visible on the site)
      </label>

      <div className="sm:col-span-2 flex gap-3">
        <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="btn-primary">
          {saveMutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Service"}
        </button>
        <button type="button" onClick={onCancel} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
      </div>
    </form>
  );
};

/**
 * Admin CRUD for Services. The public Services grid and detail pages read from
 * the same collection via GET /api/services, so changes here are live on the
 * site immediately — no publish step beyond the isPublished toggle.
 */
const AdminServices = () => {
  const [editing, setEditing] = useState(null); // null | {} for new | service doc
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({ queryKey: ["admin-services"], queryFn: fetchServices });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete service"),
  });

  const confirmDelete = (service) => {
    if (window.confirm(`Delete "${service.title}"? This removes it from the public site and cannot be undone.`)) {
      deleteMutation.mutate(service._id);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-navy">Services</h1>
            <p className="text-sm text-gray-500 mt-0.5">{services?.length ?? "—"} services shown on the public site.</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing({})} className="btn-primary !py-2.5 !px-5 text-sm">
              <FaPlus /> Add Service
            </button>
          )}
        </div>

        {editing && (
          <ServiceForm
            initial={editing._id ? editing : null}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading && <p className="p-6 text-gray-400 text-sm">Loading services…</p>}
          {!isLoading && services?.length === 0 && (
            <p className="p-6 text-gray-400 text-sm">No services yet — add the first one above.</p>
          )}
          {services?.map((service) => {
            const Icon = getServiceIcon(service);
            return (
              <div key={service._id} className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="h-11 w-11 shrink-0 rounded-lg bg-solar-orange/10 text-solar-orange grid place-items-center text-lg">
                    <Icon />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy flex items-center gap-2">
                      <span className="truncate">{service.title}</span>
                      {!service.isPublished && (
                        <span className="text-xs font-normal text-gray-400 flex items-center gap-1 shrink-0">
                          <FaEyeSlash /> Hidden
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">#{service.order} · {service.shortDescription}</p>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => setEditing(service)} aria-label="Edit service" className="text-gray-400 hover:text-solar-orange">
                    <FaPen />
                  </button>
                  <button onClick={() => confirmDelete(service)} aria-label="Delete service" className="text-gray-400 hover:text-red-500">
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminServices;
