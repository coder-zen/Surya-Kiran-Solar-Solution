import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-gradient px-4">
      <div className="glass-card !bg-white/95 p-8 w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl text-navy text-center mb-1">Admin Login</h1>
        <p className="text-sm text-gray-500 text-center mb-6">SK Solar Solutions</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register("email", { required: true })} type="email" placeholder="Email" className="w-full rounded-lg border border-gray-200 px-4 py-3" />
          <input {...register("password", { required: true })} type="password" placeholder="Password" className="w-full rounded-lg border border-gray-200 px-4 py-3" />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-center mt-6">
          <Link to="/admin/forgot-password" className="text-solar-orange font-semibold">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
