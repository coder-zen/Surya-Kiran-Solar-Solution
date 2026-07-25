import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import EnquiryModal from "../components/common/EnquiryModal";

const plans = [
  { name: "Basic", price: "₹2,999/yr", features: ["2 Panel Cleanings/Year", "Annual Health Check", "Email Support"] },
  { name: "Standard", price: "₹5,999/yr", features: ["4 Panel Cleanings/Year", "Quarterly Health Check", "Priority Phone Support", "Remote Monitoring"], popular: true },
  { name: "Premium", price: "₹9,999/yr", features: ["Monthly Panel Cleaning", "Monthly Health Check", "24/7 Priority Support", "Remote Monitoring", "Free Minor Repairs"] },
];

const AMCPlans = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <>
      <Helmet><title>AMC Plans | Surya Kiran Solar Solution</title></Helmet>
      <section className="pt-32 pb-16 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">AMC Plans</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">Keep your solar system running at peak performance, year-round.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${plan.popular ? "border-solar-orange shadow-premium scale-105" : "border-gray-100 shadow-sm"}`}
            >
              {plan.popular && <span className="text-xs font-semibold text-solar-orange uppercase">Most Popular</span>}
              <h3 className="font-display font-bold text-2xl text-navy mt-2">{plan.name}</h3>
              <p className="text-3xl font-display font-bold text-navy mt-3">{plan.price}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <FaCheck className="text-solar-orange mt-1 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setQuoteOpen(true)} className={plan.popular ? "btn-primary w-full mt-8" : "btn-navy w-full mt-8"}>
                Book This Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      <EnquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} source="amc" />
    </>
  );
};

export default AMCPlans;
