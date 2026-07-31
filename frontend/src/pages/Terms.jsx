import SeoHead from "../components/common/SeoHead";

const sections = [
  {
    title: "1. Validity of Offer",
    body: "Prices quoted in any SK Solar Solutions proposal are valid for a period of 15 working days from the date of issue of the quotation, unless stated otherwise.",
  },
  {
    title: "2. Delivery, Installation & Commissioning",
    body: "Material delivery is completed within 2 weeks from confirmation of the Purchase Order and finalized commercial terms. Installation and commissioning is completed within 2–3 weeks from material delivery, subject to approval of the Net Metering proposal by MSEDCL. The overall timeline is approximately 4–5 weeks from net meter installation, subject to authority approvals, and the client is kept informed throughout the process.",
  },
  {
    title: "3. Project Documentation",
    body: "The complete project file, including relevant documents and reports, is handed over to the client at the time of project handover.",
  },
  {
    title: "4. Extra / Additional Works",
    body: "Quoted prices apply to standard installation. Any additional civil, structural, or site-specific work required is charged separately at actuals.",
  },
  {
    title: "5. Taxes & GST",
    body: "GST and other applicable taxes are charged as per Government of India rules and regulations prevailing at the time of billing.",
  },
  {
    title: "6. Force Majeure",
    body: "SK Solar Solutions is not held responsible for delays or non-performance caused by Force Majeure events, including but not limited to floods, droughts, earthquakes, fires, heavy rainfall, cyclones, epidemics, or any other natural or unforeseen circumstances beyond control.",
  },
  {
    title: "7. Subsidy Clause",
    body: "Applicable subsidy amounts, if any, are strictly as per Government policies and guidelines in force at the time of application and disbursement. Any variation in subsidy rules is binding on the client.",
  },
  {
    title: "8. Client Scope of Work",
    body: "The client is responsible for: providing adequate and safe storage space at site for panels, mounting structures, inverter and BOS materials; providing or arranging the main distribution/LT panel if required; providing stable internet connectivity for inverter monitoring; providing temporary power and water for installation and testing; and furnishing ownership documents, identity proofs, electricity bills and permissions required for MSEDCL net-metering and liaisoning. Any delay in the above provisions may impact the project execution timeline.",
  },
  {
    title: "9. Ownership & Payment Default",
    body: "The system remains the property of the company until full payment is cleared. The company reserves full rights to repossess or deactivate the system in case of payment default.",
  },
  {
    title: "10. Market Rate Fluctuations",
    body: "Quotations are based on current market rates. Any significant increase in the cost of raw materials (solar modules, inverter, structure, cables, etc.), transportation, or changes in government taxes/duties after the date of quotation is borne by the client, and the final project cost may be revised accordingly at the time of execution.",
  },
  {
    title: "11. Website Use",
    body: "By submitting an enquiry or using our calculators on this website, you agree that estimates provided are indicative only and not a binding offer — final pricing is confirmed in a project-specific written quotation.",
  },
];

const Terms = () => (
  <>
    <SeoHead title="Terms & Conditions" path="/terms" />
    <section className="pt-32 pb-20 bg-white">
      <div className="container-custom max-w-3xl">
        <h1 className="section-heading !text-3xl">Terms &amp; Conditions</h1>
        <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display font-semibold text-lg text-navy">{s.title}</h2>
              <p className="text-gray-600 mt-2 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Terms;
