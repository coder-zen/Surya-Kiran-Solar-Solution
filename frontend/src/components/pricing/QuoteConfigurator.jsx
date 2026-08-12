import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import api from "../../config/api";
import SectionHeading from "../common/SectionHeading";
import EnquiryModal from "../common/EnquiryModal";
import { buildQuote, formatINR, QUANTITY_FOR_UNIT } from "../../utils/quotePricing";

const fetchQuoteConfig = async () => (await api.get("/quote-config")).data.data;

/** The eight configuration steps, in the order the requirements list them. */
const STEPS = [
  { key: "panel", group: "panelBrands", title: "Solar Panel Brand", required: true },
  { key: "inverter", group: "inverterBrands", title: "Inverter Brand", required: true },
  { key: "structure", group: "structureTypes", title: "Structure Type", required: true },
  { key: "walkway", group: "walkwayOptions", title: "Walkway" },
  { key: "railing", group: "railingOptions", title: "Walkway Railing" },
  { key: "ladder", group: "ladderOptions", title: "Ladder" },
  { key: "cover", group: "protectionCoverOptions", title: "Inverter Protection Cover" },
  { key: "sprinkler", group: "sprinklerOptions", title: "Sprinkler System" },
];

/**
 * One selectable option. Deliberately shows only the name and any note — the
 * requirement is that the customer sees a selection's effect on their total,
 * not the rate behind it, and the running cart is where that effect appears.
 */
const OptionCard = ({ option, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option)}
    className={`text-left rounded-xl border p-4 transition-all ${
      selected
        ? "border-solar-orange bg-solar-orange/5 shadow-sm"
        : "border-gray-200 hover:border-gray-300 bg-white"
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <span className="font-semibold text-navy text-sm">{option.name}</span>
      {selected && <FaCheck className="text-solar-orange text-xs mt-1 shrink-0" />}
    </div>
    {option.note && <p className="text-xs text-gray-400 mt-1">{option.note}</p>}
  </button>
);

/** Quantity input shown only for options priced per unit / ft / sq ft. */
const QuantityInput = ({ unit, value, onChange }) => {
  const spec = QUANTITY_FOR_UNIT[unit];
  if (!spec) return null;
  return (
    <div className="mt-3 flex items-center gap-2">
      <label className="text-xs text-gray-500">{spec.label}</label>
      <input
        type="number"
        min={spec.min}
        step={spec.step}
        value={value}
        onChange={(e) => onChange(Math.max(spec.min, Number(e.target.value) || spec.min))}
        className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
      />
      <span className="text-xs text-gray-400">{spec.suffix}</span>
    </div>
  );
};

const QuoteConfigurator = () => {
  const { data: config, isLoading, isError } = useQuery({
    queryKey: ["quote-config"],
    queryFn: fetchQuoteConfig,
    retry: false,
  });

  const [capacityKW, setCapacityKW] = useState(null);
  const [selections, setSelections] = useState({});
  const [addOnState, setAddOnState] = useState({});
  const [addOnsOpen, setAddOnsOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const capacity = capacityKW ?? config?.capacity?.defaultKW ?? 5;

  /*
   * The admin seeds every option at ₹0 until the real rates are entered. Quoting
   * ₹0 in that window would look like a working calculator giving a free system,
   * which is worse than saying nothing — so the configurator holds itself back
   * until at least one price exists.
   */
  const hasPricing = useMemo(() => {
    if (!config) return false;
    const groups = [...STEPS.map((s) => s.group), "addOns"];
    return groups.some((g) => (config[g] || []).some((o) => Number(o.price) > 0));
  }, [config]);

  /** Inverters whose capacity band covers the chosen system, per the spec. */
  const compatibleInverters = useMemo(() => {
    const all = config?.inverterBrands || [];
    return all.filter((inv) => {
      const min = Number(inv.minCapacityKW) || 0;
      const max = Number(inv.maxCapacityKW) || 0;
      if (!min && !max) return true; // unset band = fits anything
      if (min && capacity < min) return false;
      if (max && capacity > max) return false;
      return true;
    });
  }, [config, capacity]);

  const selectOption = (key, option) =>
    setSelections((prev) => {
      const spec = QUANTITY_FOR_UNIT[option.pricingUnit];
      return {
        ...prev,
        [key]: { option, quantity: prev[key]?.quantity ?? spec?.default ?? 1 },
      };
    });

  const setQuantity = (key, quantity) =>
    setSelections((prev) => ({ ...prev, [key]: { ...prev[key], quantity } }));

  const toggleAddOn = (option) =>
    setAddOnState((prev) => {
      const next = { ...prev };
      if (next[option._id]) delete next[option._id];
      else next[option._id] = { option, quantity: QUANTITY_FOR_UNIT[option.pricingUnit]?.default ?? 1 };
      return next;
    });

  const quote = useMemo(
    () =>
      buildQuote({
        config,
        capacityKW: capacity,
        selections,
        addOns: Object.values(addOnState),
      }),
    [config, capacity, selections, addOnState]
  );

  if (isLoading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <div className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
        </div>
      </section>
    );
  }

  // No fake fallback: if the rates can't be fetched, the configurator says so
  // rather than quoting from stale or invented numbers.
  if (isError || !config || config.isEnabled === false || !hasPricing) {
    return null;
  }

  const cap = config.capacity || {};

  return (
    <section className="py-24 bg-gray-50">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Build Your System"
          title="Customise Your Solar Quotation"
          subtitle="Choose your components and see an indicative price update as you go."
        />

        <div className="mt-14 grid lg:grid-cols-3 gap-8 items-start">
          {/* ---------------- configuration ---------------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* capacity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-navy">System Capacity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Everything else scales from this.</p>
              <div className="flex items-center gap-4 mt-4">
                <input
                  type="range"
                  min={cap.minKW ?? 1}
                  max={cap.maxKW ?? 100}
                  step={cap.stepKW ?? 0.5}
                  value={capacity}
                  onChange={(e) => setCapacityKW(Number(e.target.value))}
                  className="flex-1 accent-solar-orange"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={cap.minKW ?? 1}
                    max={cap.maxKW ?? 100}
                    step={cap.stepKW ?? 0.5}
                    value={capacity}
                    onChange={(e) => setCapacityKW(Number(e.target.value) || cap.minKW || 1)}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-navy"
                  />
                  <span className="text-sm text-gray-500">kW</span>
                </div>
              </div>
            </div>

            {/* the eight steps */}
            {STEPS.map((step, i) => {
              const options = step.key === "inverter" ? compatibleInverters : config[step.group] || [];
              if (!options.length) return null;
              const chosen = selections[step.key];

              return (
                <div key={step.key} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-solar-orange">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-display font-semibold text-navy">{step.title}</h3>
                    {step.required && <span className="text-xs text-gray-400">· required</span>}
                  </div>

                  {step.key === "inverter" && compatibleInverters.length < (config.inverterBrands || []).length && (
                    <p className="text-xs text-gray-400 mt-1">
                      Showing inverters suited to a {capacity}kW system.
                    </p>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    {options.map((option) => (
                      <OptionCard
                        key={option._id}
                        option={option}
                        selected={chosen?.option?._id === option._id}
                        onSelect={(o) => selectOption(step.key, o)}
                        capacityKW={capacity}
                      />
                    ))}
                  </div>

                  {chosen && (
                    <QuantityInput
                      unit={chosen.option.pricingUnit}
                      value={chosen.quantity}
                      onChange={(q) => setQuantity(step.key, q)}
                    />
                  )}
                </div>
              );
            })}

            {/* add-ons */}
            {(config.addOns || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAddOnsOpen((o) => !o)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div>
                    <h3 className="font-display font-semibold text-navy">Add Extra Services</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Object.keys(addOnState).length
                        ? `${Object.keys(addOnState).length} selected`
                        : "Optional extras"}
                    </p>
                  </div>
                  <FaChevronDown className={`text-gray-400 transition-transform ${addOnsOpen ? "rotate-180" : ""}`} />
                </button>

                {addOnsOpen && (
                  <div className="px-6 pb-6 grid sm:grid-cols-2 gap-3">
                    {config.addOns.map((option) => {
                      const active = Boolean(addOnState[option._id]);
                      return (
                        <div
                          key={option._id}
                          className={`rounded-xl border p-4 ${active ? "border-solar-orange bg-solar-orange/5" : "border-gray-200"}`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => toggleAddOn(option)}
                              className="h-4 w-4 accent-solar-orange mt-0.5 shrink-0"
                            />
                            <span className="text-sm font-medium text-navy">{option.name}</span>
                          </label>
                          {active && (
                            <QuantityInput
                              unit={option.pricingUnit}
                              value={addOnState[option._id].quantity}
                              onChange={(q) =>
                                setAddOnState((prev) => ({
                                  ...prev,
                                  [option._id]: { ...prev[option._id], quantity: q },
                                }))
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---------------- live cart ---------------- */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl p-6 shadow-premium border border-gray-100">
              <h3 className="font-display font-semibold text-navy">Your Estimate</h3>
              <p className="text-xs text-gray-400 mt-0.5">{capacity} kW system</p>

              <div className="mt-5 space-y-2 text-sm">
                {quote.lines.map((l) => (
                  <div key={l.label} className="flex justify-between gap-3">
                    <span className="text-gray-500 min-w-0">
                      {l.label}
                      <span className="block text-xs text-gray-400 truncate">{l.name}</span>
                    </span>
                    <span className="text-navy font-medium shrink-0">{formatINR(l.amount)}</span>
                  </div>
                ))}

                {!quote.lines.length && (
                  <p className="text-gray-400 text-sm">Choose your components to see an estimate.</p>
                )}

                {quote.addOnLines.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 pt-2 mt-2" />
                    {quote.addOnLines.map((l) => (
                      <div key={l.name} className="flex justify-between gap-3">
                        <span className="text-gray-500 min-w-0 truncate">{l.name}</span>
                        <span className="text-navy font-medium shrink-0">{formatINR(l.amount)}</span>
                      </div>
                    ))}
                  </>
                )}

                {quote.extraCharges.map((l) => (
                  <div key={l.name} className="flex justify-between gap-3">
                    <span className="text-gray-500">{l.name}</span>
                    <span className="text-navy font-medium">{formatINR(l.amount)}</span>
                  </div>
                ))}

                {quote.discounts.map((l) => (
                  <div key={l.name} className="flex justify-between gap-3">
                    <span className="text-green-600">{l.name}</span>
                    <span className="text-green-600 font-medium">−{formatINR(l.amount)}</span>
                  </div>
                ))}

                {quote.total > 0 && (
                  <>
                    <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between">
                      <span className="text-gray-500">Taxable Amount</span>
                      <span className="text-navy font-medium">{formatINR(quote.taxable)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">GST ({quote.gstPercent}%)</span>
                      <span className="text-navy font-medium">{formatINR(quote.gst)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <p className="text-xs text-gray-400">Estimated Final Amount</p>
                <p className="text-3xl font-display font-bold text-navy mt-1">{formatINR(quote.total)}</p>
              </div>

              <button onClick={() => setQuoteOpen(true)} className="btn-primary w-full mt-5 justify-center">
                Request Detailed Quotation
              </button>

              {config.terms?.disclaimer && (
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">{config.terms.disclaimer}</p>
              )}
              {config.terms?.quotationValidityDays && (
                <p className="text-xs text-gray-400 mt-1">
                  Rates valid {config.terms.quotationValidityDays} days from quotation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky total on mobile, where the cart sits far below the options. */}
      {quote.total > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-premium px-5 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Estimated total</p>
            <p className="text-xl font-display font-bold text-navy truncate">{formatINR(quote.total)}</p>
          </div>
          <button onClick={() => setQuoteOpen(true)} className="btn-primary !py-2.5 !px-5 text-sm shrink-0">
            Get Quotation
          </button>
        </div>
      )}

      <EnquiryModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        source="quote_configurator"
        contextMessage={buildEnquiryMessage({ capacity, selections, addOnState, quote })}
      />
    </section>
  );
};

/**
 * Summarises the configuration into the enquiry message, so the sales team sees
 * exactly what the customer built instead of a bare "wants a quote" lead.
 */
const buildEnquiryMessage = ({ capacity, selections, addOnState, quote }) => {
  const parts = [`Configured ${capacity}kW system:`];
  for (const step of STEPS) {
    const chosen = selections[step.key];
    if (chosen?.option) {
      const spec = QUANTITY_FOR_UNIT[chosen.option.pricingUnit];
      parts.push(`• ${step.title}: ${chosen.option.name}${spec ? ` (${chosen.quantity} ${spec.suffix})` : ""}`);
    }
  }
  const addOns = Object.values(addOnState);
  if (addOns.length) {
    parts.push(`• Add-ons: ${addOns.map((a) => a.option.name).join(", ")}`);
  }
  parts.push(`Estimated total: ${formatINR(quote.total)}`);
  return parts.join("\n");
};

export default QuoteConfigurator;
