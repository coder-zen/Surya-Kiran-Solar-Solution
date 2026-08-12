import { lazy, Suspense } from "react";
import SeoHead from "../components/common/SeoHead";
import SectionHeading from "../components/common/SectionHeading";
import Hero from "../components/home/Hero";
import AboutSection from "../components/home/AboutSection";
import ServicesGrid from "../components/home/ServicesGrid";
import WhyChooseUs from "../components/home/WhyChooseUs";
import StatsSection from "../components/home/StatsSection";
import FeaturedProjects from "../components/home/FeaturedProjects";
import VideoTestimonials from "../components/home/VideoTestimonials";
import Testimonials from "../components/home/Testimonials";
import Brands from "../components/home/Brands";
import FAQSection from "../components/home/FAQSection";
import ContactSection from "../components/home/ContactSection";
import ExitIntentPopup from "../components/common/ExitIntentPopup";

/*
 * Leaflet and react-leaflet are the heaviest dependency on the public site, and
 * this map sits well below the fold — but a static import put them in the eager
 * homepage chunk, so every visitor paid for them before the hero could paint.
 * Split out, they load alongside the page instead of ahead of it.
 */
const ProjectMap = lazy(() => import("../components/home/ProjectMap"));

/*
 * Mirrors ProjectMap's own frame exactly — same section padding, same heading,
 * same h-[550px] shell and same overlay copy as its isLoading state — so the
 * swap from placeholder to real map is invisible and shifts nothing.
 */
const ProjectMapFallback = () => (
  <section className="py-24 bg-white">
    <div className="container-custom">
      <SectionHeading
        eyebrow="Our Reach"
        title="Explore Our Projects Across Maharashtra"
        subtitle="Serving all 36 districts of Maharashtra — zoom in and click a marker to see project details."
      />
      <div className="mt-14 rounded-3xl overflow-hidden shadow-premium border border-gray-100 h-[550px] relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-400">Loading project map…</p>
        </div>
      </div>
    </div>
  </section>
);

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
    <Suspense fallback={<ProjectMapFallback />}>
      <ProjectMap />
    </Suspense>
    <VideoTestimonials />
    <Testimonials />
    <Brands />
    <FAQSection />
    <ContactSection />
    <ExitIntentPopup />
  </>
);

export default Home;
