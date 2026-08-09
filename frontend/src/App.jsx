import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// Home stays eager — it is the landing page for most visitors, and lazy-loading
// it would only add a round trip before anything paints.
import Home from "./pages/Home";

// Every other public page is split out. They were all bundled into the initial
// chunk, so a visitor who only ever reads the homepage was still downloading
// the subsidy calculator's charting library and the blog's markdown renderer.
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Products = lazy(() => import("./pages/Products"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AMCPlans = lazy(() => import("./pages/AMCPlans"));
const GovernmentSubsidy = lazy(() => import("./pages/GovernmentSubsidy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Career = lazy(() => import("./pages/Career"));
const Contact = lazy(() => import("./pages/Contact"));
const Calculators = lazy(() => import("./pages/Calculators"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages — lazy-loaded so the admin-only bundle (rich text editor, charts)
// is never downloaded by public visitors, who are the vast majority of traffic.
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminHomepage = lazy(() => import("./pages/admin/AdminHomepage"));
const AdminCareers = lazy(() => import("./pages/admin/AdminCareers"));
const ForgotPassword = lazy(() => import("./pages/admin/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/admin/ResetPassword"));

import ProtectedRoute from "./pages/admin/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={<div className="min-h-screen grid place-items-center text-gray-400">Loading…</div>}
      >
      <Routes>
        {/* Public site — shares Navbar/Footer/floating CTAs via Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/products" element={<Products />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/amc-plans" element={<AMCPlans />} />
          <Route path="/government-subsidy" element={<GovernmentSubsidy />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/career" element={<Career />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<LegalNotice />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin panel — no public Navbar/Footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <ProtectedRoute>
              <AdminTestimonials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute>
              <AdminProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute>
              <AdminGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <ProtectedRoute>
              <AdminLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <AdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <ProtectedRoute>
              <AdminBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <ProtectedRoute>
              <AdminPricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/homepage"
          element={
            <ProtectedRoute>
              <AdminHomepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/careers"
          element={
            <ProtectedRoute>
              <AdminCareers />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
