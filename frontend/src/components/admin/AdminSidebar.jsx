import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaSolarPanel, FaTools, FaImages, FaBlog, FaEnvelope,
  FaSignOutAlt, FaUsers, FaBriefcase, FaCommentDots, FaTags,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

/** Shared admin nav shell — extracted from AdminDashboard so every /admin/* screen follows the same pattern. */
const navItems = [
  { icon: FaTachometerAlt, label: "Dashboard", path: "/admin/dashboard" },
  { icon: FaSolarPanel, label: "Projects", path: "/admin/projects" },
  { icon: FaTools, label: "Services", path: "/admin/services" },
  { icon: FaImages, label: "Gallery", path: "/admin/gallery" },
  { icon: FaBlog, label: "Blog", path: "/admin/blog" },
  { icon: FaTags, label: "Pricing", path: "/admin/pricing" },
  { icon: FaCommentDots, label: "Testimonials", path: "/admin/testimonials" },
  { icon: FaEnvelope, label: "Leads / Enquiries", path: "/admin/leads" },
  { icon: FaBriefcase, label: "Careers", path: "/admin/careers" },
  { icon: FaUsers, label: "Users", path: "/admin/users" },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 bg-navy-dark text-white p-6 hidden md:block shrink-0">
      <h2 className="font-display font-bold text-lg mb-8">SK Solar Admin</h2>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${isActive ? "bg-white/10 text-solar-yellow" : "text-gray-300 hover:bg-white/5"}`
            }
          >
            <item.icon /> {item.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 mt-8 text-sm text-gray-300 hover:text-red-400">
        <FaSignOutAlt /> Logout {user?.name ? `(${user.name})` : ""}
      </button>
    </aside>
  );
};

export default AdminSidebar;
