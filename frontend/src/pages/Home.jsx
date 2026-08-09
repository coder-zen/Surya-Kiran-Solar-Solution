import SeoHead from "../components/common/SeoHead";
import Hero from "../components/home/Hero";
import AboutSection from "../components/home/AboutSection";
import ServicesGrid from "../components/home/ServicesGrid";
import WhyChooseUs from "../components/home/WhyChooseUs";
import StatsSection from "../components/home/StatsSection";
import FeaturedProjects from "../components/home/FeaturedProjects";
import ProjectMap from "../components/home/ProjectMap";
import VideoTestimonials from "../components/home/VideoTestimonials";
import Testimonials from "../components/home/Testimonials";
import Brands from "../components/home/Brands";
import FAQSection from "../components/home/FAQSection";
import ContactSection from "../components/home/ContactSection";
import ExitIntentPopup from "../components/common/ExitIntentPopup";

const Home = () => (
  <>
    <SeoHead
      title="On-Grid Solar Rooftop EPC Company in Pune"
      path="/"
      description="SK Solar Solutions designs, supplies, installs and commissions on-grid rooftop solar power plants for homes, businesses and institutions across all districts of Maharashtra. Get a free solar quote today."
    />

    <Hero />
    <AboutSection />
    <ServicesGrid />
    <WhyChooseUs />
    <StatsSection />
    <FeaturedProjects />
    <ProjectMap />
    <VideoTestimonials />
    <Testimonials />
    <Brands />
    <FAQSection />
    <ContactSection />
    <ExitIntentPopup />
  </>
);

export default Home;
