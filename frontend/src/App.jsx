import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Gallery from "./pages/Gallery";
import Products from "./pages/Products";
import Pricing from "./pages/Pricing";
import AMCPlans from "./pages/AMCPlans";
import GovernmentSubsidy from "./pages/GovernmentSubsidy";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Career from "./pages/Career";
import Contact from "./pages/Contact";
import Calculators from "./pages/Calculators";
import LegalNotice from "./pages/LegalNotice";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./pages/admin/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
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
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* TODO: add /admin/projects, /admin/services, /admin/gallery, /admin/blog,
            /admin/leads, /admin/careers, /admin/users — each following the
            AdminDashboard pattern with its own CRUD table + modal form */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
