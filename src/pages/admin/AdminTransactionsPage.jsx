import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Eye,
  X,
  Check,
  X as XIcon,
  Clock,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Filter,
  Download,
} from "lucide-react";
import {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
} from "../../api/transaction";

const AdminTransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllTransactions();
      if (response.success) {
        setTransactions(response.data?.data || []);
      } else {
        showToast("Failed to load transactions", "error");
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      showToast("Error loading transactions", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.invoiceId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.user?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
      setToastType("");
    }, 3000);
  };

  const handleView = async (transaction) => {
    try {
      const response = await getTransactionById(transaction.id);
      if (response.success) {
        setViewingTransaction(response.data);
        setShowDetailModal(true);
      } else {
        showToast("Failed to load transaction details", "error");
      }
    } catch (error) {
      console.error("Error loading transaction:", error);
      showToast("Error loading transaction details", "error");
    }
  };

  const handleStatusUpdate = async (transactionId, newStatus) => {
    if (
      !window.confirm(`Are you sure you want to ${newStatus} this transaction?`)
    ) {
      return;
    }

    try {
      setIsUpdating(true);
      const response = await updateTransactionStatus(transactionId, newStatus);
      if (response.success) {
        showToast(`Transaction ${newStatus} successfully!`, "success");
        await loadTransactions();
        if (viewingTransaction && viewingTransaction.id === transactionId) {
          const updatedResponse = await getTransactionById(transactionId);
          if (updatedResponse.success) {
            setViewingTransaction(updatedResponse.data);
          }
        }
      } else {
        showToast(
          response.message || `Failed to ${newStatus} transaction`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      showToast("Error updating transaction status", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "success":
        return <Check className="w-4 h-4" />;
      case "failed":
      case "cancelled":
        return <XIcon className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
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

  const exportTransactions = () => {
    const csvContent = [
      ["Invoice ID", "User", "Email", "Amount", "Status", "Date"].join(","),
      ...filteredTransactions.map((transaction) =>
        [
          transaction.invoiceId || "",
          transaction.user?.name || "",
          transaction.user?.email || "",
          transaction.totalAmount || 0,
          transaction.status || "",
          new Date(transaction.createdAt).toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Transactions Management
              </h1>
            </div>
            <button
              onClick={exportTransactions}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice, user name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              Total: {filteredTransactions.length} transactions
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.invoiceId || `TXN-${transaction.id}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {transaction.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.user?.name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.user?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.totalAmount || 0)}
                      </div>
                      {transaction.transaction_items &&
                        transaction.transaction_items.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {transaction.transaction_items.length} item(s)
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">
                          {transaction.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(transaction)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {transaction.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(transaction.id, "success")
                              }
                              disabled={isUpdating}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(transaction.id, "failed")
                              }
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && viewingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Transaction Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Transaction Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Invoice ID:</p>
                        <p className="font-medium text-gray-900">
                          {viewingTransaction.invoiceId ||
                            `TXN-${viewingTransaction.id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID:</p>
                        <p className="font-medium text-gray-900">
                          {viewingTransaction.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status:</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            viewingTransaction.status
                          )}`}
                        >
                          {getStatusIcon(viewingTransaction.status)}
                          <span className="ml-1 capitalize">
                            {viewingTransaction.status}
                          </span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount:</p>
                        <p className="font-medium text-gray-900 text-lg">
                          {formatCurrency(viewingTransaction.totalAmount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Transaction Date:
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(viewingTransaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      User Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {viewingTransaction.user?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {viewingTransaction.user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                      {viewingTransaction.user?.phoneNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Phone:</p>
                          <p className="font-medium text-gray-900">
                            {viewingTransaction.user.phoneNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {viewingTransaction.payment_method && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CreditCard className="w-6 h-6 text-gray-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {viewingTransaction.payment_method.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            VA:{" "}
                            {
                              viewingTransaction.payment_method
                                .virtual_account_number
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Items */}
                {viewingTransaction.transaction_items &&
                  viewingTransaction.transaction_items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Transaction Items
                      </h3>
                      <div className="space-y-3">
                        {viewingTransaction.transaction_items.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {item.activity?.title || "Unknown Activity"}
                                  </h4>
                                  {item.activity?.city &&
                                    item.activity?.province && (
                                      <div className="flex items-center text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="text-sm">
                                          {item.activity.city},{" "}
                                          {item.activity.province}
                                        </span>
                                      </div>
                                    )}
                                  <div className="flex items-center text-gray-600 mt-2">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    <span className="text-sm">
                                      Price: {formatCurrency(item.price || 0)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Quantity: {item.quantity || 1}
                                  </p>
                                </div>
                                {item.activity?.imageUrls &&
                                  item.activity.imageUrls[0] && (
                                    <img
                                      src={item.activity.imageUrls[0]}
                                      alt={item.activity.title}
                                      className="w-16 h-16 object-cover rounded-lg ml-4"
                                      onError={(e) => {
                                        e.target.src = "/api/placeholder/64/64";
                                      }}
                                    />
                                  )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Status Actions */}
                {viewingTransaction.status === "pending" && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Actions
                    </h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() =>
                          handleStatusUpdate(viewingTransaction.id, "success")
                        }
                        disabled={isUpdating}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {isUpdating ? "Updating..." : "Approve Transaction"}
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(viewingTransaction.id, "failed")
                        }
                        disabled={isUpdating}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XIcon className="w-4 h-4 mr-2" />
                        {isUpdating ? "Updating..." : "Reject Transaction"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionsPage;
