import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  CreditCard,
  Users,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Activity,
  Gift,
  ShoppingCart,
} from "lucide-react";
import { getLoggedUser } from "../../api/user";
import { getMyTransactions } from "../../api/transaction";
import { getCarts } from "../../api/cart";
import { getActivities } from "../../api/activity";
import { getPromos } from "../../api/promo";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/LoadingSpinner";
import ActivityCard from "../../components/ActivityCard";
import PromoCard from "../../components/PromoCard";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [featuredPromos, setFeaturedPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    cartItems: 0,
  });
  const { showToast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        userResult,
        transactionsResult,
        cartResult,
        activitiesResult,
        promosResult,
      ] = await Promise.all([
        getLoggedUser(),
        getMyTransactions(),
        getCarts(),
        getActivities(),
        getPromos(),
      ]);

      // Set user data
      if (userResult.success) {
        setUser(userResult.data.data);
      }

      // Set transactions and calculate stats
      if (transactionsResult.success) {
        const transactionData = transactionsResult.data.data || [];
        setTransactions(transactionData.slice(0, 5)); // Show only recent 5

        const completedTransactions = transactionData.filter(
          (t) => t.status === "success"
        );
        setStats((prev) => ({
          ...prev,
          totalBookings: transactionData.length,
          completedBookings: completedTransactions.length,
          totalSpent: completedTransactions.reduce(
            (sum, t) => sum + t.totalAmount,
            0
          ),
        }));
      }

      // Set cart data
      if (cartResult.success) {
        const cartData = cartResult.data.data || [];
        setCartItems(cartData.slice(0, 3)); // Show only 3 items
        setStats((prev) => ({
          ...prev,
          cartItems: cartData.length,
        }));
      }

      // Set recent activities (featured/popular)
      if (activitiesResult.success) {
        const activities = activitiesResult.data.data || [];
        const sortedActivities = activities
          .sort(
            (a, b) => b.rating * b.total_reviews - a.rating * a.total_reviews
          )
          .slice(0, 4);
        setRecentActivities(sortedActivities);
      }

      // Set featured promos
      if (promosResult.success) {
        const promos = promosResult.data.data || [];
        setFeaturedPromos(promos.slice(0, 3));
      }
    } catch {
      showToast("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600  text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4">
            <img
              src={
                user?.profilePictureUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User"
                )}&background=ffffff&color=6366f1&size=80`
              }
              alt={user?.name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {user?.name?.split(" ")[0] || "Traveler"}! 👋
              </h1>
              <p className="text-blue-100 mt-1">
                Ready for your next adventure?
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.cartItems}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Bookings
                </h2>
                <Link
                  to="/user/transactions"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start exploring amazing activities!
                  </p>
                  <Link
                    to="/activities"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Browse Activities
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.invoiceId}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(transaction.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Activities */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Popular Activities
                </h2>
                <Link
                  to="/activities"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recentActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Cart Preview */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Cart
                  </h3>
                  <Link
                    to="/user/cart"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Cart
                  </Link>
                </div>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={
                          item.activity?.imageUrls?.[0] ||
                          "/placeholder-image.jpg"
                        }
                        alt={item.activity?.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {item.activity?.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/user/checkout"
                  className="mt-4 w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-medium text-center block"
                >
                  Checkout Now
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/activities"
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Browse Activities
                    </p>
                    <p className="text-xs text-gray-600">
                      Discover new experiences
                    </p>
                  </div>
                </Link>

                <Link
                  to="/promos"
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Promos</p>
                    <p className="text-xs text-gray-600">
                      Save on your next trip
                    </p>
                  </div>
                </Link>

                <Link
                  to="/user/transactions"
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500 to-cyan-600  border border-sky-200 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600  rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Bookings</p>
                    <p className="text-xs text-gray-600">Track your orders</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Featured Promos */}
            {featuredPromos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Featured Deals
                  </h3>
                  <Link
                    to="/promos"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {featuredPromos.map((promo) => (
                    <PromoCard key={promo.id} promo={promo} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Insights */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Travel Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Average Rating</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.completedBookings > 0 ? "4.8" : "--"}
              </p>
              <p className="text-sm text-gray-600">From your bookings</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Places Visited</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.completedBookings}
              </p>
              <p className="text-sm text-gray-600">Unique destinations</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Travel Style</h3>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {stats.completedBookings >= 5
                  ? "Adventurer"
                  : stats.completedBookings >= 2
                  ? "Explorer"
                  : "Beginner"}
              </p>
              <p className="text-sm text-gray-600">Based on activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
