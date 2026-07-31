import SeoHead from "../components/common/SeoHead";
import ContactSection from "../components/home/ContactSection";

const Contact = () => (
  <>
    <SeoHead title="Contact Us" path="/contact" description="Get a free solar quote from SK Solar Solutions — call, WhatsApp or visit us in Manjari Budruk, Pune." />
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
