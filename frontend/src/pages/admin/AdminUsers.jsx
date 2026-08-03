import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaUserShield } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";

const ROLES = ["super_admin", "admin", "editor", "employee"];
const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  employee: "Employee",
};

const fetchAdminUsers = async () => (await api.get("/auth/users")).data;

/**
 * Admin team screen. Every admin-panel role can SEE who has access (so the
 * team is transparent), but only super_admin can add or remove members —
 * enforced server-side in backend/routes/authRoutes.js, not just hidden here.
 */
const AdminUsers = () => {
  const [showForm, setShowForm] = useState(false);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: "admin" },
  });

  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAdminUsers });
  const isSuperAdmin = currentUser?.role === "super_admin";
  const seatsFull = data ? data.seatsRemaining === 0 : false;

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/auth/register", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin added");
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not add admin"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin removed");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not remove admin"),
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-display font-bold text-2xl text-navy">Admin Team</h1>
          {isSuperAdmin && (
            <button
              onClick={() => setShowForm((prev) => !prev)}
              disabled={seatsFull && !showForm}
              className="btn-primary !py-2.5 !px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus /> {showForm ? "Cancel" : "Add Admin"}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-8">
          {data ? `${data.count} of ${data.seatLimit} admin seats used` : "Loading seats…"}
          {seatsFull && " — remove someone before adding a new admin."}
        </p>

        {showForm && isSuperAdmin && (
          <form onSubmit={handleSubmit((f) => createMutation.mutate(f))} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="section-label">Full Name</label>
              <input {...register("name", { required: "Required" })} className="input-field mt-1" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="section-label">Email</label>
              <input type="email" {...register("email", { required: "Required" })} className="input-field mt-1" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="section-label">Temporary Password</label>
              <input
                type="password"
                {...register("password", { required: "Required", minLength: { value: 8, message: "At least 8 characters" } })}
                className="input-field mt-1"
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Share this with them — they should change it after first login.</p>
            </div>
            <div>
              <label className="section-label">Role</label>
              <select {...register("role")} className="input-field mt-1">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Saving..." : "Add Admin"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading && <p className="p-6 text-gray-400 text-sm">Loading team…</p>}
          {data?.data?.map((u) => (
            <div key={u._id} className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-full bg-navy/5 text-navy flex items-center justify-center shrink-0">
                  <FaUserShield />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-navy truncate">
                    {u.name}
                    {u._id === currentUser?._id && <span className="text-xs text-gray-400 font-normal"> (you)</span>}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy/5 text-navy">
                  {ROLE_LABELS[u.role] || u.role}
                </span>
                <span className="text-xs text-gray-400 hidden sm:block">
                  {u.lastLogin ? `Last login ${new Date(u.lastLogin).toLocaleDateString()}` : "Never logged in"}
                </span>
                {isSuperAdmin && u._id !== currentUser?._id && (
                  <button
                    onClick={() => deleteMutation.mutate(u._id)}
                    aria-label={`Remove ${u.name}`}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
