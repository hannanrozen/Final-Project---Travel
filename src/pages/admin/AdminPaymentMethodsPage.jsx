import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  CreditCard,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";
import {
  getPaymentMethods,
  generatePaymentMethods,
} from "../../api/payment-method";

const AdminPaymentMethodsPage = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    virtual_account_number: "",
    virtual_account_name: "",
    imageUrl: "",
  });

  const loadPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data?.data || []);
      } else {
        showToast("Failed to load payment methods", "error");
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      showToast("Error loading payment methods", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterPaymentMethods = useCallback(() => {
    let filtered = paymentMethods;

    if (searchTerm) {
      filtered = filtered.filter(
        (method) =>
          method.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          method.virtual_account_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          method.virtual_account_number?.includes(searchTerm)
      );
    }

    setFilteredPaymentMethods(filtered);
  }, [paymentMethods, searchTerm]);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  useEffect(() => {
    filterPaymentMethods();
  }, [filterPaymentMethods]);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
      setToastType("");
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      virtual_account_number: "",
      virtual_account_name: "",
      imageUrl: "",
    });
    setEditingPaymentMethod(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateVirtualAccount = () => {
    const bankCode = "8877"; // Example bank code
    const randomNumbers = Math.floor(Math.random() * 1000000000000)
      .toString()
      .padStart(12, "0");
    const virtualAccountNumber = bankCode + randomNumbers;

    setFormData((prev) => ({
      ...prev,
      virtual_account_number: virtualAccountNumber,
    }));
  };

  const generatePaymentMethod = async () => {
    setIsGenerating(true);
    try {
      // Simulate generating a new payment method
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const bankNames = [
        "BCA",
        "Mandiri",
        "BNI",
        "BRI",
        "CIMB Niaga",
        "Danamon",
      ];
      const randomBank =
        bankNames[Math.floor(Math.random() * bankNames.length)];
      const randomVANumber =
        "8877" +
        Math.floor(Math.random() * 1000000000000)
          .toString()
          .padStart(12, "0");

      const newPaymentMethod = {
        name: `Virtual Account ${randomBank}`,
        virtual_account_number: randomVANumber,
        virtual_account_name: "Travel Platform",
        imageUrl: `https://via.placeholder.com/200x100/007bff/ffffff?text=${randomBank}`,
      };

      const response = await generatePaymentMethods(newPaymentMethod);
      if (response.success) {
        showToast("Payment method generated successfully!", "success");
        await loadPaymentMethods();
      } else {
        showToast("Failed to generate payment method", "error");
      }
    } catch (error) {
      console.error("Error generating payment method:", error);
      showToast("Error generating payment method", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const validateImageUrl = (url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formData.imageUrl && !validateImageUrl(formData.imageUrl)) {
        showToast("Please enter a valid image URL", "error");
        setIsSubmitting(false);
        return;
      }

      let response;

      if (response.success) {
        showToast(
          `Payment method ${
            editingPaymentMethod ? "updated" : "created"
          } successfully!`,
          "success"
        );
        setShowModal(false);
        resetForm();
        await loadPaymentMethods();
      } else {
        showToast(
          response.message ||
            `Failed to ${
              editingPaymentMethod ? "update" : "create"
            } payment method`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting payment method:", error);
      showToast("An error occurred while saving the payment method", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading payment methods...</p>
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
                Payment Methods Management
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generatePaymentMethod}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isGenerating ? "animate-spin" : ""
                  }`}
                />
                {isGenerating ? "Generating..." : "Generate Method"}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payment methods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total: {filteredPaymentMethods.length} payment methods
            </div>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg mr-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {method.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {method.virtual_account_name}
                      </p>
                    </div>
                  </div>
                </div>

                {method.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={method.imageUrl}
                      alt={method.name}
                      className="w-full h-20 object-contain bg-gray-50 rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPaymentMethods.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payment methods found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or add a new payment method.
            </p>
          </div>
        )}
      </div>

      {/* Payment Method Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPaymentMethod
                    ? "Edit Payment Method"
                    : "Add New Payment Method"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Virtual Account BCA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Virtual Account Number *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="virtual_account_number"
                      value={formData.virtual_account_number}
                      onChange={handleInputChange}
                      required
                      placeholder="8877123456789012"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                    <button
                      type="button"
                      onClick={generateVirtualAccount}
                      className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    name="virtual_account_name"
                    value={formData.virtual_account_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Travel Platform"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/bank-logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.imageUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-20 object-contain bg-gray-50 rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingPaymentMethod
                      ? "Update Method"
                      : "Create Method"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentMethodsPage;
