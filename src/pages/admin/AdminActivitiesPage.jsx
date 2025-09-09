import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  Tag,
  Eye,
  Upload,
  X,
} from "lucide-react";
import {
  getActivities,
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity,
} from "../../api/activity";
import { getCategories } from "../../api/category";

const AdminActivitiesPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingActivity, setViewingActivity] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
    imageUrls: [""],
    price: "",
    price_discount: "",
    rating: "",
    total_reviews: "",
    facilities: "",
    address: "",
    province: "",
    city: "",
    location_maps: "",
  });

  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getActivities();
      if (response.success) {
        setActivities(response.data?.data || []);
      } else {
        showToast("Failed to load activities", "error");
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      showToast("Error loading activities", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data?.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  const filterActivities = useCallback(() => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.province?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (activity) => activity.categoryId === selectedCategory
      );
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, selectedCategory]);

  useEffect(() => {
    loadActivities();
    loadCategories();
  }, [loadActivities, loadCategories]);

  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

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
      categoryId: "",
      title: "",
      description: "",
      imageUrls: [""],
      price: "",
      price_discount: "",
      rating: "",
      total_reviews: "",
      facilities: "",
      address: "",
      province: "",
      city: "",
      location_maps: "",
    });
    setEditingActivity(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData((prev) => ({
      ...prev,
      imageUrls: newImageUrls,
    }));
  };

  const addImageUrl = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  };

  const removeImageUrl = (index) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        imageUrls: newImageUrls,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Remove empty image URLs
      const cleanImageUrls = formData.imageUrls.filter(
        (url) => url.trim() !== ""
      );

      const activityData = {
        ...formData,
        imageUrls: cleanImageUrls,
        price: parseFloat(formData.price),
        price_discount: formData.price_discount
          ? parseFloat(formData.price_discount)
          : 0,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        total_reviews: formData.total_reviews
          ? parseInt(formData.total_reviews)
          : 0,
      };

      let response;
      if (editingActivity) {
        response = await updateActivity(editingActivity.id, activityData);
      } else {
        response = await createActivity(activityData);
      }

      if (response.success) {
        showToast(
          `Activity ${editingActivity ? "updated" : "created"} successfully!`,
          "success"
        );
        setShowModal(false);
        resetForm();
        await loadActivities();
      } else {
        showToast(
          response.message ||
            `Failed to ${editingActivity ? "update" : "create"} activity`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting activity:", error);
      showToast("An error occurred while saving the activity", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (activity) => {
    try {
      const response = await getActivityById(activity.id);
      if (response.success) {
        const activityData = response.data;
        setFormData({
          categoryId: activityData.categoryId || "",
          title: activityData.title || "",
          description: activityData.description || "",
          imageUrls: activityData.imageUrls || [""],
          price: activityData.price?.toString() || "",
          price_discount: activityData.price_discount?.toString() || "",
          rating: activityData.rating?.toString() || "",
          total_reviews: activityData.total_reviews?.toString() || "",
          facilities: activityData.facilities || "",
          address: activityData.address || "",
          province: activityData.province || "",
          city: activityData.city || "",
          location_maps: activityData.location_maps || "",
        });
        setEditingActivity(activity);
        setShowModal(true);
      } else {
        showToast("Failed to load activity details", "error");
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      showToast("Error loading activity details", "error");
    }
  };

  const handleDelete = async (activity) => {
    if (
      window.confirm(`Are you sure you want to delete "${activity.title}"?`)
    ) {
      try {
        const response = await deleteActivity(activity.id);
        if (response.success) {
          showToast("Activity deleted successfully!", "success");
          await loadActivities();
        } else {
          showToast(response.message || "Failed to delete activity", "error");
        }
      } catch (error) {
        console.error("Error deleting activity:", error);
        showToast("Error deleting activity", "error");
      }
    }
  };

  const handleView = async (activity) => {
    try {
      const response = await getActivityById(activity.id);
      if (response.success) {
        setViewingActivity(response.data);
        setShowDetailModal(true);
      } else {
        showToast("Failed to load activity details", "error");
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      showToast("Error loading activity details", "error");
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
          <p className="text-lg text-gray-600">Loading activities...</p>
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
                Activities Management
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
              Add Activity
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
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              Total: {filteredActivities.length} activities
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={activity.imageUrls?.[0] || "/api/placeholder/400/300"}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => handleView(activity)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(activity)}
                    className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(activity)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {activity.title}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {activity.city}, {activity.province}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">
                      {formatCurrency(activity.price)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Tag className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {categories.find((cat) => cat.id === activity.categoryId)
                        ?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No activities found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or add a new activity.
            </p>
          </div>
        )}
      </div>

      {/* Activity Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingActivity ? "Edit Activity" : "Add New Activity"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
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
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs *
                  </label>
                  {formData.imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <input
                        type="url"
                        value={url}
                        onChange={(e) =>
                          handleImageUrlChange(index, e.target.value)
                        }
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={index === 0}
                      />
                      {formData.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Another Image URL
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Price
                    </label>
                    <input
                      type="number"
                      name="price_discount"
                      value={formData.price_discount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Reviews
                    </label>
                    <input
                      type="number"
                      name="total_reviews"
                      value={formData.total_reviews}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facilities
                  </label>
                  <input
                    type="text"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleInputChange}
                    placeholder="WiFi, Parking, Restaurant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Maps URL
                  </label>
                  <input
                    type="url"
                    name="location_maps"
                    value={formData.location_maps}
                    onChange={handleInputChange}
                    placeholder="https://maps.google.com/..."
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
                      : editingActivity
                      ? "Update Activity"
                      : "Create Activity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {showDetailModal && viewingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Activity Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Images */}
                {viewingActivity.imageUrls &&
                  viewingActivity.imageUrls.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Images
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viewingActivity.imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${viewingActivity.title} ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/400/300";
                            }}
                          />
                        ))}
                      </div>
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
                        {viewingActivity.title}
                      </p>
                      <p>
                        <span className="font-medium">Category:</span>{" "}
                        {categories.find(
                          (cat) => cat.id === viewingActivity.categoryId
                        )?.name || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium">Price:</span>{" "}
                        {formatCurrency(viewingActivity.price)}
                      </p>
                      {viewingActivity.price_discount > 0 && (
                        <p>
                          <span className="font-medium">Discount Price:</span>{" "}
                          {formatCurrency(viewingActivity.price_discount)}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Rating:</span>{" "}
                        {viewingActivity.rating} / 5
                      </p>
                      <p>
                        <span className="font-medium">Total Reviews:</span>{" "}
                        {viewingActivity.total_reviews}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Location
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {viewingActivity.address}
                      </p>
                      <p>
                        <span className="font-medium">City:</span>{" "}
                        {viewingActivity.city}
                      </p>
                      <p>
                        <span className="font-medium">Province:</span>{" "}
                        {viewingActivity.province}
                      </p>
                      {viewingActivity.location_maps && (
                        <p>
                          <span className="font-medium">Maps:</span>{" "}
                          <a
                            href={viewingActivity.location_maps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View on Maps
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingActivity.description}
                  </p>
                </div>

                {/* Facilities */}
                {viewingActivity.facilities && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Facilities
                    </h3>
                    <p className="text-gray-700">
                      {viewingActivity.facilities}
                    </p>
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

export default AdminActivitiesPage;
