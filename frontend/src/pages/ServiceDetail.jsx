import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaCheckCircle } from "react-icons/fa";
import api from "../config/api";
import EnquiryModal from "../components/common/EnquiryModal";
import SeoHead from "../components/common/SeoHead";
import { useState } from "react";

const fetchService = async (slug) => {
  const { data } = await api.get(`/services/${slug}`);
  return data.data;
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { data: service, isLoading, isError } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => fetchService(slug),
    retry: false,
  });

  if (isLoading) return <div className="pt-40 pb-20 text-center text-gray-400">Loading service...</div>;

  if (isError || !service) {
    return (
      <div className="pt-40 pb-20 text-center">
        <p className="text-gray-500">
          This service page hasn't been added to the database yet — add it from the admin panel,
          or run the seed script for sample data.
        </p>
        <Link to="/services" className="btn-navy inline-flex mt-6">Back to Services</Link>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={service.title}
        path={`/services/${slug}`}
        description={service.shortDescription}
      />

      <section className="pt-32 pb-16 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl font-display font-bold">{service.title}</h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">{service.shortDescription}</p>
          <button onClick={() => setQuoteOpen(true)} className="btn-primary mt-8">Get Free Quote</button>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="section-heading !text-2xl mb-4">Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              {service.fullDescription || service.shortDescription}
            </p>

            {/* Ordered by the `step` field the admin form assigns on save, not by
                array position, so reordering in the admin panel is respected. */}
            {service.process?.length > 0 && (
              <>
                <h2 className="section-heading !text-2xl mt-10 mb-4">How It Works</h2>
                <ol className="space-y-5">
                  {[...service.process]
                    .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
                    .map((p, i) => (
                      <li key={p.title || i} className="flex gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-white text-sm font-display font-bold">
                          {p.step ?? i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-navy">{p.title}</p>
                          {p.description && <p className="text-gray-500 text-sm mt-1">{p.description}</p>}
                        </div>
                      </li>
                    ))}
                </ol>
              </>
            )}

            {service.benefits?.length > 0 && (
              <>
                <h2 className="section-heading !text-2xl mt-10 mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-gray-600">
                      <FaCheckCircle className="text-solar-orange mt-1 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {service.images?.length > 0 && (
              <>
                <h2 className="section-heading !text-2xl mt-10 mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {service.images.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt={`${service.title} installation`}
                      loading="lazy"
                      className="w-full h-40 object-cover rounded-xl bg-gray-100"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ))}
                </div>
              </>
            )}

            {service.faqs?.length > 0 && (
              <>
                <h2 className="section-heading !text-2xl mt-10 mb-4">FAQs</h2>
                <div className="space-y-4">
                  {service.faqs.map((f) => (
                    <div key={f.question} className="border-b border-gray-100 pb-4">
                      <p className="font-semibold text-navy">{f.question}</p>
                      <p className="text-gray-500 text-sm mt-1">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="glass-card !bg-gray-50 p-6 h-fit sticky top-24">
            <h3 className="font-display font-semibold text-lg text-navy mb-3">Interested in {service.title}?</h3>
            <p className="text-sm text-gray-500 mb-4">Get a free, no-obligation quote from our solar experts.</p>
            <button onClick={() => setQuoteOpen(true)} className="btn-primary w-full">Request a Quote</button>
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} source="service_page" />
    </>
  );
};

export default ServiceDetail;
