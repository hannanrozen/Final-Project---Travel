import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useRedirect } from "../../hooks/useRedirect";
import Logo from "../../assets/icons/Logonavbar.svg";
import authImage from "../../assets/images/auth_image.jpg";

const LoginIndex = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loading, error } = useAuth();
  const { redirectToDashboard } = useRedirect();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      redirectToDashboard();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="w-1/2 fixed left-0 top-0 h-screen bg-cover bg-center bg-no-repeat hidden lg:flex flex-col justify-between p-8"
        style={{ backgroundImage: `url(${authImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src={Logo} alt="Explorea Logo" className="h-10" />
          </Link>
        </div>

        {/* Main content centered */}
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-4xl font-bold mb-4">
            YOUR NEXT ADVENTURE AWAITS!
          </h1>
          <p className="text-lg mb-6 leading-relaxed">
            Book your ideal and pick whether it's escape, and pick up where you
            left off. Whether it's mountains, beaches, or city lights.
          </p>
          <p className="text-base">Your journey starts here.</p>
        </div>

        {/* Bottom space for visual balance */}
        <div className="relative z-10"></div>
      </div>

      {/* Right Side - Scrollable Login Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen bg-white">
        <div className="h-screen overflow-y-auto flex items-center justify-center p-8">
          <div className="w-full max-w-md py-8">
            {/* Welcome Back Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                WELCOME BACK !
              </h2>
              <p className="text-slate-600">
                Welcome back! Please enter your details
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-slate-600">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-sky-600 hover:text-sky-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-sky-600 hover:text-sky-500 font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginIndex;
