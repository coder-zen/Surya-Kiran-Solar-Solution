import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import api from "../../config/api";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import SectionHeading from "../common/SectionHeading";
import EnquiryModal from "../common/EnquiryModal";
import {
  buildQuote,
  formatINR,
  capacityForBill,
  describeOptionPrice,
  QUANTITY_FOR_UNIT,
  PROPERTY_TYPES,
} from "../../utils/quotePricing";

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
/**
 * One choice, laid out so a customer can compare across a row without reading
 * carefully: brand mark, name, what it gets you, what it costs.
 *
 * Stacked rather than putting the logo beside the name — inline, a wide mark
 * like Waaree's squeezed the name into a narrow column while logo-less options
 * in the same row started hard left, so the grid never lined up. Giving the
 * logo its own band keeps every card on the same rhythm whether it has one
 * or not.
 */
const OptionCard = ({ option, selected, onSelect, capacityKW }) => {
  const price = describeOptionPrice(option, capacityKW);

  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      aria-pressed={selected}
      className={`relative text-left rounded-xl border p-4 flex flex-col gap-2 transition-all ${
        selected
          ? "border-solar-orange bg-solar-orange/5 ring-1 ring-solar-orange/30"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
      }`}
    >
      {option.isRecommended && (
        <span className="absolute -top-2 right-3 rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Recommended
        </span>
      )}

      {/* Reserved only when a logo exists, but always the same height when it
          does, so branded options across a row sit on one line. */}
      {option.logoUrl && (
        <img
          src={cdnImage(option.logoUrl, IMG.thumb)}
          alt={`${option.name} logo`}
          loading="lazy"
          className="h-6 w-auto max-w-[88px] object-contain object-left"
          onError={(e) => (e.target.style.display = "none")}
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <span className="font-display font-semibold text-navy text-[15px] leading-tight">
          {option.name}
        </span>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-solar-orange shrink-0">
            <FaCheck className="text-white text-[9px]" />
          </span>
        )}
      </div>

      {option.note && <p className="text-xs text-gray-500 leading-relaxed">{option.note}</p>}

      {/* Pushed to the bottom so prices align across cards of differing height. */}
      {price && (
        <div className="mt-auto pt-1">
          {price.amount === 0 ? (
            <span className="text-sm font-semibold text-green-600">Included</span>
          ) : price.amount === null ? (
            <span className="text-sm font-semibold text-navy">{price.label}</span>
          ) : (
            <span className="text-sm font-semibold text-navy">
              {price.isEstimate && <span className="text-gray-400 font-normal">from </span>}
              +{formatINR(price.amount)}
              {price.label && <span className="text-xs text-gray-400 font-normal"> {price.label}</span>}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

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
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [monthlyBill, setMonthlyBill] = useState("");
  const [sizedFromBill, setSizedFromBill] = useState(false);
  const [selections, setSelections] = useState({});
  const [addOnState, setAddOnState] = useState({});
  const [addOnsOpen, setAddOnsOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const capacity = capacityKW ?? config?.capacity?.defaultKW ?? 5;

  /*
   * Sizing from the bill is the entry point most customers can actually answer —
   * almost nobody knows their kW, everybody knows what they pay. It only ever
   * suggests: the slider stays authoritative, so a customer who knows their
   * requirement is never overridden by an estimate.
   */
  const applyBill = (value) => {
    setMonthlyBill(value);
    const suggested = capacityForBill(config, value);
    if (suggested) {
      setCapacityKW(suggested);
      setSizedFromBill(true);
    }
  };

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
        propertyType,
      }),
    [config, capacity, selections, addOnState, propertyType]
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
            {/* property type — drives subsidy eligibility */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-navy">Property Type</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Government subsidy applies to residential rooftops only.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`rounded-xl border p-3 text-sm font-semibold transition-all ${
                      propertyType === type
                        ? "border-solar-orange bg-solar-orange/5 text-navy"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* capacity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-navy">System Capacity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Everything else scales from this.</p>

              {config.billEstimator?.isEnabled !== false && (
                <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <label className="text-sm font-medium text-navy">
                    Not sure what size you need?
                  </label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Enter your average monthly electricity bill and we'll size it for you.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={monthlyBill}
                      onChange={(e) => applyBill(e.target.value)}
                      placeholder="4000"
                      className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                    <span className="text-sm text-gray-500">per month</span>
                  </div>
                  {sizedFromBill && (
                    <p className="text-xs text-solar-orange font-medium mt-2">
                      Suggested: {capacity} kW — adjust below if you already know your requirement.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <input
                  type="range"
                  min={cap.minKW ?? 1}
                  max={cap.maxKW ?? 100}
                  step={cap.stepKW ?? 0.5}
                  value={capacity}
                  onChange={(e) => {
                    setCapacityKW(Number(e.target.value));
                    setSizedFromBill(false); // their own choice supersedes the estimate
                  }}
                  className="flex-1 accent-solar-orange"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={cap.minKW ?? 1}
                    max={cap.maxKW ?? 100}
                    step={cap.stepKW ?? 0.5}
                    value={capacity}
                    onChange={(e) => {
                      setCapacityKW(Number(e.target.value) || cap.minKW || 1);
                      setSizedFromBill(false);
                    }}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-navy"
                  />
                  <span className="text-sm text-gray-500">kW</span>
                </div>
              </div>
            </div>

            {/* the eight steps */}
            {STEPS.map((step, i) => {
              const raw = step.key === "inverter" ? compatibleInverters : config[step.group] || [];
              if (!raw.length) return null;
              // Recommended first — a customer scanning six unfamiliar brands
              // should meet the company's pick before the alphabet's.
              const options = [...raw].sort(
                (a, b) => Number(Boolean(b.isRecommended)) - Number(Boolean(a.isRecommended))
              );
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

                  {/* items-stretch keeps every card the same height so the
                      price line sits on one baseline across the row. */}
                  <div className="grid sm:grid-cols-2 gap-3 mt-5 items-stretch">
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
                {quote.subsidy > 0 ? (
                  <>
                    {/*
                      The amount payable leads, not the post-subsidy figure.
                      PM Surya Ghar is reimbursed by bank transfer after DISCOM
                      commissioning — it is not deducted at purchase. Headlining
                      the net number would tell a customer to arrange ₹2.15L when
                      they need ₹2.93L on the day, which is a worse outcome than
                      any gain from the smaller figure looking friendlier.
                    */}
                    <p className="text-xs text-gray-400">Amount Payable</p>
                    <p className="text-3xl font-display font-bold text-navy mt-1">{formatINR(quote.total)}</p>

                    <div className="mt-4 rounded-xl bg-green-50 border border-green-100 p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-medium">
                          {config.subsidy?.label || "Government Subsidy"}
                        </span>
                        <span className="text-green-700 font-semibold">−{formatINR(quote.subsidy)}</span>
                      </div>
                      <p className="text-[11px] text-green-800/70 mt-1.5 leading-relaxed">
                        Credited to your bank account after commissioning — not deducted from the
                        amount payable above.
                      </p>
                      <div className="flex justify-between text-sm mt-2.5 pt-2.5 border-t border-green-200">
                        <span className="text-gray-600">Effective cost</span>
                        <span className="text-navy font-semibold">{formatINR(quote.netPayable)}</span>
                      </div>
                    </div>

                    {config.subsidy?.note && (
                      <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{config.subsidy.note}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400">Estimated Final Amount</p>
                    <p className="text-3xl font-display font-bold text-navy mt-1">{formatINR(quote.total)}</p>
                  </>
                )}
              </div>

              {/* Reframes the price as an investment with a return date. */}
              {quote.savings?.paybackYears && (
                <div className="mt-4 rounded-xl bg-navy/5 border border-navy/10 p-4">
                  <p className="text-sm font-semibold text-navy">
                    Pays for itself in {quote.savings.paybackYears.toFixed(1)} years
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Then about{" "}
                    <span className="font-semibold text-navy">{formatINR(quote.savings.monthlySavings)}</span>{" "}
                    saved every month, for a system built to last{" "}
                    {quote.savings.systemLifeYears} years.
                  </p>
                  <div className="flex justify-between text-xs mt-3 pt-3 border-t border-navy/10">
                    <span className="text-gray-500">Lifetime savings</span>
                    <span className="font-semibold text-green-600">{formatINR(quote.savings.lifetimeSavings)}</span>
                  </div>
                </div>
              )}

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
            {/* Payable, not net — matches the cart for the same reason. */}
            <p className="text-xs text-gray-400">
              {quote.subsidy > 0 ? `Payable · ${formatINR(quote.subsidy)} back` : "Estimated total"}
            </p>
            <p className="text-xl font-display font-bold text-navy truncate">
              {formatINR(quote.total)}
            </p>
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
        contextMessage={buildEnquiryMessage({ capacity, propertyType, monthlyBill, selections, addOnState, quote })}
      />
    </section>
  );
};

/**
 * Summarises the configuration into the enquiry message, so the sales team sees
 * exactly what the customer built instead of a bare "wants a quote" lead.
 */
const buildEnquiryMessage = ({ capacity, propertyType, monthlyBill, selections, addOnState, quote }) => {
  const parts = [`Configured ${capacity}kW ${propertyType.toLowerCase()} system:`];
  if (monthlyBill) parts.push(`• Current monthly bill: ₹${monthlyBill}`);

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

  parts.push(`Amount payable: ${formatINR(quote.total)}`);
  if (quote.subsidy > 0) {
    parts.push(`Subsidy (reimbursed after commissioning): −${formatINR(quote.subsidy)}`);
    parts.push(`Effective cost: ${formatINR(quote.netPayable)}`);
  }
  return parts.join("\n");
};

export default QuoteConfigurator;
