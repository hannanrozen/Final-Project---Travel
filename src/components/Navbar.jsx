import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  ShoppingCart,
  Bell,
  LogOut,
  CreditCard,
  Settings,
  MapPin,
  Gift,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getCarts } from "../api/cart";
import NotificationPanel from "./Notification";
import LogoNavbar from "../assets/icons/Footernavbar.svg";

// Example notifications data
const exampleNotifications = [
  {
    id: 1,
    title: "New Promo Available",
    message: "Check out our latest travel deals!",
    unread: true,
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Booking Confirmed",
    message: "Your trip to Bali has been confirmed.",
    unread: false,
    timestamp: new Date().toISOString(),
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = exampleNotifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const fetchCartCount = async () => {
    try {
      const result = await getCarts();
      if (result.success) {
        setCartCount(result.data.data?.length || 0);
      }
    } catch {
      // Silent fail for cart count
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const isActivePath = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinks = [
    { name: "Home", href: "/", icon: null },
    { name: "Activities", href: "/activities", icon: MapPin },
    { name: "Promos", href: "/promos", icon: Gift },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={LogoNavbar} alt="Explorea Logo" className="h-8" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(link.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - Auth & User Menu */}
          <div className="flex items-center space-x-4 relative">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    className="relative p-2 m- text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => setShowNotifications((v) => !v)}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </button>
                  <NotificationPanel
                    open={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    notifications={exampleNotifications}
                  />
                </div>

                {/* User Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu((open) => !open)}
                    className="flex items-center space-x-2 p-2 m-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-haspopup="true"
                    aria-expanded={showUserMenu}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setShowUserMenu((open) => !open);
                      }
                    }}
                  >
                    <img
                      src={
                        user.profilePictureUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || "User"
                        )}&background=6366f1&color=fff&size=32`
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <span className="hidden sm:block text-sm font-medium">
                      {user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Modern Profile Dropdown */}
                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 origin-top-right transform transition-all duration-200 scale-100 opacity-100"
                      tabIndex={-1}
                      role="menu"
                      aria-label="Profile menu"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                        <img
                          src={
                            user.profilePictureUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || "User"
                            )}&background=6366f1&color=fff&size=32`
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-base">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-150 focus:outline-none"
                          role="menuitem"
                        >
                          <User className="w-5 h-5 text-gray-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/my-transactions"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-150 focus:outline-none"
                          role="menuitem"
                        >
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          My Transactions
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-150 focus:outline-none"
                          role="menuitem"
                        >
                          <Settings className="w-5 h-5 text-gray-400" />
                          Settings
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-2" />

                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-150 focus:outline-none"
                        role="menuitem"
                      >
                        <LogOut className="w-5 h-5 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(link.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.name}</span>
                </Link>
              ))}

              {user && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/my-transactions"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>My Transactions</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
