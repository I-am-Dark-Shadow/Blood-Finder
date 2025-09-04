import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import api from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: loginUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/users/login", { email, password });
      loginUser(data.user, data.token);
      toast.success(data.message);

      // Redirect based on role
      switch (data.user.role) {
        case "User":
          navigate("/user/dashboard");
          break;
        case "Blood Bank":
          navigate("/blood-bank/dashboard");
          break;
        case "Test Lab":
          navigate("/test-lab/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex flex-col items-center justify-center py-10 px-4">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center gap-2 group mb-6">
        <div className="h-9 w-9 rounded-lg bg-rose-600 text-white grid place-items-center shadow-sm">
          <span className="text-sm font-semibold">BF</span>
        </div>
        <span className="text-slate-800 text-base font-semibold group-hover:text-rose-700 transition">
          Blood Finder
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Welcome Back</h3>
          <p className="text-sm text-slate-600 mt-1">
            Login to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Mail className="h-4 w-4 text-rose-600" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80 backdrop-blur-sm placeholder-slate-400"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Lock className="h-4 w-4 text-rose-600" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80 backdrop-blur-sm placeholder-slate-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white font-medium shadow hover:bg-rose-700 transition disabled:bg-rose-400"
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-rose-600 hover:text-rose-700"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
