import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  Upload,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { uploadImage } from "../../api/upload";
import Logo from "../../assets/icons/Logonavbar.svg";
import travelIllustration from "../../assets/images/hero_image.jpg"; // Use your best travel-themed image here
import { commonButtons } from "../../utils/buttonStyles";

const DROPDOWN_ICON = (
  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
);

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordRepeat: "",
    phoneNumber: "",
    role: "user",
    profilePictureUrl: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError("");
    if (formData.password !== formData.passwordRepeat) {
      setRegistrationError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      if (profileImage) {
        setUploadingImage(true);
        const uploadResponse = await uploadImage(profileImage);
        formData.profilePictureUrl = uploadResponse.url;
        setUploadingImage(false);
      }
      const result = await register(formData);
      if (result.success) {
        alert("Registration successful! Please login with your credentials.");
        navigate("/login", { replace: true });
      } else {
        setRegistrationError(
          result.error || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      setRegistrationError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setUploadingImage(false);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Travel Illustration & Tagline */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center">
        <img
          src={travelIllustration}
          alt="Travel illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/70 via-cyan-500/60 to-cyan-300/40 opacity-80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-10">
          <img src={Logo} alt="Explorea Logo" className="h-12 mb-8" />
          <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Start Your Journey
          </h1>
          <p className="text-lg text-gray-100 mb-8 font-medium">
            Sign up now and explore amazing destinations with ease.
          </p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg py-10 px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Create Account
            </h2>
            <p className="text-slate-600">Join us and start your adventure</p>
          </div>

          {registrationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {registrationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Type
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <select
                  name="role"
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
                  value={formData.role}
                  onChange={handleChange}
                  aria-label="Account Type"
                  tabIndex={0}
                  onFocus={(e) => e.target.classList.add("shadow-md")}
                  onBlur={(e) => e.target.classList.remove("shadow-md")}
                >
                  <option value="user">
                    User - Browse and book activities
                  </option>
                  <option value="admin">Admin - Manage the platform</option>
                </select>
                {DROPDOWN_ICON}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Choose "Admin" only if you need to manage content and users
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

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
                  placeholder="Create a password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPasswordRepeat ? "text" : "password"}
                  name="passwordRepeat"
                  required
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.passwordRepeat}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                  tabIndex={0}
                  aria-label={
                    showPasswordRepeat ? "Hide password" : "Show password"
                  }
                >
                  {showPasswordRepeat ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label className="text-sm text-slate-600">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading || uploadingImage}
              className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold rounded-xl shadow transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              {isSubmitting || loading || uploadingImage ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {uploadingImage
                    ? "Uploading Image..."
                    : "Creating Account..."}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </div>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
