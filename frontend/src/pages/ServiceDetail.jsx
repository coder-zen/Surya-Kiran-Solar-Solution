import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaCheckCircle } from "react-icons/fa";
import api from "../config/api";
import EnquiryModal from "../components/common/EnquiryModal";
import SeoHead from "../components/common/SeoHead";
import JsonLd from "../components/common/JsonLd";
import { COMPANY } from "../config/constants";
import { SITE_URL } from "../config/seo";
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
        <p className="text-gray-500 dark:text-gray-300">
          This service page hasn't been added to the database yet — add it from the admin panel,
          or run the seed script for sample data.
        </p>
        <Link to="/services" className="btn-navy inline-flex mt-6">Back to Services</Link>
      </div>
    );
  }

  /*
   * Service + BreadcrumbList for each of the 14 service pages. Service tells
   * Google what is offered and where, which is what qualifies these pages for
   * the local service results rather than plain blue links. BreadcrumbList
   * replaces the raw URL under the title with "Home › Services › <name>".
   *
   * FAQs are added as a separate FAQPage block only when the service actually
   * has them — marking up questions that aren't on the page is a manual-action
   * risk, not just a wasted opportunity.
   */
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.fullDescription || service.shortDescription,
    serviceType: service.title,
    url: `${SITE_URL}/services/${slug}`,
    ...(service.images?.length ? { image: service.images } : {}),
    provider: {
      "@type": "RoofingContractor",
      name: COMPANY.name,
      telephone: COMPANY.phoneRaw,
      url: SITE_URL,
    },
    areaServed: { "@type": "State", name: "Maharashtra" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: service.title, item: `${SITE_URL}/services/${slug}` },
    ],
  };

  const serviceFaqSchema = service.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: service.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <SeoHead
        title={service.title}
        path={`/services/${slug}`}
        description={service.shortDescription}
      />
      <JsonLd id="service-schema" data={serviceSchema} />
      <JsonLd id="service-breadcrumb-schema" data={breadcrumbSchema} />
      <JsonLd id="service-faq-schema" data={serviceFaqSchema} />

      <section className="pt-32 pb-16 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl font-display font-bold">{service.title}</h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">{service.shortDescription}</p>
          <button onClick={() => setQuoteOpen(true)} className="btn-primary mt-8">Get Free Quote</button>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-navy">
        <div className="container-custom grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="section-heading !text-2xl mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
                          <p className="font-semibold text-navy dark:text-white">{p.title}</p>
                          {p.description && <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">{p.description}</p>}
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
                    <li key={b} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
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
                      className="w-full h-40 object-cover rounded-xl bg-gray-100 dark:bg-navy-light"
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
                    <div key={f.question} className="border-b border-gray-100 dark:border-white/10 pb-4">
                      <p className="font-semibold text-navy dark:text-white">{f.question}</p>
                      <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="glass-card !bg-gray-50 p-6 h-fit sticky top-24">
            <h3 className="font-display font-semibold text-lg text-navy dark:text-white mb-3">Interested in {service.title}?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">Get a free, no-obligation quote from our solar experts.</p>
            <button onClick={() => setQuoteOpen(true)} className="btn-primary w-full">Request a Quote</button>
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} source="service_page" />
    </>
  );
};

export default ServiceDetail;
