const mongoose = require("mongoose");

/**
 * Singleton document backing the public /pricing page. Mirrors the structure
 * that page already renders (hero copy, component spec table, cost breakdown,
 * payment schedule, terms) so making it editable loses none of the existing
 * content — see frontend/src/pages/Pricing.jsx.
 *
 * Kept as one document rather than a collection of "packages" because the page
 * is a single worked example of a real quotation, not a tier comparison.
 */
const labelValueSchema = new mongoose.Schema({ label: String, value: String }, { _id: false });

/**
 * The content the /pricing page shipped with, used as schema defaults so the
 * singleton self-populates on first read — the public page is never blank and
 * the admin form opens pre-filled with the real quotation rather than empty.
 */
const DEFAULT_SPECS = [
  { label: "Solar PV Modules", value: "IEC & MNRE approved, IP65 rated, Monocrystalline TOPCon, 535–630 Wp" },
  { label: "Panel Make", value: "Waaree / Adani / Australian Premium Solar / UTL / Novasys" },
  { label: "Panel Warranty", value: "25 years power generation warranty — min. 90% output up to 10 years, 84% up to 25 years" },
  { label: "Solar On-Grid Inverter", value: "3.3kW capacity, single phase, built-in GPRS/Wi-Fi monitoring, IEC & MNRE certified, IP65 rated" },
  { label: "Inverter Make", value: "Growatt / K-Solar / Waaree / Sunsathi / UTL / Solaire" },
  { label: "Inverter Warranty", value: "10 years standard (up to 25 years optional, extra charges apply)" },
  { label: "AC Distribution Box (ACDB)", value: "SK Solar Solutions make, 2 years warranty" },
  { label: "DC Distribution Box (DCDB)", value: "Havells make, 2 years warranty" },
  { label: "Mounting Structure", value: "Apollo GI galvanized elevated structure, designed as per wind load standards" },
  { label: "Balance of System (BOS)", value: "Cables, AJB, ACDB, DCDB, cable trays, SS fasteners, MC4 connectors, lugs — 5 years workmanship warranty" },
  { label: "Earthing Kit", value: "Copper rod strip (20×3mm), Make: U Protect Earthing" },
  { label: "Lightning Arrestor", value: "ESE type, 120m radius protection" },
  { label: "AC & DC Cable", value: "Polycab / Havells" },
  { label: "Installation, Commissioning & Transportation", value: "Included" },
  { label: "Net Metering & Generation Meter", value: "Included, as per MSEDCL rules" },
  { label: "Load Extension", value: "Included, up to 3kW" },
  { label: "Fire Extinguisher & Safety Kit", value: "Included" },
];

const DEFAULT_COST = [
  { label: "Cost per kW (base price, excluding GST)", value: "₹60,000 / kW" },
  { label: "System capacity", value: "15 kW" },
  { label: "Government subsidy applied", value: "₹0" },
];

const DEFAULT_PAYMENT = [
  { stage: "Advance — Purchase Order & commercial approval", pct: "20%" },
  { stage: "On material delivery & start of installation (excl. panels/inverter)", pct: "60%" },
  { stage: "At net meter installation & system commissioning", pct: "20%" },
];

const DEFAULT_TERMS = [
  "Prices quoted are valid for 15 working days from the date of issue of quotation.",
  "Material delivery within 2 weeks of confirmed Purchase Order; installation & commissioning within 2–3 weeks of delivery, subject to MSEDCL net-metering approval.",
  "Overall timeline is approximately 4–5 weeks from net meter installation, subject to authority approvals.",
  "Quoted price covers standard installation — any additional civil, structural or site-specific work is charged separately at actuals.",
  "GST and applicable taxes are charged as per Government of India rules prevailing at the time of billing.",
  "Applicable subsidy, if any, is strictly as per Government policy in force at the time of application and disbursement.",
  "Quotation is based on current market rates — significant increases in raw material, transport or tax costs after the quotation date may revise the final project cost.",
];

const pricingSchema = new mongoose.Schema(
  {
    // Hero
    eyebrow: { type: String, default: "Sample Project Pricing" },
    headline: { type: String, default: "15kW On-Grid Rooftop Solar Package" },
    intro: {
      type: String,
      default:
        "A real component specification and price breakdown from one of our recent on-grid rooftop installations — base rate ₹60,000 per kW. Every site is different, so we always confirm final pricing after a free site survey.",
    },

    // Component specification table
    specs: { type: [labelValueSchema], default: () => DEFAULT_SPECS },

    // Cost breakdown list
    costBreakdown: { type: [labelValueSchema], default: () => DEFAULT_COST },

    /**
     * Optional caveat rendered in the amber warning box. Left editable because
     * indicative pricing needs to stay clearly indicative — actual installation
     * cost depends on a site survey (roof condition, access, local labour).
     */
    priceNote: {
      type: String,
      default:
        "The source quotation lists two different final totals for this 15kW package (₹9,00,000 in the pricing table vs. ₹5,10,000 in the ROI table). This needs to be confirmed before publishing a final number — contact our team for the verified current price for your exact requirement.",
    },

    paymentSchedule: {
      type: [new mongoose.Schema({ stage: String, pct: String }, { _id: false })],
      default: () => DEFAULT_PAYMENT,
    },

    terms: { type: [String], default: () => DEFAULT_TERMS },

    /** Closing disclaimer under the terms list. */
    disclaimer: {
      type: String,
      default:
        "Pricing shown is a real sample from a completed project quotation and is indicative only. Your final quote depends on roof type, sanctioned load, site accessibility and current market rates for panels, inverters and steel — request a free site survey for an exact price.",
    },
  },
  { timestamps: true }
);

/**
 * Always operates on a single document — creates it on first read so the admin
 * screen and public page never have to handle a missing record.
 */
pricingSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model("Pricing", pricingSchema);
