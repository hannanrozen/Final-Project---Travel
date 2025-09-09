import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Download,
  Filter,
  Search,
  Eye,
} from "lucide-react";
import {
  getMyTransactions,
  updateTransactionProofPayment,
} from "../../api/transaction";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/LoadingSpinner";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const { showToast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyTransactions();
      if (result.success) {
        setTransactions(result.data.data || []);
      } else {
        showToast("Failed to load transactions", "error");
      }
    } catch (error) {
      showToast("Error loading transactions", "error");
      console.error("Transaction fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Completed";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending Payment";
      default:
        return "Unknown";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUploadProof = async (transactionId) => {
    if (!proofUrl.trim()) {
      showToast("Please enter a valid proof URL", "error");
      return;
    }

    try {
      setUploadingProof(true);
      const result = await updateTransactionProofPayment({
        transactionId,
        proofPaymentUrl: proofUrl,
      });

      if (result.success) {
        showToast("Payment proof uploaded successfully", "success");
        setShowProofModal(false);
        setProofUrl("");
        fetchTransactions(); // Refresh transactions
      } else {
        showToast(result.error || "Failed to upload payment proof", "error");
      }
    } catch (error) {
      showToast("Error uploading payment proof", "error");
      console.error("Upload error:", error);
    } finally {
      setUploadingProof(false);
    }
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filter !== "all" && transaction.status !== filter) return false;
      if (
        searchTerm &&
        !transaction.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "amount-high") {
        return b.totalAmount - a.totalAmount;
      } else if (sortBy === "amount-low") {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Transaction History
              </h1>
              <p className="mt-2 text-gray-600">
                Track your bookings and payment status
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by invoice ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filter !== "all"
                ? "No transactions match your current filters"
                : "You haven't made any bookings yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  {/* Transaction Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600  rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {transaction.invoiceId}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        <span className="ml-2">
                          {getStatusText(transaction.status)}
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          setSelectedTransaction(
                            selectedTransaction === transaction.id
                              ? null
                              : transaction.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">
                        Total: {formatCurrency(transaction.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {transaction.transaction_items?.length || 0} items
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Booking #{transaction.id.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Actions */}
                  {transaction.status === "pending" && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-3 sm:mb-0">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Payment Required
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction.id);
                          setShowProofModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Payment Proof
                      </button>
                    </div>
                  )}

                  {/* Transaction Details (Expanded) */}
                  {selectedTransaction === transaction.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Transaction Details
                      </h4>

                      {/* Items */}
                      <div className="space-y-4 mb-6">
                        {transaction.transaction_items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <img
                              src={
                                item.activity?.imageUrls?.[0] ||
                                "/placeholder-image.jpg"
                              }
                              alt={item.activity?.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {item.activity?.title}
                              </h5>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                <span>{formatCurrency(item.price)}</span>
                              </div>
                              {item.activity?.city && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {item.activity.city}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900">
                            Payment Details
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">
                                {formatCurrency(transaction.totalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Payment Method:
                              </span>
                              <span className="font-medium">
                                {transaction.payment_method?.name ||
                                  "Not specified"}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="font-medium text-gray-900">
                                Total:
                              </span>
                              <span className="font-bold text-lg">
                                {formatCurrency(transaction.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900">
                            Transaction Info
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Invoice ID:</span>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {transaction.invoiceId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order Date:</span>
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                            {transaction.proofPaymentUrl && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Payment Proof:
                                </span>
                                <a
                                  href={transaction.proofPaymentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  View Proof
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter((t) => t.status === "success").length}
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
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    transactions
                      .filter((t) => t.status === "success")
                      .reduce((sum, t) => sum + t.totalAmount, 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Payment Proof
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Proof URL
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://example.com/payment-proof.jpg"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload your payment proof image to a hosting service and paste
                  the URL here
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowProofModal(false);
                  setProofUrl("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                disabled={uploadingProof}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadProof(selectedTransaction)}
                disabled={uploadingProof || !proofUrl.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {uploadingProof ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  "Upload Proof"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
