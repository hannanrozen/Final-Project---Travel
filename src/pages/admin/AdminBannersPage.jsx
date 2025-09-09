import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Eye,
  X,
} from "lucide-react";
import {
  getBanners,
  createBanner,
  getBannerById,
  updateBanner,
  deleteBanner,
} from "../../api/banner";

const AdminBannersPage = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingBanner, setViewingBanner] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
  });

  const loadBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getBanners();
      if (response.success) {
        setBanners(response.data?.data || []);
      } else {
        showToast("Failed to load banners", "error");
      }
    } catch (error) {
      console.error("Error loading banners:", error);
      showToast("Error loading banners", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterBanners = useCallback(() => {
    let filtered = banners;

    if (searchTerm) {
      filtered = filtered.filter((banner) =>
        banner.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBanners(filtered);
  }, [banners, searchTerm]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    filterBanners();
  }, [filterBanners]);

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
      imageUrl: "",
    });
    setEditingBanner(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateImageUrl = (url) => {
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
      if (!validateImageUrl(formData.imageUrl)) {
        showToast("Please enter a valid image URL", "error");
        setIsSubmitting(false);
        return;
      }

      const bannerData = {
        name: formData.name.trim(),
        imageUrl: formData.imageUrl.trim(),
      };

      let response;
      if (editingBanner) {
        response = await updateBanner(editingBanner.id, bannerData);
      } else {
        response = await createBanner(bannerData);
      }

      if (response.success) {
        showToast(
          `Banner ${editingBanner ? "updated" : "created"} successfully!`,
          "success"
        );
        setShowModal(false);
        resetForm();
        await loadBanners();
      } else {
        showToast(
          response.message ||
            `Failed to ${editingBanner ? "update" : "create"} banner`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting banner:", error);
      showToast("An error occurred while saving the banner", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (banner) => {
    try {
      const response = await getBannerById(banner.id);
      if (response.success) {
        const bannerData = response.data;
        setFormData({
          name: bannerData.name || "",
          imageUrl: bannerData.imageUrl || "",
        });
        setEditingBanner(banner);
        setShowModal(true);
      } else {
        showToast("Failed to load banner details", "error");
      }
    } catch (error) {
      console.error("Error loading banner:", error);
      showToast("Error loading banner details", "error");
    }
  };

  const handleDelete = async (banner) => {
    if (window.confirm(`Are you sure you want to delete "${banner.name}"?`)) {
      try {
        const response = await deleteBanner(banner.id);
        if (response.success) {
          showToast("Banner deleted successfully!", "success");
          await loadBanners();
        } else {
          showToast(response.message || "Failed to delete banner", "error");
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
        showToast("Error deleting banner", "error");
      }
    }
  };

  const handleView = async (banner) => {
    try {
      const response = await getBannerById(banner.id);
      if (response.success) {
        setViewingBanner(response.data);
        setShowDetailModal(true);
      } else {
        showToast("Failed to load banner details", "error");
      }
    } catch (error) {
      console.error("Error loading banner:", error);
      showToast("Error loading banner details", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading banners...</p>
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
                Banners Management
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
              Add Banner
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
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total: {filteredBanners.length} banners
            </div>
          </div>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={banner.imageUrl || "/api/placeholder/400/300"}
                  alt={banner.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => handleView(banner)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-center line-clamp-2">
                  {banner.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {filteredBanners.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No banners found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or add a new banner.
            </p>
          </div>
        )}
      </div>

      {/* Banner Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBanner ? "Edit Banner" : "Add New Banner"}
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
                    Banner Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter banner name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/banner.jpg"
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
                      : editingBanner
                      ? "Update Banner"
                      : "Create Banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Banner Detail Modal */}
      {showDetailModal && viewingBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Banner Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Banner Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Name:</p>
                    <p className="font-medium text-gray-900 mb-3">
                      {viewingBanner.name}
                    </p>

                    <p className="text-sm text-gray-600 mb-1">Image URL:</p>
                    <p className="text-blue-600 text-sm break-all mb-3">
                      <a
                        href={viewingBanner.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-700"
                      >
                        {viewingBanner.imageUrl}
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Banner Preview
                  </h3>
                  <div className="relative">
                    <img
                      src={viewingBanner.imageUrl}
                      alt={viewingBanner.name}
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/600/300";
                      }}
                    />
                  </div>
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

export default AdminBannersPage;
