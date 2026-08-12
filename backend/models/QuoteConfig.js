const mongoose = require("mongoose");

/**
 * Backs the customer-facing quotation configurator on /pricing and its admin
 * screen. Every rupee the configurator quotes comes from this document — the
 * requirement is that a rate change never needs a developer, so nothing here
 * may be duplicated as a constant in the frontend.
 *
 * One singleton rather than a collection per option type: the admin edits the
 * whole price list as a single unit, and a configurator render needs all of it
 * at once, so splitting it would mean eight round trips to draw one page.
 */

/** Every pricing basis the requirements call for. */
const PRICING_UNITS = [
  "perWatt", // × capacity in watts   — panel and inverter brands
  "perKW", // × capacity in kW      — structures, per-kW add-ons
  "perKWYear", // × capacity in kW      — annual AMC
  "perUnit", // × quantity            — ladders, cameras, extinguishers
  "perRunningFt", // × length in feet      — walkway, railing, cable tray
  "perSqFt", // × area in sq ft       — maintenance platform
  "fixed", // flat charge
  "percent", // % of project value    — insurance
];

/**
 * Shared shape for every selectable option, whatever the group.
 *
 * `price` is the selling price and is safe to expose. `purchaseCost` is the
 * internal buying price and must never reach a browser — see toCustomerJSON
 * below, which is the only sanctioned way to serialise this for the public
 * endpoint. Margin is deliberately not stored: it is purchaseCost subtracted
 * from price, and keeping one derived number out of the document removes any
 * chance of it being served with stale or contradictory data.
 */
const optionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    pricingUnit: { type: String, enum: PRICING_UNITS, default: "fixed" },
    price: { type: Number, default: 0, min: 0 },
    purchaseCost: { type: Number, default: 0, min: 0 }, // ADMIN ONLY
    note: { type: String, trim: true, default: "" }, // shown to the customer
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    /*
     * Inverters only. The requirement asks the configurator to suggest a
     * compatible inverter for the chosen capacity; leaving both at 0 means
     * "fits any system" so non-inverter options ignore these entirely.
     */
    minCapacityKW: { type: Number, default: 0, min: 0 },
    maxCapacityKW: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

/** Flat charges and deductions applied after the configured line items. */
const chargesSchema = new mongoose.Schema(
  {
    gstPercent: { type: Number, default: 13.8, min: 0 },
    transportation: { type: Number, default: 0, min: 0 },
    installation: { type: Number, default: 0, min: 0 },
    delivery: { type: Number, default: 0, min: 0 },
    msedclCharges: { type: Number, default: 0, min: 0 },
    extraMaterial: { type: Number, default: 0, min: 0 },
    siteSpecific: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    specialDiscount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/*
 * Option names and pricing bases come from the client's requirements document;
 * every price is seeded at 0 on purpose. The names are structure and are safe
 * to ship, but the rates are the client's commercial data — inventing
 * plausible-looking numbers would put invented figures in front of customers
 * and, worse, look filled-in enough that nobody would think to check. Zero
 * quotes zero, which reads as unset. The admin screen flags them.
 */
const opt = (name, pricingUnit, note = "") => ({ name, pricingUnit, price: 0, purchaseCost: 0, note });

const DEFAULT_PANELS = ["Waaree", "Adani", "Australian Premium Solar", "UTL", "Novasys"]
  .map((n, i) => ({ ...opt(n, "perWatt"), order: i }));

const DEFAULT_INVERTERS = ["Growatt", "K-Solar", "Waaree", "Sunsathi", "UTL", "Solaire"]
  .map((n, i) => ({ ...opt(n, "perWatt"), order: i }));

const DEFAULT_STRUCTURES = [
  ["Standard GI", "perKW"], ["Heavy GI", "perKW"], ["Aluminium", "perKW"],
  ["Elevated", "perKW"], ["Designer", "perKW"], ["Customized Heavy", "perKW"],
].map(([n, u], i) => ({ ...opt(n, u), order: i }));

const DEFAULT_WALKWAY = [
  ["No Walkway", "fixed"], ["Standard", "perRunningFt"],
  ["Full", "perRunningFt"], ["Customized", "perRunningFt"],
].map(([n, u], i) => ({ ...opt(n, u), order: i }));

const DEFAULT_RAILING = [
  ["No Railing", "fixed"], ["Single Side", "perRunningFt"],
  ["Double Side", "perRunningFt"], ["Customized", "perRunningFt"],
].map(([n, u], i) => ({ ...opt(n, u), order: i }));

const DEFAULT_LADDER = [
  ["No Ladder", "fixed"], ["Standard", "perUnit"],
  ["Heavy Duty", "perUnit"], ["Customized", "perUnit"],
].map(([n, u], i) => ({ ...opt(n, u), order: i }));

const DEFAULT_COVER = [
  ["No Cover", "fixed"], ["Standard", "perUnit"],
  ["Heavy Duty", "perUnit"], ["Customized", "perUnit"],
].map(([n, u], i) => ({ ...opt(n, u), order: i }));

const DEFAULT_SPRINKLER = [
  ["No Sprinkler", "fixed"], ["Manual", "fixed"],
  ["Automatic", "fixed"], ["Complete Cleaning + Sprinkler", "fixed"],
].map(([n, u], i) => ({ ...opt(n, u), order: i }));

/** The 17 add-ons, with the pricing method the document specifies for each. */
const DEFAULT_ADDONS = [
  ["Solar Inverter Protection Box", "perUnit"],
  ["Solar Panel Water Sprinkler System", "perKW"],
  ["Fire Extinguisher", "perUnit"],
  ["AMC with Cleaning", "perKWYear"],
  ["Solar Security Camera", "perUnit"],
  ["Remote Monitoring + Live Camera", "fixed"],
  ["MSEDCL Load Extension", "fixed"],
  ["MSEDCL Name Change", "fixed"],
  ["Customized Decorative Heavy Structure", "perKW"],
  ["Solar Insurance", "percent"],
  ["Solar Safety Kit", "perUnit"],
  ["Solar Cleaning Brush", "perUnit"],
  ["Pressure Pump / Motor", "perUnit"],
  ["Solar Maintenance Walkway", "perRunningFt"],
  ["Solar Maintenance Platform", "perSqFt"],
  ["Cable Tray & Service Walkway", "perRunningFt"],
  ["Designer Elevated Solar Structure", "perKW"],
].map(([n, u], i) => ({ ...opt(n, u), order: i }));

const quoteConfigSchema = new mongoose.Schema(
  {
    /*
     * Capacity bounds for the customer's kW input. Everything priced perWatt or
     * perKW scales off this, so it is the first thing the configurator asks.
     */
    capacity: {
      minKW: { type: Number, default: 1, min: 0.1 },
      maxKW: { type: Number, default: 100, min: 1 },
      defaultKW: { type: Number, default: 5, min: 0.1 },
      stepKW: { type: Number, default: 0.5, min: 0.1 },
    },

    // ---- the eight configuration steps ----
    panelBrands: { type: [optionSchema], default: DEFAULT_PANELS },
    inverterBrands: { type: [optionSchema], default: DEFAULT_INVERTERS },
    structureTypes: { type: [optionSchema], default: DEFAULT_STRUCTURES },
    walkwayOptions: { type: [optionSchema], default: DEFAULT_WALKWAY },
    railingOptions: { type: [optionSchema], default: DEFAULT_RAILING },
    ladderOptions: { type: [optionSchema], default: DEFAULT_LADDER },
    protectionCoverOptions: { type: [optionSchema], default: DEFAULT_COVER },
    sprinklerOptions: { type: [optionSchema], default: DEFAULT_SPRINKLER },

    // ---- the separate "Add Extra Services" section ----
    addOns: { type: [optionSchema], default: DEFAULT_ADDONS },

    charges: { type: chargesSchema, default: () => ({}) },

    /*
     * Government subsidy, shown as a deduction beneath the quoted total.
     *
     * Slabs rather than a flat figure because PM Surya Ghar pays by system
     * size, and admin-editable rather than hardcoded because the scheme's
     * rates are policy and have already changed once. `residentialOnly`
     * matters: the scheme excludes commercial and institutional rooftops, so
     * quoting it to a factory would overstate their benefit by ₹78,000.
     */
    subsidy: {
      isEnabled: { type: Boolean, default: true },
      label: { type: String, default: "PM Surya Ghar Subsidy" },
      // Highest matching slab wins; anything above the last one gets maxAmount.
      slabs: {
        type: [
          new mongoose.Schema(
            { upToKW: { type: Number, required: true }, amount: { type: Number, default: 0 } },
            { _id: false }
          ),
        ],
        default: () => [
          { upToKW: 1, amount: 30000 },
          { upToKW: 2, amount: 60000 },
          { upToKW: 3, amount: 78000 },
        ],
      },
      maxAmount: { type: Number, default: 78000 },
      residentialOnly: { type: Boolean, default: true },
      note: {
        type: String,
        default: "Subject to eligibility and approval under the national rooftop solar programme.",
      },
    },

    /*
     * Inputs for the savings and payback figures. Generation and tariff vary by
     * region and change with MSEDCL revisions, so they are settings rather than
     * constants — the same reason nothing else here is hardcoded.
     */
    savings: {
      isEnabled: { type: Boolean, default: true },
      unitRateRupees: { type: Number, default: 8 }, // ₹ per kWh billed
      generationPerKWPerDay: { type: Number, default: 4 }, // kWh generated per kW
      systemLifeYears: { type: Number, default: 25 },
    },

    /*
     * Maps a monthly electricity bill to a system size, so the configurator can
     * open with a question the customer can actually answer. Same arithmetic the
     * existing savings calculator uses, lifted into admin control.
     */
    billEstimator: {
      isEnabled: { type: Boolean, default: true },
      offsetPercent: { type: Number, default: 90 }, // share of the bill solar is sized to cover
    },

    terms: {
      warranty: {
        type: String,
        default:
          "25 years panel performance warranty, 10 years inverter warranty, 5 years workmanship warranty on balance of system.",
      },
      quotationValidityDays: { type: Number, default: 15, min: 1 },
      disclaimer: {
        type: String,
        default:
          "This is an indicative estimate generated from current rates. Final pricing is confirmed after a site survey.",
      },
    },

    /** Lets the admin take the configurator down without deleting the rates. */
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Strips every internal costing field, recursively across all option groups.
 *
 * The public endpoint must serve *only* this. Hiding purchase cost in the UI
 * would not be enough — the requirement is that the customer never sees margin
 * "under any circumstance", and an API response is as visible as a page: it is
 * one devtools tab away. Centralising the projection here means a future option
 * group is safe by default rather than safe only if someone remembers.
 */
quoteConfigSchema.methods.toCustomerJSON = function toCustomerJSON() {
  const OPTION_GROUPS = [
    "panelBrands",
    "inverterBrands",
    "structureTypes",
    "walkwayOptions",
    "railingOptions",
    "ladderOptions",
    "protectionCoverOptions",
    "sprinklerOptions",
    "addOns",
  ];

  const doc = this.toObject({ versionKey: false });

  for (const group of OPTION_GROUPS) {
    doc[group] = (doc[group] || [])
      .filter((opt) => opt.isActive) // inactive options aren't offered
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(({ purchaseCost, isActive, order, ...safe }) => safe);
  }

  // Discounts are applied to the total the customer sees, so the amounts are
  // legitimately customer-facing; no cost basis lives on charges.
  return doc;
};

/** Creates the singleton on first read so neither screen ever sees an empty state. */
quoteConfigSchema.statics.getSingleton = async function getSingleton() {
  const existing = await this.findOne();
  if (existing) return existing;
  return this.create({});
};

module.exports = mongoose.model("QuoteConfig", quoteConfigSchema);
module.exports.PRICING_UNITS = PRICING_UNITS;
