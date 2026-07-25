import { Helmet } from "react-helmet-async";
import ContactSection from "../components/home/ContactSection";

const Contact = () => (
  <>
    <Helmet><title>Contact Us | Surya Kiran Solar Solution</title></Helmet>
    <section className="pt-32 pb-8 bg-navy-gradient text-white text-center">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-display font-bold">Contact Us</h1>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto">We'd love to hear about your solar project.</p>
      </div>
    </section>
    <ContactSection />
  </>
);

export default Contact;
