import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

const ChangePasswordForm = ({ onDone }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password updated");
      reset();
      onDone();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-3 gap-4 mt-4">
      <div>
        <label className="section-label">Current Password</label>
        <input type="password" {...register("currentPassword", { required: "Required" })} className="input-field mt-1" />
        {errors.currentPassword && <p className="text-sm text-red-500 mt-1">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="section-label">New Password</label>
        <input type="password" {...register("newPassword", { required: "Required", minLength: { value: 8, message: "At least 8 characters" } })} className="input-field mt-1" />
        {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>}
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Saving..." : "Update Password"}
        </button>
      </div>
    </form>
  );
};

const ChangeEmailForm = ({ onDone }) => {
  const { refreshUser } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ currentPassword, newEmail }) => {
    try {
      const { data } = await api.put("/auth/change-email", { currentPassword, newEmail });
      toast.success(data.message);
      reset();
      await refreshUser(); // so the header/user context shows the new address
      onDone();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update email");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-3 gap-4 mt-4">
      <div>
        <label className="section-label">Current Password</label>
        <input type="password" {...register("currentPassword", { required: "Required" })} className="input-field mt-1" />
        {errors.currentPassword && <p className="text-sm text-red-500 mt-1">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="section-label">New Email</label>
        <input type="email" {...register("newEmail", { required: "Required" })} className="input-field mt-1" />
        {errors.newEmail && <p className="text-sm text-red-500 mt-1">{errors.newEmail.message}</p>}
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Saving..." : "Update Email"}
        </button>
      </div>
    </form>
  );
};

const AccountSecurityCard = () => {
  const [panel, setPanel] = useState(null); // null | "password" | "email"
  const { user } = useAuth();

  const toggle = (name) => setPanel((prev) => (prev === name ? null : name));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-10">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="font-display font-semibold text-navy">Account Security</h3>
          <p className="text-xs text-gray-400 mt-0.5">Signed in as {user?.email}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => toggle("email")} className="text-sm text-solar-orange font-semibold">
            {panel === "email" ? "Cancel" : "Change Email"}
          </button>
          <button onClick={() => toggle("password")} className="text-sm text-solar-orange font-semibold">
            {panel === "password" ? "Cancel" : "Change Password"}
          </button>
        </div>
      </div>
      {panel === "password" && <ChangePasswordForm onDone={() => setPanel(null)} />}
      {panel === "email" && <ChangeEmailForm onDone={() => setPanel(null)} />}
    </div>
  );
};

/**
 * Admin dashboard shell. This is a functional starting point wired to real
 * endpoints (leads count, projects count) — build out dedicated CRUD screens
 * per module (Projects, Services, Gallery, Blogs, etc.) as separate routes
 * under /admin/* following the same pattern as AdminLogin/AdminDashboard.
 */
const fetchLeads = async () => (await api.get("/enquiries")).data.data;
const fetchProjects = async () => (await api.get("/projects")).data.data;

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data: leads } = useQuery({ queryKey: ["admin-leads"], queryFn: fetchLeads, retry: false });
  const { data: projects } = useQuery({ queryKey: ["admin-projects"], queryFn: fetchProjects, retry: false });

  // Mirrors LEAD_STAGES in backend/models/Enquiry.js — the API normalizes any
  // legacy pre-pipeline values before they reach here.
  const leadsByStatus = ["Enquiry Received", "Pending", "Converted", "Project In Progress", "Completed", "Rejected"].map(
    (status) => ({
      status,
      count: leads?.filter((l) => l.status === status).length || 0,
    })
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-2xl text-navy">Welcome, {user?.name || "Admin"}</h1>
        </div>

        <AccountSecurityCard />

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
            <p className="text-3xl font-display font-bold text-navy">
              {leads?.filter((l) => l.status === "Enquiry Received").length ?? "—"}
            </p>
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
