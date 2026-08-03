import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../config/api";

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success(data.message);
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-gradient px-4">
      <div className="glass-card !bg-white/95 p-8 w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl text-navy text-center mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your admin email and we'll send you a reset link.
        </p>

        {sent ? (
          <p className="text-sm text-gray-600 text-center">
            If that email is registered, a reset link is on its way. The link expires in 60 minutes.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-gray-200 px-4 py-3"
            />
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-6">
          <Link to="/admin/login" className="text-solar-orange font-semibold">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
