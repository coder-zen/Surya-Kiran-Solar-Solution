import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import EnquiryModal from "../components/common/EnquiryModal";

const eligibility = [
  "Indian residential property owner with a suitable rooftop",
  "Valid electricity connection in the applicant's name",
  "System installed by an MNRE-empanelled vendor (we are empanelled)",
];

const documents = ["Aadhaar Card", "Latest Electricity Bill", "Property Ownership Proof", "Bank Account Details for DBT"];

const GovernmentSubsidy = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <>
      <Helmet><title>Government Subsidy | Surya Kiran Solar Solution</title></Helmet>
      <section className="pt-32 pb-16 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">Government Solar Subsidy</h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Understand your eligibility under India's PM Surya Ghar rooftop subsidy scheme.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-14">
          <div>
            <h2 className="section-heading !text-2xl mb-4">Eligibility</h2>
            <ul className="space-y-3">
              {eligibility.map((e) => (
                <li key={e} className="flex items-start gap-2 text-gray-600">
                  <FaCheckCircle className="text-solar-orange mt-1 shrink-0" /> {e}
                </li>
              ))}
            </ul>

            <h2 className="section-heading !text-2xl mt-10 mb-4">Documents Required</h2>
            <ul className="space-y-3">
              {documents.map((d) => (
                <li key={d} className="flex items-start gap-2 text-gray-600">
                  <FaCheckCircle className="text-solar-orange mt-1 shrink-0" /> {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card !bg-gray-50 p-8 h-fit">
            <h3 className="font-display font-semibold text-xl text-navy mb-3">Not Sure How Much You'll Save?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Our team will calculate your exact subsidy eligibility and net cost after subsidy —
              free of charge.
            </p>
            <button onClick={() => setQuoteOpen(true)} className="btn-primary w-full">Check My Eligibility</button>
            <p className="text-xs text-gray-400 mt-4">
              Note: subsidy amounts and slabs are periodically revised by the government. Figures
              on this page are indicative — our team confirms the latest applicable rate at the
              time of your application.
            </p>
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} source="other" />
    </>
  );
};

export default GovernmentSubsidy;
