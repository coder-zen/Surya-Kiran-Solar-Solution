import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import api from "../../config/api";
import SectionHeading from "../common/SectionHeading";

const fetchFAQs = async () => {
  const { data } = await api.get("/faqs").catch(() => ({ data: { data: [] } }));
  return data.data;
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const { data: faqs } = useQuery({ queryKey: ["faqs"], queryFn: fetchFAQs, retry: false });

  const items = faqs?.length
    ? faqs
    : [
        { question: "How much subsidy is available for residential solar?", answer: "Subsidy amounts vary by system size under the PM Surya Ghar scheme — see our Government Subsidy page for current figures." },
        { question: "How long does installation take?", answer: "Most residential systems are installed within 3-7 days after approvals are finalized." },
        { question: "Do you provide after-installation support?", answer: "Yes — our AMC plans cover cleaning, monitoring, and priority breakdown support." },
      ];

  return (
    <section className="py-24 bg-white">
      <div className="container-custom max-w-3xl">
        <SectionHeading eyebrow="Frequently Asked Questions" title="Have Questions? We've Got Answers" />
        <div className="mt-12 space-y-4">
          {items.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-5 text-left font-display font-semibold text-navy"
              >
                {faq.question}
                <FaChevronDown className={`transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
