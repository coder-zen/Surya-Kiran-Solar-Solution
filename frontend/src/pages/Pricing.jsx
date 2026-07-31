import { useState } from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import EnquiryModal from "../components/common/EnquiryModal";
import SeoHead from "../components/common/SeoHead";

const specs = [
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

const costBreakdown = [
  { label: "Cost per kW (base price, with GST)", value: "₹60,000 / kW" },
  { label: "System capacity", value: "15 kW" },
  { label: "GST", value: "13.8% (included in base price, as per Government rule)" },
  { label: "Government subsidy applied", value: "₹0" },
];

const paymentSchedule = [
  { stage: "Advance — Purchase Order & commercial approval", pct: "20%" },
  { stage: "On material delivery & start of installation (excl. panels/inverter)", pct: "60%" },
  { stage: "At net meter installation & system commissioning", pct: "20%" },
];

const terms = [
  "Prices quoted are valid for 15 working days from the date of issue of quotation.",
  "Material delivery within 2 weeks of confirmed Purchase Order; installation & commissioning within 2–3 weeks of delivery, subject to MSEDCL net-metering approval.",
  "Overall timeline is approximately 4–5 weeks from net meter installation, subject to authority approvals.",
  "Quoted price covers standard installation — any additional civil, structural or site-specific work is charged separately at actuals.",
  "GST and applicable taxes are charged as per Government of India rules prevailing at the time of billing.",
  "Applicable subsidy, if any, is strictly as per Government policy in force at the time of application and disbursement.",
  "Quotation is based on current market rates — significant increases in raw material, transport or tax costs after the quotation date may revise the final project cost.",
];

const Pricing = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <>
      <SeoHead
        title="Solar Pricing"
        path="/pricing"
        description="Sample on-grid rooftop solar pricing and component specifications from SK Solar Solutions — see a real 15kW project breakdown and request a free custom quote."
      />

      <section className="pt-32 pb-16 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <p className="section-eyebrow !text-solar-yellow">Sample Project Pricing</p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold">15kW On-Grid Rooftop Solar Package</h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            A real component specification and price breakdown from one of our recent on-grid rooftop
            installations — base rate ₹60,000 per kW. Every site is different, so we always confirm
            final pricing after a free site survey.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom grid lg:grid-cols-5 gap-12">
          {/* Specifications */}
          <div className="lg:col-span-3">
            <h2 className="section-heading !text-2xl mb-6">Technical Component Specifications</h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-base sm:text-sm">
                <tbody>
                  {specs.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-5 py-4 font-semibold text-navy align-top w-2/5">{row.label}</td>
                      <td className="px-5 py-4 text-gray-600 align-top">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost + payment */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card !bg-gray-50 p-7">
              <h3 className="font-display font-semibold text-xl text-navy mb-4">Cost Breakdown</h3>
              <ul className="space-y-3">
                {costBreakdown.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4 text-base sm:text-sm border-b border-gray-200 pb-3">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-semibold text-navy text-right">{row.value}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  The source quotation lists two different final totals for this 15kW package
                  (₹9,00,000 in the pricing table vs. ₹5,10,000 in the ROI table). This needs to be
                  confirmed before publishing a final number — contact our team for the verified
                  current price for your exact requirement.
                </p>
              </div>

              <button onClick={() => setQuoteOpen(true)} className="btn-primary w-full mt-6">
                Get My Exact Quote
              </button>
            </div>

            <div className="glass-card !bg-gray-50 p-7">
              <h3 className="font-display font-semibold text-xl text-navy mb-4">Payment Schedule</h3>
              <ul className="space-y-3">
                {paymentSchedule.map((row) => (
                  <li key={row.stage} className="flex items-start gap-3 text-base sm:text-sm">
                    <FaCheckCircle className="text-solar-orange mt-1 shrink-0" />
                    <span className="text-gray-600 flex-1">{row.stage}</span>
                    <span className="font-semibold text-navy shrink-0">{row.pct}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-3xl">
          <h2 className="section-heading !text-2xl mb-6">Terms & Conditions</h2>
          <ul className="space-y-3">
            {terms.map((t) => (
              <li key={t} className="flex items-start gap-3 text-base sm:text-sm text-gray-600">
                <FaCheckCircle className="text-solar-orange mt-1 shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-6">
            Pricing shown is a real sample from a completed project quotation and is indicative only.
            Your final quote depends on roof type, sanctioned load, site accessibility and current
            market rates for panels, inverters and steel — request a free site survey for an exact price.
          </p>
        </div>
      </section>

      <EnquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} source="other" />
    </>
  );
};

export default Pricing;
