import { Helmet } from "react-helmet-async";
import ServicesGrid from "../components/home/ServicesGrid";

const Services = () => (
  <>
    <Helmet><title>Our Services | Surya Kiran Solar Solution</title></Helmet>
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
