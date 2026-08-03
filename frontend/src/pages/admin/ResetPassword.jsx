import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../config/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      toast.success(data.message);
      navigate("/admin/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-gradient px-4">
      <div className="glass-card !bg-white/95 p-8 w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl text-navy text-center mb-1">Set New Password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Choose a strong password you haven't used before.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("password", {
                required: "Required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
              type="password"
              placeholder="New Password"
              className="w-full rounded-lg border border-gray-200 px-4 py-3"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <input
              {...register("confirmPassword", {
                required: "Required",
                validate: (value) => value === watch("password") || "Passwords don't match",
              })}
              type="password"
              placeholder="Confirm New Password"
              className="w-full rounded-lg border border-gray-200 px-4 py-3"
            />
            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Saving..." : "Reset Password"}
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          <Link to="/admin/login" className="text-solar-orange font-semibold">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
