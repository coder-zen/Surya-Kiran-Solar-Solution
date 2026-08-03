import SeoHead from "../components/common/SeoHead";
import ServicesGrid from "../components/home/ServicesGrid";

const Services = () => (
  <>
    <SeoHead title="Our Services" path="/services" description="Residential, commercial and industrial on-grid rooftop solar EPC services across all districts of Maharashtra — design, supply, installation, net-metering and AMC." />
    <section className="pt-32 pb-12 bg-navy-gradient text-white text-center">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-display font-bold">Our Services</h1>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto">
          End-to-end solar EPC services for every kind of customer.
        </p>
      </div>
    </section>
    <ServicesGrid />
  </>
);

export default Services;
