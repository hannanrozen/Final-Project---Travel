import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Percent,
  Eye,
  X,
  Copy,
  Check,
  DollarSign,
} from "lucide-react";
import {
  getPromos,
  createPromo,
  getPromoById,
  updatePromo,
  deletePromo,
} from "../../api/promo";

const AdminPromosPage = () => {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [filteredPromos, setFilteredPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingPromo, setViewingPromo] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    terms_condition: "",
    promo_code: "",
    promo_discount_price: "",
    minimum_claim_price: "",
  });

  const loadPromos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getPromos();
      if (response.success) {
        setPromos(response.data?.data || []);
      } else {
        showToast("Failed to load promos", "error");
      }
    } catch (error) {
      console.error("Error loading promos:", error);
      showToast("Error loading promos", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterPromos = useCallback(() => {
    let filtered = promos;

    if (searchTerm) {
      filtered = filtered.filter(
        (promo) =>
          promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.promo_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPromos(filtered);
  }, [promos, searchTerm]);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  useEffect(() => {
    filterPromos();
  }, [filterPromos]);

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
      title: "",
      description: "",
      imageUrl: "",
      terms_condition: "",
      promo_code: "",
      promo_discount_price: "",
      minimum_claim_price: "",
    });
    setEditingPromo(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generatePromoCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      promo_code: result,
    }));
  };

  const copyPromoCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast("Promo code copied to clipboard!", "success");
      setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      showToast("Failed to copy promo code", "error");
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

      const promoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || "",
        terms_condition: formData.terms_condition.trim(),
        promo_code: formData.promo_code.trim().toUpperCase(),
        promo_discount_price: parseFloat(formData.promo_discount_price),
        minimum_claim_price: parseFloat(formData.minimum_claim_price),
      };

      let response;
      if (editingPromo) {
        response = await updatePromo(editingPromo.id, promoData);
      } else {
        response = await createPromo(promoData);
      }

      if (response.success) {
        showToast(
          `Promo ${editingPromo ? "updated" : "created"} successfully!`,
          "success"
        );
        setShowModal(false);
        resetForm();
        await loadPromos();
      } else {
        showToast(
          response.message ||
            `Failed to ${editingPromo ? "update" : "create"} promo`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting promo:", error);
      showToast("An error occurred while saving the promo", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (promo) => {
    try {
      const response = await getPromoById(promo.id);
      if (response.success) {
        const promoData = response.data;
        setFormData({
          title: promoData.title || "",
          description: promoData.description || "",
          imageUrl: promoData.imageUrl || "",
          terms_condition: promoData.terms_condition || "",
          promo_code: promoData.promo_code || "",
          promo_discount_price:
            promoData.promo_discount_price?.toString() || "",
          minimum_claim_price: promoData.minimum_claim_price?.toString() || "",
        });
        setEditingPromo(promo);
        setShowModal(true);
      } else {
        showToast("Failed to load promo details", "error");
      }
    } catch (error) {
      console.error("Error loading promo:", error);
      showToast("Error loading promo details", "error");
    }
  };

  const handleDelete = async (promo) => {
    if (window.confirm(`Are you sure you want to delete "${promo.title}"?`)) {
      try {
        const response = await deletePromo(promo.id);
        if (response.success) {
          showToast("Promo deleted successfully!", "success");
          await loadPromos();
        } else {
          showToast(response.message || "Failed to delete promo", "error");
        }
      } catch (error) {
        console.error("Error deleting promo:", error);
        showToast("Error deleting promo", "error");
      }
    }
  };

  const handleView = async (promo) => {
    try {
      const response = await getPromoById(promo.id);
      if (response.success) {
        setViewingPromo(response.data);
        setShowDetailModal(true);
      } else {
        showToast("Failed to load promo details", "error");
      }
    } catch (error) {
      console.error("Error loading promo:", error);
      showToast("Error loading promo details", "error");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading promos...</p>
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
                Promos Management
              </h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Promo
            </button>
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
                placeholder="Search promos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total: {filteredPromos.length} promos
            </div>
          </div>
        </div>

        {/* Promos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              {promo.imageUrl && (
                <div className="relative h-48">
                  <img
                    src={promo.imageUrl || "/api/placeholder/400/300"}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/400/300";
                    }}
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      onClick={() => handleView(promo)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4">
                {!promo.imageUrl && (
                  <div className="flex justify-end mb-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(promo)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(promo)}
                        className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {promo.title}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm font-medium">
                    <Percent className="w-4 h-4 mr-1" />
                    {promo.promo_code}
                    <button
                      onClick={() => copyPromoCode(promo.promo_code)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      {copiedCode === promo.promo_code ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-green-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">
                      {formatCurrency(promo.promo_discount_price)} off
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Min. purchase: {formatCurrency(promo.minimum_claim_price)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {promo.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredPromos.length === 0 && (
          <div className="text-center py-12">
            <Percent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No promos found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or add a new promo.
            </p>
          </div>
        )}
      </div>

      {/* Promo Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPromo ? "Edit Promo" : "Add New Promo"}
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
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter promo title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Enter promo description"
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
                    placeholder="https://example.com/promo.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.imageUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="promo_code"
                      value={formData.promo_code}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    />
                    <button
                      type="button"
                      onClick={generatePromoCode}
                      className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Amount *
                    </label>
                    <input
                      type="number"
                      name="promo_discount_price"
                      value={formData.promo_discount_price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="50000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Purchase *
                    </label>
                    <input
                      type="number"
                      name="minimum_claim_price"
                      value={formData.minimum_claim_price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="100000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions *
                  </label>
                  <textarea
                    name="terms_condition"
                    value={formData.terms_condition}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Enter terms and conditions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                      : editingPromo
                      ? "Update Promo"
                      : "Create Promo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Promo Detail Modal */}
      {showDetailModal && viewingPromo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Promo Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image */}
                {viewingPromo.imageUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Promo Image
                    </h3>
                    <img
                      src={viewingPromo.imageUrl}
                      alt={viewingPromo.title}
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/600/300";
                      }}
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Basic Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Title:</span>{" "}
                        {viewingPromo.title}
                      </p>
                      <p>
                        <span className="font-medium">Promo Code:</span>
                        <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                          {viewingPromo.promo_code}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Pricing
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Discount Amount:</span>{" "}
                        {formatCurrency(viewingPromo.promo_discount_price)}
                      </p>
                      <p>
                        <span className="font-medium">Minimum Purchase:</span>{" "}
                        {formatCurrency(viewingPromo.minimum_claim_price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingPromo.description}
                  </p>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Terms & Conditions
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingPromo.terms_condition}
                  </p>
                </div>
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

export default AdminPromosPage;
