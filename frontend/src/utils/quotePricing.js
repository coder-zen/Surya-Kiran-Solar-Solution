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

/**
 * Builds the full breakdown the cart renders.
 *
 * `selections` is keyed by config group — each holds the chosen option and, for
 * quantity-based units, how many. `addOns` is a list of {option, quantity}.
 */
export const buildQuote = ({ config, capacityKW, selections = {}, addOns = [] }) => {
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

  return {
    capacityKW: kW,
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
    total: taxable + gst,
  };
};

/** ₹ formatting in the Indian numbering system (lakh/crore grouping). */
export const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(amount) || 0));
