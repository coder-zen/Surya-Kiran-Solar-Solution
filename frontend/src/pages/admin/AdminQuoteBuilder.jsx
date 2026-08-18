import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaExternalLinkAlt, FaExclamationTriangle } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import { UNIT_LABELS, formatINR } from "../../utils/quotePricing";

/** Same Cloudinary upload path the other admin screens use. */
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/upload", formData, { headers: { "Content-Type": undefined } });
  return data.url;
};

/**
 * Brand logo for one option. Only worth filling in for manufacturer-branded
 * choices — panels and inverters — which is why it's a small control tucked
 * into the row rather than a prominent field.
 */
const LogoField = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handle = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="col-span-12 flex items-center gap-3 pl-1">
      {value ? (
        <img src={cdnImage(value, IMG.thumb)} alt="" className="h-7 w-16 object-contain bg-white rounded border border-gray-100 shrink-0" />
      ) : (
        <span className="h-7 w-16 rounded border border-dashed border-gray-200 shrink-0" />
      )}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ""; }}
        className="text-[11px] text-gray-500 flex-1 min-w-0"
      />
      {uploading && <span className="text-[11px] text-gray-400">Uploading…</span>}
      {value && !uploading && (
        <button type="button" onClick={() => onChange("")} className="text-[11px] text-red-500 shrink-0">
          Remove logo
        </button>
      )}
    </div>
  );
};

/*
 * Reads the admin-only endpoint, which is the one that carries purchase cost and
 * margin. The public /quote-config deliberately cannot return them — see
 * backend/controllers/quoteConfigController.js.
 */
const fetchAdminConfig = async () => (await api.get("/quote-config/admin")).data.data;

const OPTION_GROUPS = [
  { key: "panelBrands", title: "Solar Panel Brands", hint: "Usually priced per watt." },
  { key: "inverterBrands", title: "Inverter Brands", hint: "Set a capacity range to auto-suggest by system size." },
  { key: "structureTypes", title: "Structure Types" },
  { key: "walkwayOptions", title: "Walkway" },
  { key: "railingOptions", title: "Walkway Railing" },
  { key: "ladderOptions", title: "Ladder" },
  { key: "protectionCoverOptions", title: "Inverter Protection Cover" },
  { key: "sprinklerOptions", title: "Sprinkler System" },
  { key: "addOns", title: "Add Extra Services", hint: "Shown in the configurator's optional add-ons section." },
];

const CHARGE_FIELDS = [
  ["transportation", "Transportation", "₹"],
  ["installation", "Installation", "₹"],
  ["delivery", "Delivery", "₹"],
  ["msedclCharges", "MSEDCL Charges", "₹"],
  ["extraMaterial", "Extra Material", "₹"],
  ["siteSpecific", "Site-Specific Charges", "₹"],
  ["discount", "Discount", "₹"],
  ["specialDiscount", "Special Discount", "₹"],
];

/** One editable option row: name, basis, selling price, cost, and live margin. */
const OptionRow = ({ option, groupKey, onChange, onRemove }) => {
  const price = Number(option.price) || 0;
  const cost = Number(option.purchaseCost) || 0;
  const margin = price - cost;
  const isInverter = groupKey === "inverterBrands";

  return (
    <div className="grid grid-cols-12 gap-2 items-start py-3 border-b border-gray-100 last:border-0">
      <input
        value={option.name}
        onChange={(e) => onChange({ ...option, name: e.target.value })}
        placeholder="Option name"
        className="col-span-12 sm:col-span-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />

      <select
        value={option.pricingUnit}
        onChange={(e) => onChange({ ...option, pricingUnit: e.target.value })}
        className="col-span-6 sm:col-span-2 rounded-lg border border-gray-200 px-2 py-2 text-sm"
      >
        {Object.entries(UNIT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <div className="col-span-3 sm:col-span-2">
        <input
          type="number" min="0" step="0.01"
          value={option.price ?? 0}
          onChange={(e) => onChange({ ...option, price: Number(e.target.value) })}
          placeholder="Selling"
          className={`w-full rounded-lg border px-3 py-2 text-sm ${price > 0 ? "border-gray-200" : "border-amber-300 bg-amber-50"}`}
        />
        <span className="text-[10px] text-gray-400">selling</span>
      </div>

      <div className="col-span-3 sm:col-span-2">
        <input
          type="number" min="0" step="0.01"
          value={option.purchaseCost ?? 0}
          onChange={(e) => onChange({ ...option, purchaseCost: Number(e.target.value) })}
          placeholder="Cost"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <span className="text-[10px] text-gray-400">cost (internal)</span>
      </div>

      {/* Margin is derived, never typed — and never sent to the public API. */}
      <div className="col-span-6 sm:col-span-1 pt-2">
        <span className={`text-sm font-semibold ${margin < 0 ? "text-red-500" : "text-green-600"}`}>
          {margin < 0 ? "−" : ""}{formatINR(Math.abs(margin))}
        </span>
        <span className="block text-[10px] text-gray-400">margin</span>
      </div>

      <div className="col-span-6 sm:col-span-2 flex items-center gap-2 justify-end pt-2">
        <label className="flex items-center gap-1.5 text-xs text-gray-500" title="Badged and shown first to customers">
          <input
            type="checkbox"
            checked={Boolean(option.isRecommended)}
            onChange={(e) => onChange({ ...option, isRecommended: e.target.checked })}
            className="h-3.5 w-3.5 accent-navy"
          />
          Pick
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={option.isActive !== false}
            onChange={(e) => onChange({ ...option, isActive: e.target.checked })}
            className="h-3.5 w-3.5 accent-solar-orange"
          />
          Live
        </label>
        <button type="button" onClick={onRemove} aria-label="Remove option" className="text-gray-300 hover:text-red-500">
          <FaTrash />
        </button>
      </div>

      {isInverter && (
        <div className="col-span-12 flex items-center gap-2 pl-1">
          <span className="text-[11px] text-gray-400">Suits</span>
          <input
            type="number" min="0" step="0.5"
            value={option.minCapacityKW ?? 0}
            onChange={(e) => onChange({ ...option, minCapacityKW: Number(e.target.value) })}
            className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs"
          />
          <span className="text-[11px] text-gray-400">to</span>
          <input
            type="number" min="0" step="0.5"
            value={option.maxCapacityKW ?? 0}
            onChange={(e) => onChange({ ...option, maxCapacityKW: Number(e.target.value) })}
            className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs"
          />
          <span className="text-[11px] text-gray-400">kW — leave both 0 to offer for any size</span>
        </div>
      )}

      <input
        value={option.note || ""}
        onChange={(e) => onChange({ ...option, note: e.target.value })}
        placeholder="Note shown to the customer (optional)"
        className="col-span-12 rounded-lg border border-gray-100 px-3 py-1.5 text-xs text-gray-600"
      />

      <LogoField value={option.logoUrl} onChange={(logoUrl) => onChange({ ...option, logoUrl })} />
    </div>
  );
};

const AdminQuoteBuilder = () => {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ["admin-quote-config"], queryFn: fetchAdminConfig });
  const [draft, setDraft] = useState(null);

  // Seed the editable draft once the server copy arrives.
  useEffect(() => {
    if (config && !draft) setDraft(config);
  }, [config, draft]);

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put("/quote-config", payload),
    onSuccess: ({ data: res }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quote-config"] });
      queryClient.invalidateQueries({ queryKey: ["quote-config"] }); // public configurator
      setDraft(res.data);
      toast.success(res.message || "Pricing updated");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not save pricing"),
  });

  if (isLoading || !draft) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8"><p className="text-gray-400 text-sm">Loading pricing…</p></main>
      </div>
    );
  }

  const setGroup = (key, options) => setDraft((d) => ({ ...d, [key]: options }));

  const updateOption = (key, index, next) =>
    setGroup(key, draft[key].map((o, i) => (i === index ? next : o)));

  const addOption = (key) =>
    setGroup(key, [...(draft[key] || []), { name: "", pricingUnit: "fixed", price: 0, purchaseCost: 0, isActive: true, order: (draft[key] || []).length }]);

  const removeOption = (key, index) => setGroup(key, draft[key].filter((_, i) => i !== index));

  const setCharge = (field, value) =>
    setDraft((d) => ({ ...d, charges: { ...d.charges, [field]: Number(value) } }));

  // Counts options still sitting at the seeded ₹0, which quote nothing.
  const unpriced = OPTION_GROUPS.reduce(
    (n, g) => n + (draft[g.key] || []).filter((o) => o.isActive !== false && !(Number(o.price) > 0)).length,
    0
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-navy">Quotation Pricing</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Every rate the customer-facing configurator uses. Saving updates the live site immediately.
            </p>
          </div>
          <a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-sm text-solar-orange font-semibold flex items-center gap-1.5">
            View on site <FaExternalLinkAlt className="text-xs" />
          </a>
        </div>

        <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 mb-6 text-sm text-navy">
          <strong>Purchase cost and margin are internal.</strong> They are served only to this screen —
          the public configurator API cannot return them, so customers never see cost or margin.
        </div>

        {unpriced > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900 flex gap-2">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>
              <strong>{unpriced} live option{unpriced > 1 ? "s" : ""} still priced at ₹0.</strong> The
              configurator stays hidden from the public site until at least one real price is set, and
              any option left at ₹0 adds nothing to a customer's total.
            </span>
          </div>
        )}

        {/* ---------------- capacity + master switch ---------------- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display font-semibold text-navy">System Capacity Range</h3>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={draft.isEnabled !== false}
                onChange={(e) => setDraft((d) => ({ ...d, isEnabled: e.target.checked }))}
                className="h-4 w-4 accent-solar-orange"
              />
              Show configurator on the website
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {[["minKW", "Minimum kW"], ["maxKW", "Maximum kW"], ["defaultKW", "Default kW"], ["stepKW", "Step"]].map(([f, label]) => (
              <div key={f}>
                <label className="section-label">{label}</label>
                <input
                  type="number" min="0.1" step="0.1"
                  value={draft.capacity?.[f] ?? 0}
                  onChange={(e) => setDraft((d) => ({ ...d, capacity: { ...d.capacity, [f]: Number(e.target.value) } }))}
                  className="input-field mt-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- option groups ---------------- */}
        {OPTION_GROUPS.map((group) => (
          <div key={group.key} className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-display font-semibold text-navy">{group.title}</h3>
                {group.hint && <p className="text-xs text-gray-400 mt-0.5">{group.hint}</p>}
              </div>
              <button type="button" onClick={() => addOption(group.key)} className="text-sm text-solar-orange font-semibold flex items-center gap-1.5">
                <FaPlus className="text-xs" /> Add
              </button>
            </div>

            {(draft[group.key] || []).length === 0 && (
              <p className="text-sm text-gray-400 py-3">Nothing here yet — this step is skipped in the configurator.</p>
            )}

            {(draft[group.key] || []).map((option, i) => (
              <OptionRow
                key={option._id || i}
                option={option}
                groupKey={group.key}
                onChange={(next) => updateOption(group.key, i, next)}
                onRemove={() => removeOption(group.key, i)}
              />
            ))}
          </div>
        ))}

        {/* ---------------- charges & terms ---------------- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="font-display font-semibold text-navy">Other Charges</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Applied to every quotation. Enter amounts excluding GST — quotes are shown ex-GST and tax
            is added at invoicing.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {CHARGE_FIELDS.map(([field, label, prefix]) => (
              <div key={field}>
                <label className="section-label">{label} ({prefix})</label>
                <input
                  type="number" min="0" step="0.01"
                  value={draft.charges?.[field] ?? 0}
                  onChange={(e) => setCharge(field, e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- government subsidy ---------------- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="font-display font-semibold text-navy">Government Subsidy</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Deducted from the quoted total — a subsidy is reimbursed against what was paid, not a discount on the sale.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={draft.subsidy?.isEnabled !== false}
                onChange={(e) => setDraft((d) => ({ ...d, subsidy: { ...d.subsidy, isEnabled: e.target.checked } }))}
                className="h-4 w-4 accent-solar-orange"
              />
              Show subsidy
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="section-label">Scheme Name</label>
              <input
                value={draft.subsidy?.label || ""}
                onChange={(e) => setDraft((d) => ({ ...d, subsidy: { ...d.subsidy, label: e.target.value } }))}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="section-label">Maximum Subsidy (₹)</label>
              <input
                type="number" min="0"
                value={draft.subsidy?.maxAmount ?? 0}
                onChange={(e) => setDraft((d) => ({ ...d, subsidy: { ...d.subsidy, maxAmount: Number(e.target.value) } }))}
                className="input-field mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Applied to systems larger than the biggest slab.</p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-navy mt-4">
            <input
              type="checkbox"
              checked={draft.subsidy?.residentialOnly !== false}
              onChange={(e) => setDraft((d) => ({ ...d, subsidy: { ...d.subsidy, residentialOnly: e.target.checked } }))}
              className="h-4 w-4 accent-solar-orange"
            />
            Residential rooftops only
          </label>

          <div className="mt-4">
            <div className="flex justify-between items-center">
              <label className="section-label">Subsidy Slabs</label>
              <button
                type="button"
                onClick={() => setDraft((d) => ({
                  ...d,
                  subsidy: { ...d.subsidy, slabs: [...(d.subsidy?.slabs || []), { upToKW: 0, amount: 0 }] },
                }))}
                className="text-sm text-solar-orange font-semibold"
              >
                + Add slab
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              A system takes the largest slab it reaches — a 5kW system on a 3kW slab gets that slab's amount.
            </p>
            <div className="space-y-2 mt-3">
              {(draft.subsidy?.slabs || []).map((slab, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-14">System</span>
                  <input
                    type="number" min="0" step="0.5"
                    value={slab.upToKW ?? 0}
                    onChange={(e) => setDraft((d) => ({
                      ...d,
                      subsidy: { ...d.subsidy, slabs: d.subsidy.slabs.map((s, j) => j === i ? { ...s, upToKW: Number(e.target.value) } : s) },
                    }))}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <span className="text-xs text-gray-400">kW →</span>
                  <span className="text-xs text-gray-400">₹</span>
                  <input
                    type="number" min="0"
                    value={slab.amount ?? 0}
                    onChange={(e) => setDraft((d) => ({
                      ...d,
                      subsidy: { ...d.subsidy, slabs: d.subsidy.slabs.map((s, j) => j === i ? { ...s, amount: Number(e.target.value) } : s) },
                    }))}
                    className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({
                      ...d,
                      subsidy: { ...d.subsidy, slabs: d.subsidy.slabs.filter((_, j) => j !== i) },
                    }))}
                    aria-label="Remove slab"
                    className="text-gray-300 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="section-label">Eligibility Note (shown to the customer)</label>
            <input
              value={draft.subsidy?.note || ""}
              onChange={(e) => setDraft((d) => ({ ...d, subsidy: { ...d.subsidy, note: e.target.value } }))}
              className="input-field mt-1"
            />
          </div>
        </div>

        {/* ---------------- savings & sizing ---------------- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="font-display font-semibold text-navy">Savings &amp; Payback</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Drives the payback figure, and the bill-to-size suggestion in the configurator.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={draft.savings?.isEnabled !== false}
                onChange={(e) => setDraft((d) => ({ ...d, savings: { ...d.savings, isEnabled: e.target.checked } }))}
                className="h-4 w-4 accent-solar-orange"
              />
              Show payback
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="section-label">Tariff (₹/unit)</label>
              <input
                type="number" min="0" step="0.1"
                value={draft.savings?.unitRateRupees ?? 8}
                onChange={(e) => setDraft((d) => ({ ...d, savings: { ...d.savings, unitRateRupees: Number(e.target.value) } }))}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="section-label">Units / kW / day</label>
              <input
                type="number" min="0" step="0.1"
                value={draft.savings?.generationPerKWPerDay ?? 4}
                onChange={(e) => setDraft((d) => ({ ...d, savings: { ...d.savings, generationPerKWPerDay: Number(e.target.value) } }))}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="section-label">System Life (years)</label>
              <input
                type="number" min="1"
                value={draft.savings?.systemLifeYears ?? 25}
                onChange={(e) => setDraft((d) => ({ ...d, savings: { ...d.savings, systemLifeYears: Number(e.target.value) } }))}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="section-label">Roof Area per kW (sq ft)</label>
              <input
                type="number" min="1"
                value={draft.savings?.areaSqFtPerKW ?? 100}
                onChange={(e) => setDraft((d) => ({ ...d, savings: { ...d.savings, areaSqFtPerKW: Number(e.target.value) } }))}
                className="input-field mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Shadow-free area one kW occupies. SECI/MNRE quote 130; industry practice runs 80–130
                depending on panel efficiency.
              </p>
            </div>
            <div>
              <label className="section-label">Bill Offset (%)</label>
              <input
                type="number" min="1" max="100"
                value={draft.billEstimator?.offsetPercent ?? 90}
                onChange={(e) => setDraft((d) => ({ ...d, billEstimator: { ...d.billEstimator, offsetPercent: Number(e.target.value) } }))}
                className="input-field mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Not currently applied to sizing — the size comes straight from yearly units.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 grid sm:grid-cols-2 gap-4">
          <h3 className="font-display font-semibold text-navy sm:col-span-2">Terms</h3>
          <div>
            <label className="section-label">Quotation Validity (days)</label>
            <input
              type="number" min="1"
              value={draft.terms?.quotationValidityDays ?? 15}
              onChange={(e) => setDraft((d) => ({ ...d, terms: { ...d.terms, quotationValidityDays: Number(e.target.value) } }))}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="section-label">Warranty Terms</label>
            <textarea
              rows={2}
              value={draft.terms?.warranty || ""}
              onChange={(e) => setDraft((d) => ({ ...d, terms: { ...d.terms, warranty: e.target.value } }))}
              className="input-field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="section-label">Disclaimer (shown under the estimate)</label>
            <textarea
              rows={2}
              value={draft.terms?.disclaimer || ""}
              onChange={(e) => setDraft((d) => ({ ...d, terms: { ...d.terms, disclaimer: e.target.value } }))}
              className="input-field mt-1"
            />
          </div>
        </div>

        {/* Sticky so the save button is reachable from anywhere in a long form. */}
        <div className="sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200">
          <button
            onClick={() => saveMutation.mutate(draft)}
            disabled={saveMutation.isPending}
            className="btn-primary"
          >
            {saveMutation.isPending ? "Saving…" : "Save All Pricing"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminQuoteBuilder;
