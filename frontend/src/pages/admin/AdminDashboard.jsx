import { useQuery } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaSolarPanel, FaTools, FaImages, FaBlog, FaEnvelope,
  FaSignOutAlt, FaUsers, FaBriefcase,
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";

/**
 * Admin dashboard shell. This is a functional starting point wired to real
 * endpoints (leads count, projects count) — build out dedicated CRUD screens
 * per module (Projects, Services, Gallery, Blogs, etc.) as separate routes
 * under /admin/* following the same pattern as AdminLogin/AdminDashboard.
 */
const navItems = [
  { icon: FaTachometerAlt, label: "Dashboard", path: "/admin/dashboard" },
  { icon: FaSolarPanel, label: "Projects", path: "/admin/projects" },
  { icon: FaTools, label: "Services", path: "/admin/services" },
  { icon: FaImages, label: "Gallery", path: "/admin/gallery" },
  { icon: FaBlog, label: "Blog", path: "/admin/blog" },
  { icon: FaEnvelope, label: "Leads / Enquiries", path: "/admin/leads" },
  { icon: FaBriefcase, label: "Careers", path: "/admin/careers" },
  { icon: FaUsers, label: "Users", path: "/admin/users" },
];

const fetchLeads = async () => (await api.get("/enquiries")).data.data;
const fetchProjects = async () => (await api.get("/projects")).data.data;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: leads } = useQuery({ queryKey: ["admin-leads"], queryFn: fetchLeads, retry: false });
  const { data: projects } = useQuery({ queryKey: ["admin-projects"], queryFn: fetchProjects, retry: false });

  const leadsByStatus = ["New", "Contacted", "Qualified", "Converted", "Lost"].map((status) => ({
    status,
    count: leads?.filter((l) => l.status === status).length || 0,
  }));

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-navy-dark text-white p-6 hidden md:block">
        <h2 className="font-display font-bold text-lg mb-8">Surya Kiran Admin</h2>
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
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-2xl text-navy">Welcome, {user?.name || "Admin"}</h1>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-3xl font-display font-bold text-navy">{leads?.length ?? "—"}</p>
            <p className="text-sm text-gray-500 mt-1">Total Leads</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-3xl font-display font-bold text-navy">{projects?.length ?? "—"}</p>
            <p className="text-sm text-gray-500 mt-1">Total Projects</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-3xl font-display font-bold text-navy">{leads?.filter((l) => l.status === "New").length ?? "—"}</p>
            <p className="text-sm text-gray-500 mt-1">New Leads (Unactioned)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-navy mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leadsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF7A00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          This dashboard shell is wired to real /api/enquiries and /api/projects endpoints. Build
          dedicated CRUD pages for each module (Projects, Services, Gallery, Blog, Careers, Users,
          Settings) following the same component pattern.
        </p>
      </main>
    </div>
  );
};

export default AdminDashboard;
