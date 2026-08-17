/**
 * ==========================================================================
 * QUOTATION PRICING ENGINE
 * ==========================================================================
 * Turns a customer's configuration into the line-by-line breakdown the
 * configurator shows. Runs in the browser so the total updates as they click
 * rather than after a round trip per change.
 *
 * That is safe specifically because it only ever handles selling prices. The
 * rates it multiplies are the same ones /api/quote-config serves publicly;
 * purchase cost and margin never reach the client, so there is nothing here an
 * inspector could learn. Sending a configuration to the server for pricing
 * would protect nothing extra and would cost a request per checkbox.
 *
 * Nothing in this file hardcodes a rate — every number comes from the config
 * document, which is what makes the whole thing admin-editable.
 * ==========================================================================
 */

/** Human labels for each pricing basis, used in the admin screen and cart. */
export const UNIT_LABELS = {
  perWatt: "₹ / Watt",
  perKW: "₹ / kW",
  perKWYear: "₹ / kW / year",
  perUnit: "₹ / unit",
  perRunningFt: "₹ / running ft",
  perSqFt: "₹ / sq ft",
  fixed: "Fixed",
  percent: "% of project value",
};

/**
 * What quantity, if any, the customer must supply for a given pricing basis.
 * `null` means the amount follows from system capacity alone.
 */
export const QUANTITY_FOR_UNIT = {
  perUnit: { label: "Quantity", suffix: "nos", min: 1, step: 1, default: 1 },
  perRunningFt: { label: "Length", suffix: "running ft", min: 1, step: 1, default: 10 },
  perSqFt: { label: "Area", suffix: "sq ft", min: 1, step: 1, default: 10 },
  perWatt: null,
  perKW: null,
  perKWYear: null,
  fixed: null,
  percent: null,
};

/**
 * Price for one option.
 *
 * `base` is only consulted for percentage pricing (insurance is quoted as a
 * share of project value), and is passed in rather than derived so the caller
 * controls what "project value" means — see buildQuote, which excludes other
 * percentage items to keep them from compounding against each other.
 */
export const priceOption = (option, { capacityKW = 0, quantity = 1, base = 0 } = {}) => {
  if (!option) return 0;
  const rate = Number(option.price) || 0;
  const qty = Number(quantity) || 0;
  const kW = Number(capacityKW) || 0;

  switch (option.pricingUnit) {
    case "perWatt":
      return rate * kW * 1000;
    case "perKW":
    case "perKWYear":
      return rate * kW;
    case "perUnit":
    case "perRunningFt":
    case "perSqFt":
      return rate * qty;
    case "percent":
      return (rate / 100) * base;
    case "fixed":
    default:
      return rate;
  }
};

/** Property types offered in the configurator. Subsidy eligibility turns on this. */
export const PROPERTY_TYPES = ["Residential", "Commercial", "Institutional"];

/**
 * What one option adds, phrased for the card the customer is choosing from.
 *
 * Capacity-scaled options resolve to a real rupee figure, because "₹1,60,000"
 * is a decision and "₹32 per watt" is homework. Quantity-driven ones can't be
 * totalled before the customer says how many, so they show their rate instead
 * of a number that would be wrong; percentage options show the percentage.
 *
 * Returns { amount, label, isEstimate } — amount is null when no total exists.
 */
export const describeOptionPrice = (option, capacityKW) => {
  if (!option) return null;
  const rate = Number(option.price) || 0;
  if (rate <= 0) return { amount: 0, label: "Included", isEstimate: false };

  switch (option.pricingUnit) {
    case "perWatt":
    case "perKW":
      return { amount: priceOption(option, { capacityKW }), label: null, isEstimate: false };
    case "perKWYear":
      return { amount: priceOption(option, { capacityKW }), label: "per year", isEstimate: false };
    case "fixed":
      return { amount: rate, label: null, isEstimate: false };
    case "percent":
      return { amount: null, label: `${rate}% of project value`, isEstimate: true };
    case "perUnit":
      return { amount: rate, label: "per unit", isEstimate: true };
    case "perRunningFt":
      return { amount: rate, label: "per running ft", isEstimate: true };
    case "perSqFt":
      return { amount: rate, label: "per sq ft", isEstimate: true };
    default:
      return { amount: rate, label: null, isEstimate: false };
  }
};

/**
 * Government subsidy for a given system size.
 *
 * Reads the largest slab the system qualifies for — a 5kW system takes the 3kW
 * slab, not nothing — and falls back to maxAmount once capacity passes the last
 * one. Deliberately conservative for in-between sizes: a 1.5kW system quotes the
 * 1kW slab rather than the 2kW one, because a quote that under-promises a
 * government payment is recoverable and one that over-promises is not.
 *
 * Returns 0 whenever the scheme doesn't apply, so callers never special-case it.
 */
export const subsidyFor = (config, capacityKW, propertyType) => {
  const s = config?.subsidy;
  if (!s?.isEnabled) return 0;
  if (s.residentialOnly && propertyType !== "Residential") return 0;

  const kW = Number(capacityKW) || 0;
  const slabs = [...(s.slabs || [])].sort((a, b) => a.upToKW - b.upToKW);
  if (!slabs.length) return 0;

  const largest = slabs[slabs.length - 1];
  if (kW > largest.upToKW) return Number(s.maxAmount) || largest.amount || 0;

  const match = [...slabs].reverse().find((slab) => kW >= slab.upToKW);
  return match ? Number(match.amount) || 0 : 0;
};

/**
 * Turns a system into what it saves, which is the number that makes a price
 * feel like an investment rather than a cost.
 *
 * `netCost` is what the customer actually pays — after subsidy — so payback
 * reflects their real outlay. Generation and tariff come from settings because
 * both vary by region and change with MSEDCL revisions.
 */
export const savingsFor = (config, capacityKW, netCost) => {
  const s = config?.savings;
  if (!s?.isEnabled) return null;

  const kW = Number(capacityKW) || 0;
  const unitRate = Number(s.unitRateRupees) || 0;
  const perKWDay = Number(s.generationPerKWPerDay) || 0;
  const lifeYears = Number(s.systemLifeYears) || 25;
  if (!kW || !unitRate || !perKWDay) return null;

  const unitsPerMonth = kW * perKWDay * 30;
  const monthlySavings = unitsPerMonth * unitRate;
  const annualSavings = monthlySavings * 12;
  const cost = Math.max(0, Number(netCost) || 0);

  return {
    unitsPerMonth,
    monthlySavings,
    annualSavings,
    // Undefined rather than Infinity when nothing is configured yet, so the UI
    // can simply not render a payback line instead of printing a broken one.
    paybackYears: annualSavings > 0 && cost > 0 ? cost / annualSavings : null,
    lifetimeSavings: annualSavings * lifeYears,
    systemLifeYears: lifeYears,
  };
};

/**
 * Suggests a system size from a year's electricity consumption in units (kWh).
 *
 * A year rather than a month because consumption swings hard with the season —
 * sizing off a single summer bill oversizes the system, off a winter one
 * undersizes it. The yearly total on the bill averages that out.
 *
 * Units rather than rupees because the arithmetic is then exact: rupees have
 * to be divided back through a tariff that varies by slab, and a wrong tariff
 * moves the recommended size by multiples, not percentages.
 *
 *   units/year ÷ 12 = units/month ÷ 30 = units/day ÷ generation per kW = kW
 */
export const rawCapacityForAnnualUnits = (config, annualUnits) => {
  const units = Number(annualUnits) || 0;
  const perKWDay = Number(config?.savings?.generationPerKWPerDay) || 4;
  if (!units || !perKWDay) return null;

  const unitsPerDay = units / 12 / 30;
  return unitsPerDay / perKWDay;
};

/**
 * The same size, snapped to something the configurator's slider can represent.
 * The standalone savings calculator uses the raw figure instead, since it has
 * no slider to agree with.
 */
export const capacityForAnnualUnits = (config, annualUnits) => {
  const kW = rawCapacityForAnnualUnits(config, annualUnits);
  if (!kW) return null;

  // Snap to the configurator's own step so the suggestion is a size the slider
  // can actually represent.
  const step = Number(config?.capacity?.stepKW) || 0.5;
  const min = Number(config?.capacity?.minKW) || 1;
  const max = Number(config?.capacity?.maxKW) || 100;
  const snapped = Math.round(kW / step) * step;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(2))));
};

/**
 * Shadow-free roof area a system of this size needs, in square feet.
 *
 * Rounded to the nearest 5 — quoting "just over 344 sq ft" implies a precision
 * no rule of thumb has, and every real roof has obstructions that move it.
 */
export const areaSqFtForCapacity = (config, capacityKW) => {
  const kW = Number(capacityKW) || 0;
  const perKW = Number(config?.savings?.areaSqFtPerKW) || 100;
  if (!kW) return null;
  return Math.round((kW * perKW) / 5) * 5;
};

/**
 * Builds the full breakdown the cart renders.
 *
 * `selections` is keyed by config group — each holds the chosen option and, for
 * quantity-based units, how many. `addOns` is a list of {option, quantity}.
 */
export const buildQuote = ({ config, capacityKW, selections = {}, addOns = [], propertyType = "Residential" }) => {
  if (!config) return null;

  const kW = Number(capacityKW) || 0;
  const lines = [];

  const push = (label, option, quantity) => {
    if (!option) return;
    const amount = priceOption(option, { capacityKW: kW, quantity });
    // A "No Walkway"-style choice is a real selection priced at zero; showing it
    // as a ₹0 line is noise, so only priced lines reach the cart.
    if (amount > 0) lines.push({ label, name: option.name, amount, unit: option.pricingUnit, quantity });
  };

  push("Solar Panels", selections.panel?.option, selections.panel?.quantity);
  push("Inverter", selections.inverter?.option, selections.inverter?.quantity);
  push("Mounting Structure", selections.structure?.option, selections.structure?.quantity);
  push("Walkway", selections.walkway?.option, selections.walkway?.quantity);
  push("Walkway Railing", selections.railing?.option, selections.railing?.quantity);
  push("Ladder", selections.ladder?.option, selections.ladder?.quantity);
  push("Inverter Protection", selections.cover?.option, selections.cover?.quantity);
  push("Sprinkler System", selections.sprinkler?.option, selections.sprinkler?.quantity);

  const baseSystem = lines.reduce((sum, l) => sum + l.amount, 0);

  /*
   * Flat and per-unit add-ons are priced first, so percentage add-ons (solar
   * insurance) can be charged against a settled project value. Without the
   * split, two percentage items would each be charged on a base that included
   * the other, and the order they were added would change the total.
   */
  const addOnLines = [];
  const fixedAddOns = addOns.filter((a) => a.option?.pricingUnit !== "percent");
  const percentAddOns = addOns.filter((a) => a.option?.pricingUnit === "percent");

  for (const { option, quantity } of fixedAddOns) {
    const amount = priceOption(option, { capacityKW: kW, quantity });
    if (amount > 0) addOnLines.push({ name: option.name, amount, unit: option.pricingUnit, quantity });
  }

  const valueForPercent = baseSystem + addOnLines.reduce((s, l) => s + l.amount, 0);
  for (const { option } of percentAddOns) {
    const amount = priceOption(option, { base: valueForPercent });
    if (amount > 0) addOnLines.push({ name: option.name, amount, unit: option.pricingUnit });
  }

  const addOnsTotal = addOnLines.reduce((sum, l) => sum + l.amount, 0);

  const c = config.charges || {};
  const extraCharges = [
    { name: "Transportation", amount: Number(c.transportation) || 0 },
    { name: "Installation", amount: Number(c.installation) || 0 },
    { name: "Delivery", amount: Number(c.delivery) || 0 },
    { name: "MSEDCL Charges", amount: Number(c.msedclCharges) || 0 },
    { name: "Extra Material", amount: Number(c.extraMaterial) || 0 },
    { name: "Site-Specific Charges", amount: Number(c.siteSpecific) || 0 },
  ].filter((l) => l.amount > 0);

  const chargesTotal = extraCharges.reduce((sum, l) => sum + l.amount, 0);

  const discounts = [
    { name: "Discount", amount: Number(c.discount) || 0 },
    { name: "Special Discount", amount: Number(c.specialDiscount) || 0 },
  ].filter((l) => l.amount > 0);

  const discountTotal = discounts.reduce((sum, l) => sum + l.amount, 0);

  // Discounts come off before tax, so the customer isn't taxed on money they
  // were never charged.
  const taxable = Math.max(0, baseSystem + addOnsTotal + chargesTotal - discountTotal);
  const gstPercent = Number(c.gstPercent) || 0;
  const gst = (taxable * gstPercent) / 100;
  const total = taxable + gst;

  /*
   * Subsidy comes off the GST-inclusive total, not the taxable base: it is
   * reimbursed against what the customer actually paid, and is not a discount
   * on the sale, so it must not reduce the tax charged.
   */
  /*
   * Capped at the project total, and withheld until a system actually exists.
   *
   * Without the cap, an empty configuration showed ₹43,244 of fixed charges
   * against a ₹78,000 subsidy and reported an effective cost of ₹0 — a free
   * solar system, before the customer had chosen anything. A subsidy also
   * cannot in reality exceed what was spent, so the cap is right regardless.
   */
  const subsidy = baseSystem > 0 ? Math.min(subsidyFor(config, kW, propertyType), total) : 0;
  const netPayable = Math.max(0, total - subsidy);

  return {
    capacityKW: kW,
    propertyType,
    lines,
    baseSystem,
    addOnLines,
    addOnsTotal,
    extraCharges,
    chargesTotal,
    discounts,
    discountTotal,
    taxable,
    gstPercent,
    gst,
    total,
    subsidy,
    netPayable,
    // Payback is measured against what they actually part with.
    savings: savingsFor(config, kW, netPayable),
  };
};

/** ₹ formatting in the Indian numbering system (lakh/crore grouping). */
export const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(amount) || 0));
