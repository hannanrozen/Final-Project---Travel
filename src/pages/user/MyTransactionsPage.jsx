import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Eye,
  FileCheck,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { getMyTransactions } from "../../api/transaction";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const MyTransactionsPage = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!authenticated) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getMyTransactions();
        if (response.success) {
          setTransactions(response.data.data || []);
        } else {
          setError(response.error || "Failed to load transactions");
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [authenticated, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      success: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    };

    const statusText = {
      pending: "Pending",
      success: "Approved",
      cancelled: "Cancelled",
      failed: "Failed",
    };

    const normalizedStatus = status?.toLowerCase() || "pending";
    const badgeClass = statusClasses[normalizedStatus] || statusClasses.pending;
    const displayText = statusText[normalizedStatus] || status || "Pending";

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}
      >
        {displayText}
      </span>
    );
  };

  const TransactionCard = ({ transaction }) => {
    const hasProofPayment = transaction.proofPaymentUrl;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - Main Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {transaction.activity?.title || "Activity"}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {transaction.activity?.city || "Location"}
                </div>
                {transaction.activity?.rating && (
                  <div className="flex items-center text-sm text-yellow-600">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {transaction.activity.rating} (
                    {transaction.activity.total_reviews || 0} reviews)
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(transaction.status)}
                {hasProofPayment && (
                  <div className="flex items-center text-xs text-green-600">
                    <FileCheck className="w-3 h-3 mr-1" />
                    Proof Uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date</span>
                <p className="font-medium text-gray-900">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Participants</span>
                <p className="font-medium text-gray-900">
                  <Users className="w-4 h-4 inline mr-1" />
                  {transaction.quantity || 1}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Payment</span>
                <p className="font-medium text-gray-900">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  {transaction.payment_method?.name || "Card"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Total Amount</span>
                <p className="font-bold text-lg text-blue-600">
                  {formatCurrency(transaction.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-row lg:flex-col gap-2">
            <button
              onClick={() => navigate(`/transaction/${transaction.id}`)}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </button>
            <div className="text-xs text-gray-500 text-center lg:text-right">
              ID: {transaction.id?.slice(0, 8)}...
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Loading your transactions...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-800 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Transactions
              </h1>
              <p className="text-gray-600 mt-1">
                Track your booking history and status
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Transactions Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't made any bookings yet. Start exploring amazing
              activities!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/activities")}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg"
              >
                Browse Activities
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        {!loading && !error && transactions.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transaction History
                </h2>
                <span className="text-sm text-gray-600">
                  {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-12 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/activities")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg"
                >
                  Book New Activity
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyTransactionsPage;
