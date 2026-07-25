import { Helmet } from "react-helmet-async";
import Hero from "../components/home/Hero";
import AboutSection from "../components/home/AboutSection";
import ServicesGrid from "../components/home/ServicesGrid";
import WhyChooseUs from "../components/home/WhyChooseUs";
import StatsSection from "../components/home/StatsSection";
import FeaturedProjects from "../components/home/FeaturedProjects";
import ProjectMap from "../components/home/ProjectMap";
import Testimonials from "../components/home/Testimonials";
import Brands from "../components/home/Brands";
import FAQSection from "../components/home/FAQSection";
import ContactSection from "../components/home/ContactSection";
import ExitIntentPopup from "../components/common/ExitIntentPopup";

const Home = () => (
  <>
    <Helmet>
      <title>Surya Kiran Solar Solution | Premium Solar EPC Company in Maharashtra</title>
      <meta
        name="description"
        content="Trusted Solar EPC solutions for residential, commercial, industrial and government projects across Maharashtra. Get a free solar quote today."
      />
    </Helmet>

    <Hero />
    <AboutSection />
    <ServicesGrid />
    <WhyChooseUs />
    <StatsSection />
    <FeaturedProjects />
    <ProjectMap />
    <Testimonials />
    <Brands />
    <FAQSection />
    <ContactSection />
    <ExitIntentPopup />
  </>
);

export default Home;
