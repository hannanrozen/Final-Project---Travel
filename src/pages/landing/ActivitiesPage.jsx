import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ActivityCard from "../../components/ActivityCard";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import SortDropdown from "../../components/SortDropdown";
import ViewModeToggle from "../../components/ViewModeToggle";
import { useTravelData } from "../../hooks/useTravelDataNew";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import {
  Search,
  Filter,
  MapPin,
  Star,
  DollarSign,
  SlidersHorizontal,
} from "lucide-react";

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activities,
    categories,
    search,
    fetchActivities,
    fetchCategories,
    searchActivities,
    fetchActivitiesByCategory,
  } = useTravelData();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState(
    location.state?.searchTerm || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState([]);

  // Check if we came from promo page
  const promoCode = location.state?.promoCode;
  const promoId = location.state?.promoId;

  useEffect(() => {
    fetchCategories();
    if (selectedCategory) {
      fetchActivitiesByCategory(selectedCategory);
    } else {
      fetchActivities();
    }
  }, [
    selectedCategory,
    fetchActivities,
    fetchCategories,
    fetchActivitiesByCategory,
  ]);

  useEffect(() => {
    if (promoCode) {
      showToast(`Promo code ${promoCode} is ready to use!`, "success");
    }
  }, [promoCode, showToast]);

  useEffect(() => {
    const dataToFilter = selectedCategory ? search.results : activities.data;

    if (dataToFilter) {
      let filtered = [...dataToFilter];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (activity) =>
            activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            activity.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.province?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply price filter
      filtered = filtered.filter((activity) => {
        const price = activity.price_discount || activity.price || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });

      // Apply rating filter
      if (minRating > 0) {
        filtered = filtered.filter(
          (activity) => (activity.rating || 0) >= minRating
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return (
              (a.price_discount || a.price || 0) -
              (b.price_discount || b.price || 0)
            );
          case "price-high":
            return (
              (b.price_discount || b.price || 0) -
              (a.price_discount || a.price || 0)
            );
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "popular":
            return (b.total_reviews || 0) - (a.total_reviews || 0);
          case "newest":
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });

      setFilteredActivities(filtered);
    }
  }, [
    activities.data,
    search.results,
    selectedCategory,
    searchTerm,
    priceRange,
    minRating,
    sortBy,
  ]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await searchActivities({ destination: searchTerm.trim() });
    }
  };

  const handleAddToCart = async (activity) => {
    try {
      await addToCart(activity.id);

      let message = "Activity added to cart!";
      if (promoCode) {
        message += ` Don't forget to use promo code ${promoCode}!`;
      }

      showToast(message, "success");
    } catch (error) {
      showToast(error.message || "Failed to add to cart", "error");
    }
  };

  const handleViewActivity = (activity) => {
    if (!activity || !activity.id) {
      showToast("Activity data is invalid", "error");
      return;
    }
    navigate(`/activity/${activity.id}`, {
      state: { promoCode, promoId },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isLoading = selectedCategory ? search.loading : activities.loading;
  const hasError = selectedCategory ? search.error : activities.error;

  if (isLoading && filteredActivities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-sky-700 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Discover Amazing Activities
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              From adventure sports to cultural experiences, find the perfect
              activity for your next journey
            </p>
            {promoCode && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full text-sm font-semibold">
                <span>🎉 Promo {promoCode} is active!</span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search activities, destinations..."
                  className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-transparent rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  Categories
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      !selectedCategory
                        ? "bg-blue-100 text-blue-700 font-medium border-2 border-blue-200"
                        : "text-gray-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.data?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-700 font-medium border-2 border-blue-200"
                          : "text-gray-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Price Range
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Min
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        Max
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          (priceRange[1] / 10000000) * 100
                        }%, #e5e7eb ${
                          (priceRange[1] / 10000000) * 100
                        }%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600">
                        {formatPrice(priceRange[0])}
                      </span>
                      <span className="text-xs font-medium text-blue-600">
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  Minimum Rating
                </h4>
                <div className="space-y-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        minRating === rating
                          ? "bg-yellow-100 text-yellow-700 font-medium border-2 border-yellow-200"
                          : "text-gray-600 hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {rating === 0 ? (
                          <>
                            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                            <span>Any Rating</span>
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{rating}+ stars</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                  setPriceRange([0, 10000000]);
                  setMinRating(0);
                  setSortBy("newest");
                }}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-medium text-gray-700"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm font-medium text-blue-700">
                    {filteredActivities.length} activit
                    {filteredActivities.length !== 1 ? "ies" : "y"} found
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <ViewModeToggle value={viewMode} onChange={setViewMode} />

                {/* Sort Dropdown */}
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>

            {/* Error State */}
            {hasError && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{hasError}</p>
                <button
                  onClick={() =>
                    selectedCategory
                      ? fetchActivitiesByCategory(selectedCategory)
                      : fetchActivities()
                  }
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="large" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !hasError && filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No activities found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all activities
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                    setPriceRange([0, 10000000]);
                    setMinRating(0);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Activities Grid/List */}
            {!isLoading && !hasError && filteredActivities.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {filteredActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    variant={viewMode === "list" ? "featured" : "default"}
                    onViewDetails={handleViewActivity}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
