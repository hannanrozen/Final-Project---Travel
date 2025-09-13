import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Copy,
  Calendar,
  Gift,
  Percent,
  ArrowUpDown,
  SlidersHorizontal,
  Star,
  Clock,
  Tag,
  ShoppingCart,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPromos } from "../../api/promo";
import { useToast } from "../../hooks/useToast";
import { commonButtons } from "../../utils/buttonStyles";
import SortDropdown from "../../components/SortDropdown";
// Import fallback image
import promoImageFallback from "../../assets/images/promo_image.jpg";

const PromoPage = () => {
  const [promos, setPromos] = useState({
    data: [],
    loading: true,
    error: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredPromos, setFilteredPromos] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    discountRange: [0, 1_000_000],
    minPurchase: [0, 5_000_000],
  });
  const [imageErrors, setImageErrors] = useState(new Set()); // Track failed images
  const { showToast } = useToast();

  const sortOptions = [
    {
      value: "newest",
      label: "Newest First",
      description: "Latest promos first",
      icon: Calendar,
    },
    {
      value: "oldest",
      label: "Oldest First",
      description: "Oldest promos first",
      icon: Clock,
    },
    {
      value: "discount",
      label: "Highest Discount",
      description: "Best savings first",
      icon: Tag,
    },
    {
      value: "expiring",
      label: "Lowest Price",
      description: "Lowest minimum purchase",
      icon: Percent,
    },
  ];

  // Handle image load errors
  const handleImageError = (promoId) => {
    setImageErrors((prev) => new Set([...prev, promoId]));
  };

  // Get image source with fallback logic
  const getPromoImageSrc = (promo) => {
    if (imageErrors.has(promo.id)) {
      return promoImageFallback;
    }

    const promoImage = promo?.imageUrl || promo?.imageUrls?.[0] || promo?.image;
    if (!promoImage || promoImage === "" || promoImage === "null") {
      return promoImageFallback;
    }

    return promoImage;
  };

  // Fetch promos on component mount
  useEffect(() => {
    const fetchPromos = async () => {
      setPromos((prev) => ({ ...prev, loading: true }));

      try {
        const result = await getPromos();
        if (result.success) {
          setPromos({
            data: result.data?.data || [],
            loading: false,
            error: null,
          });
        } else {
          setPromos((prev) => ({
            ...prev,
            loading: false,
            error: result.error || "Failed to fetch promos",
          }));
        }
      } catch {
        setPromos((prev) => ({
          ...prev,
          loading: false,
          error: "An unexpected error occurred",
        }));
      }
    };

    fetchPromos();
  }, []);

  // Filter and sort promos
  useEffect(() => {
    let filtered =
      promos.data?.filter((promo) => {
        // Search filter
        const matchesSearch =
          !searchTerm ||
          promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.promo_code?.toLowerCase().includes(searchTerm.toLowerCase());

        // Discount range filter
        const discount = promo.promo_discount_price || 0;
        const matchesDiscountRange =
          discount >= filters.discountRange[0] &&
          discount <= filters.discountRange[1];

        // Minimum purchase filter
        const minPurchase = promo.minimum_claim_price || 0;
        const matchesMinPurchase =
          minPurchase >= filters.minPurchase[0] &&
          minPurchase <= filters.minPurchase[1];

        return matchesSearch && matchesDiscountRange && matchesMinPurchase;
      }) || [];

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "discount":
          return (b.promo_discount_price || 0) - (a.promo_discount_price || 0);
        case "expiring":
          return (a.minimum_claim_price || 0) - (b.minimum_claim_price || 0);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredPromos(filtered);
  }, [promos.data, searchTerm, sortBy, filters]);

  const handleCopyPromoCode = async (promoCode) => {
    try {
      await navigator.clipboard.writeText(promoCode);
      showToast(`Promo code ${promoCode} copied to clipboard!`, "success");
    } catch {
      showToast("Failed to copy promo code", "error");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Amazing Travel Promos
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover incredible deals and save on your next adventure
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-16  min-h-screen">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              {/* Discount Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-blue-700 mb-3">
                  Discount Amount
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(filters.discountRange[0])}</span>
                    <span>{formatPrice(filters.discountRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={filters.discountRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        discountRange: [0, parseInt(e.target.value)],
                      }))
                    }
                    className="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Minimum Purchase Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-blue-700 mb-3">
                  Minimum Purchase
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(filters.minPurchase[0])}</span>
                    <span>{formatPrice(filters.minPurchase[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={filters.minPurchase[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPurchase: [0, parseInt(e.target.value)],
                      }))
                    }
                    className="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() =>
                  setFilters({
                    discountRange: [0, 1000000],
                    minPurchase: [0, 5000000],
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-medium text-gray-700"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search promos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-blue-700">
                      {filteredPromos.length} promo
                      {filteredPromos.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <SortDropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                  />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {promos.loading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading promos...</p>
              </div>
            )}

            {/* Error State */}
            {promos.error && (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-red-600 font-medium">
                    Failed to load promos
                  </p>
                  <p className="text-red-500 mt-2">{promos.error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className={commonButtons.removeButton}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* No Results */}
            {!promos.loading &&
              !promos.error &&
              filteredPromos.length === 0 &&
              promos.data?.length > 0 && (
                <div className="text-center py-16">
                  <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No promos found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}

            {/* Empty State */}
            {!promos.loading && !promos.error && promos.data?.length === 0 && (
              <div className="text-center py-16">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No promos available
                </h3>
                <p className="text-gray-600">
                  Check back soon for amazing travel deals!
                </p>
              </div>
            )}

            {/* Promos Grid */}
            {!promos.loading && !promos.error && filteredPromos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 py-8">
                {filteredPromos.map((promo) => (
                  <PromoCard
                    key={promo.id}
                    promo={promo}
                    onCopyCode={handleCopyPromoCode}
                    getImageSrc={getPromoImageSrc}
                    onImageError={handleImageError}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Miss Out on Amazing Deals!
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Sign up for our newsletter and be the first to know about exclusive
            travel promos, flash sales, and limited-time offers that could save
            you hundreds on your next adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-lg">
              Subscribe Now
            </button>
          </div>
          <p className="text-sm mt-4 opacity-75">
            ✈️ No spam, just amazing travel deals delivered to your inbox
          </p>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-xl shadow-md">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600 font-medium">Active Promos</div>
            <div className="text-sm text-gray-500 mt-1">Updated daily</div>
          </div>
          <div className="text-center p-8 bg-white rounded-xl shadow-md">
            <div className="text-4xl font-bold text-green-600 mb-2">$2M+</div>
            <div className="text-gray-600 font-medium">Total Savings</div>
            <div className="text-sm text-gray-500 mt-1">For our customers</div>
          </div>
          <div className="text-center p-8 bg-white rounded-xl shadow-md">
            <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
            <div className="text-gray-600 font-medium">Happy Travelers</div>
            <div className="text-sm text-gray-500 mt-1">And counting</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Promo Card Component with Fallback Image Support
const PromoCard = ({ promo, onCopyCode, getImageSrc, onImageError }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price || 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Promo Image with Fallback */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center overflow-hidden">
        <img
          src={getImageSrc(promo)}
          alt={promo.title || "Special Promo"}
          onError={() => onImageError(promo.id)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {promo.promo_discount_price && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Save {formatPrice(promo.promo_discount_price)}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Promo Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {promo.title || "Special Offer"}
        </h3>

        {/* Promo Description */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {promo.description ||
            "Amazing travel deal available for a limited time!"}
        </p>

        {/* Promo Details */}
        <div className="space-y-3 mb-6">
          {promo.promo_discount_price && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Discount
                </span>
              </div>
              <span className="font-bold text-green-700 text-lg">
                {formatPrice(promo.promo_discount_price)}
              </span>
            </div>
          )}

          {promo.minimum_claim_price && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  Min. Purchase
                </span>
              </div>
              <span className="font-semibold text-blue-700">
                {formatPrice(promo.minimum_claim_price)}
              </span>
            </div>
          )}
        </div>

        {/* Promo Code */}
        {promo.promo_code && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">
                  Promo Code
                </p>
                <p className="font-mono font-bold text-xl text-blue-600 tracking-wider">
                  {promo.promo_code}
                </p>
              </div>
              <button
                onClick={() => onCopyCode(promo.promo_code)}
                className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                title="Copy promo code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => (window.location.href = "/activities")}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Use This Promo
        </button>
      </div>
    </div>
  );
};

export default PromoPage;
