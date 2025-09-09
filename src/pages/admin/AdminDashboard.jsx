import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  MapPin,
  Image,
  Percent,
  CreditCard,
  Receipt,
  Users,
  LogOut,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";
import { getActivities } from "../../api/activity";
import { getPromos } from "../../api/promo";
import { getAllTransactions } from "../../api/transaction";
import { logout } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalPromos: 0,
    pendingTransactions: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [activitiesRes, promosRes, transactionsRes] = await Promise.all([
        getActivities(),
        getPromos(),
        getAllTransactions(),
      ]);

      const activities = activitiesRes.success
        ? activitiesRes.data?.data || []
        : [];
      const promos = promosRes.success ? promosRes.data?.data || [] : [];
      const transactions = transactionsRes.success
        ? transactionsRes.data?.data || []
        : [];

      const pendingCount = transactions.filter(
        (t) => t.status === "pending"
      ).length;
      const totalRevenue = transactions
        .filter((t) => t.status === "success")
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

      setStats({
        totalActivities: activities.length,
        totalPromos: promos.length,
        pendingTransactions: pendingCount,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  const navigationItems = [
    {
      icon: FolderOpen,
      label: "Categories",
      path: "/admin/categories",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: MapPin,
      label: "Activities",
      path: "/admin/activities",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Image,
      label: "Banners",
      path: "/admin/banners",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Percent,
      label: "Promos",
      path: "/admin/promos",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      path: "/admin/payment-methods",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Receipt,
      label: "Transactions",
      path: "/admin/transactions",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Travel Admin Dashboard
              </h1>
              <span className="ml-3 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
          </h2>
          <p className="text-gray-600">
            Manage your travel platform from this dashboard. Monitor activities,
            transactions, and more.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Activities
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalActivities}
                </p>
                <p className="text-xs text-green-600">Active listings</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Active Promos
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalPromos}
                </p>
                <p className="text-xs text-blue-600">Promotional offers</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Percent className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.pendingTransactions}
                </p>
                <p className="text-xs text-yellow-600">Awaiting approval</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-green-600">Confirmed transactions</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Management Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div
                  className={`p-4 rounded-xl ${item.bgColor} mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <button
              onClick={() => navigate("/admin/transactions")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Transactions
            </button>
          </div>
          <div className="space-y-4">
            {[
              {
                action: "New transaction pending",
                detail: "Sea World Ancol booking awaiting approval",
                time: "2 hours ago",
                icon: Clock,
                color: "text-yellow-600",
              },
              {
                action: "Activity updated",
                detail: "Bali Beach Tour information modified",
                time: "4 hours ago",
                icon: MapPin,
                color: "text-green-600",
              },
              {
                action: "Promo activated",
                detail: "Summer Special discount went live",
                time: "6 hours ago",
                icon: Percent,
                color: "text-red-600",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-gray-50 rounded-xl"
              >
                <div className="p-2 rounded-lg bg-white mr-4">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
