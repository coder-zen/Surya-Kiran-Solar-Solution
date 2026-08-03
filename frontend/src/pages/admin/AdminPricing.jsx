import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

const fetchPricing = async () => (await api.get("/pricing")).data.data;

/** Add/remove list used for each repeatable block on the pricing page. */
const Repeatable = ({ label, hint, fields, onAdd, onRemove, addLabel, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-display font-semibold text-navy">{label}</h3>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <button type="button" onClick={onAdd} className="text-sm text-solar-orange font-semibold shrink-0">
        + {addLabel}
      </button>
    </div>
    {fields.length === 0 && <p className="text-xs text-gray-400 mt-3">None yet.</p>}
    <div className="space-y-3 mt-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-start">
          <div className="flex-1 grid sm:grid-cols-2 gap-2">{children(index)}</div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label="Remove row"
            className="text-gray-300 hover:text-red-500 mt-3 shrink-0"
          >
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Edits the public /pricing page. It's a single document (see
 * backend/models/Pricing.js) rather than a list of packages, because the page
 * is one worked example of a real quotation — spec table, cost breakdown,
 * payment stages and terms — not a tier comparison.
 */
const AdminPricing = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-pricing"], queryFn: fetchPricing });

  const { register, handleSubmit, control, reset, formState: { isDirty } } = useForm({
    values: data
      ? {
          ...data,
          // terms is [String]; useFieldArray needs objects to track rows.
          terms: (data.terms || []).map((value) => ({ value })),
        }
      : undefined,
  });

  const specs = useFieldArray({ control, name: "specs" });
  const costBreakdown = useFieldArray({ control, name: "costBreakdown" });
  const paymentSchedule = useFieldArray({ control, name: "paymentSchedule" });
  const terms = useFieldArray({ control, name: "terms" });

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put("/pricing", payload),
    onSuccess: ({ data: res }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      queryClient.invalidateQueries({ queryKey: ["pricing"] }); // public /pricing page
      toast.success(res.message || "Pricing page updated");
      reset({ ...res.data, terms: (res.data.terms || []).map((value) => ({ value })) });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not save pricing"),
  });

  const onSubmit = (formData) =>
    saveMutation.mutate({
      ...formData,
      terms: (formData.terms || []).map((t) => t.value).filter(Boolean),
      specs: (formData.specs || []).filter((s) => s.label?.trim()),
      costBreakdown: (formData.costBreakdown || []).filter((c) => c.label?.trim()),
      paymentSchedule: (formData.paymentSchedule || []).filter((p) => p.stage?.trim()),
    });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-navy">Pricing Page</h1>
            <p className="text-sm text-gray-500 mt-0.5">Everything shown on the public /pricing page.</p>
          </div>
          <a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-sm text-solar-orange font-semibold flex items-center gap-1.5">
            View on site <FaExternalLinkAlt className="text-xs" />
          </a>
        </div>

        {isLoading && <p className="text-gray-400 text-sm">Loading pricing…</p>}

        {data && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
            <div className="bg-white rounded-2xl p-6 shadow-sm grid sm:grid-cols-2 gap-4">
              <h3 className="font-display font-semibold text-navy sm:col-span-2">Page Header</h3>
              <div>
                <label className="section-label">Eyebrow</label>
                <input {...register("eyebrow")} className="input-field mt-1" />
              </div>
              <div>
                <label className="section-label">Headline</label>
                <input {...register("headline")} className="input-field mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="section-label">Intro paragraph</label>
                <textarea {...register("intro")} rows={3} className="input-field mt-1" />
              </div>
            </div>

            <Repeatable
              label="Component Specifications" addLabel="Add row"
              hint="The technical spec table."
              fields={specs.fields} onAdd={() => specs.append({ label: "", value: "" })} onRemove={specs.remove}
            >
              {(i) => (
                <>
                  <input {...register(`specs.${i}.label`)} className="input-field" placeholder="Component" />
                  <input {...register(`specs.${i}.value`)} className="input-field" placeholder="Specification" />
                </>
              )}
            </Repeatable>

            <Repeatable
              label="Cost Breakdown" addLabel="Add row"
              fields={costBreakdown.fields} onAdd={() => costBreakdown.append({ label: "", value: "" })} onRemove={costBreakdown.remove}
            >
              {(i) => (
                <>
                  <input {...register(`costBreakdown.${i}.label`)} className="input-field" placeholder="Line item" />
                  <input {...register(`costBreakdown.${i}.value`)} className="input-field" placeholder="Amount" />
                </>
              )}
            </Repeatable>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-navy">Price Caveat</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Shown in the amber warning box. Keep pricing clearly indicative — the real cost depends
                on a site survey, so a fixed figure here can create disputes later.
              </p>
              <textarea {...register("priceNote")} rows={3} className="input-field mt-3" />
            </div>

            <Repeatable
              label="Payment Schedule" addLabel="Add stage"
              fields={paymentSchedule.fields} onAdd={() => paymentSchedule.append({ stage: "", pct: "" })} onRemove={paymentSchedule.remove}
            >
              {(i) => (
                <>
                  <input {...register(`paymentSchedule.${i}.stage`)} className="input-field" placeholder="Milestone" />
                  <input {...register(`paymentSchedule.${i}.pct`)} className="input-field" placeholder="e.g. 20%" />
                </>
              )}
            </Repeatable>

            <Repeatable
              label="Terms & Conditions" addLabel="Add term"
              fields={terms.fields} onAdd={() => terms.append({ value: "" })} onRemove={terms.remove}
            >
              {(i) => <textarea {...register(`terms.${i}.value`)} rows={2} className="input-field sm:col-span-2" placeholder="Term…" />}
            </Repeatable>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-navy">Closing Disclaimer</h3>
              <textarea {...register("disclaimer")} rows={3} className="input-field mt-3" />
            </div>

            <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white/95 backdrop-blur border-t border-gray-200 px-8 py-4 flex items-center gap-4">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? "Saving..." : "Save Pricing Page"}
              </button>
              {isDirty && <span className="text-sm text-amber-600">Unsaved changes</span>}
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminPricing;
