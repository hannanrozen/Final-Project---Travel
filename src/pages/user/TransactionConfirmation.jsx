import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  MapPin,
  Star,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Download,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getTransactionById } from "../../api/transaction";
import { useAuth } from "../../hooks/useAuth";

const TransactionConfirmation = () => {
  const { id: transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);

  // Get initial data from navigation state if available
  const initialData = location.state || {};

  useEffect(() => {
    const loadTransactionData = async () => {
      if (!authenticated) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        // If we have transaction data from navigation state, use it
        if (initialData.transaction) {
          setTransaction(initialData.transaction);
          setLoading(false);
          return;
        }

        // Otherwise, fetch from API
        const response = await getTransactionById(transactionId);
        if (response.success) {
          setTransaction(response.data.data);
        } else {
          setError(response.error || "Failed to load transaction details");
        }
      } catch (err) {
        console.error("Error loading transaction:", err);
        setError("Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();
  }, [authenticated, transactionId, navigate, initialData.transaction]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "Confirmed";
      case "pending":
        return "Pending Review";
      case "cancelled":
        return "Cancelled";
      case "rejected":
        return "Rejected";
      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Transaction Not Found
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate("/my-transactions")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg"
              >
                Go to My Transactions
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Transaction Data
              </h2>
              <button
                onClick={() => navigate("/my-transactions")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg"
              >
                Go to My Transactions
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activity = initialData.activity || transaction.activity || {};
  const paymentMethod =
    initialData.paymentMethod || transaction.payment_method || {};
  const bookingDetails = initialData.bookingDetails || {};
  const contactInfo = initialData.contactInfo || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for your booking. Your transaction is being processed and
            you will receive a confirmation email shortly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Transaction Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction Status */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Transaction Status
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">
                      Transaction ID:
                    </span>
                    <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                      {transaction.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        transaction.totalAmount || transaction.total_amount || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Activity Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activity.title || "Activity"}
                    </h3>
                    {activity.city && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        {activity.city}
                      </div>
                    )}
                    {activity.rating && (
                      <div className="flex items-center text-yellow-600">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {activity.rating} ({activity.total_reviews} reviews)
                      </div>
                    )}
                  </div>

                  {bookingDetails.date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Date: {formatDate(bookingDetails.date)}</span>
                    </div>
                  )}

                  {bookingDetails.quantity && (
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Participants: {bookingDetails.quantity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 text-gray-400 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {paymentMethod.name || "Payment Method"}
                    </h3>
                    {paymentMethod.virtual_account_name && (
                      <p className="text-sm text-gray-600">
                        {paymentMethod.virtual_account_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Proof of Payment */}
              {transaction.proofPaymentUrl && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Proof of Payment
                  </h2>
                  <div className="border-2 border-gray-200 rounded-xl p-4">
                    <img
                      src={transaction.proofPaymentUrl}
                      alt="Proof of Payment"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(contactInfo.firstName || contactInfo.email) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-2">
                    {(contactInfo.firstName || contactInfo.lastName) && (
                      <p>
                        <span className="font-medium text-gray-700">Name:</span>{" "}
                        {contactInfo.firstName} {contactInfo.lastName}
                      </p>
                    )}
                    {contactInfo.email && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Email:
                        </span>{" "}
                        {contactInfo.email}
                      </p>
                    )}
                    {contactInfo.phone && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Phone:
                        </span>{" "}
                        {contactInfo.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  What's Next?
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      Your booking is being reviewed. You'll receive an email
                      confirmation within 24 hours.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/my-transactions")}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg font-medium"
                  >
                    View My Transactions
                  </button>

                  <button
                    onClick={() => navigate("/activities")}
                    className="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200 font-medium"
                  >
                    Browse More Activities
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TransactionConfirmation;
