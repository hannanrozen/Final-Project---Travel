import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cardImageFallback from "../../assets/images/card_image.jpg";
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  Users,
  Heart,
  Share2,
  Plus,
  Minus,
  ShoppingCart,
  Camera,
  CheckCircle,
  Clock,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getActivityById } from "../../api/activity";
import { addToCart } from "../../api/cart";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { buttonStyles, combineButtonClasses } from "../../utils/buttonStyles";

const ActivityDetailWithCalendar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { authenticated } = useAuth();

  // Activity data state
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Booking state
  const [selectedDate, setSelectedDate] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [bookingNow, setBookingNow] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        console.log("Fetching activity with ID:", id);

        const result = await getActivityById(id);
        console.log("API Response:", result);

        if (result.success && result.data) {
          const activityData = result.data.data || result.data;
          console.log("Activity Data:", activityData);
          setActivity(activityData);

          if (activityData.imageUrls && activityData.imageUrls.length > 0) {
            setSelectedImage(0);
          }

          // Generate available dates (next 30 days for demo)
          generateAvailableDates();
        } else {
          console.error("Failed to fetch activity:", result.error);
          showToast(result.error || "Activity not found", "error");
          navigate("/activities");
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
        showToast("Error loading activity details", "error");
        navigate("/activities");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchActivity();
    }
  }, [id, navigate, showToast]);

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    setAvailableDates(dates);
  };

  const handleAddToCart = async () => {
    if (!authenticated) {
      showToast("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }

    if (!selectedDate) {
      showToast("Please select a date first", "warning");
      return;
    }

    try {
      setAddingToCart(true);

      for (let i = 0; i < quantity; i++) {
        const result = await addToCart({
          activityId: id,
          date: selectedDate.toISOString(),
          quantity: 1,
        });

        if (!result.success) {
          showToast(result.error || "Failed to add to cart", "error");
          return;
        }
      }

      showToast(`Added ${quantity} ticket(s) to cart successfully!`, "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Error adding to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBookNow = async () => {
    if (!authenticated) {
      showToast("Please login to book now", "warning");
      navigate("/login");
      return;
    }

    if (!selectedDate) {
      showToast("Please select a date first", "warning");
      return;
    }

    try {
      setBookingNow(true);

      // Navigate to BookNowPage with booking details
      navigate(`/book-now/${id}`, {
        state: {
          directBooking: true,
          activityId: id,
          activityTitle: activity.title,
          date: selectedDate.toISOString(),
          quantity: quantity,
          price: getCurrentPrice(),
          totalPrice: getTotalPrice(),
        },
      });
    } catch (error) {
      console.error("Error navigating to book now page:", error);
      showToast("Error processing booking", "error");
    } finally {
      setBookingNow(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: activity?.title,
          text: activity?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!", "success");
      }
    } catch {
      showToast("Failed to share", "error");
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    showToast(
      isFavorited ? "Removed from favorites" : "Added to favorites",
      "success"
    );
  };

  const calculateDiscount = () => {
    if (
      activity?.price &&
      activity?.price_discount &&
      activity.price > activity.price_discount
    ) {
      return Math.round(
        ((activity.price - activity.price_discount) / activity.price) * 100
      );
    }
    return 0;
  };

  const getCurrentPrice = () => {
    return activity?.price_discount && activity.price_discount > 0
      ? activity.price_discount
      : activity?.price || 0;
  };

  const getTotalPrice = () => {
    return getCurrentPrice() * quantity;
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (date) => {
    return availableDates.some(
      (availableDate) => availableDate.toDateString() === date.toDateString()
    );
  };

  const isDateSelected = (date) => {
    return selectedDate && selectedDate.toDateString() === date.toDateString();
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const parseFacilities = (facilities) => {
    if (!facilities || facilities === "tidak ada") return [];
    if (typeof facilities === "string") {
      try {
        return JSON.parse(facilities);
      } catch {
        return facilities.split(",").map((f) => f.trim());
      }
    }
    return Array.isArray(facilities) ? facilities : [];
  };

  const renderLocationMap = () => {
    if (!activity?.location_maps) return null;

    // Extract src from iframe
    const iframeSrcMatch = activity.location_maps.match(/src="([^"]+)"/);
    const mapSrc = iframeSrcMatch ? iframeSrcMatch[1] : null;

    if (!mapSrc) return null;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Location Map
        </h3>
        <div className="relative w-full h-80 rounded-xl overflow-hidden">
          <iframe
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Activity Location Map"
          />
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{activity.address}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {activity.city}, {activity.province}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isAvailable = isDateAvailable(date);
      const isSelected = isDateSelected(date);
      const isPast = date < today;

      days.push(
        <button
          key={day}
          onClick={() => isAvailable && !isPast && setSelectedDate(date)}
          disabled={!isAvailable || isPast}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
            ${
              isSelected
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : isAvailable && !isPast
                ? "bg-blue-50 hover:bg-blue-100 text-blue-600 hover:scale-105"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Select Date</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-gray-700 min-w-[120px] text-center">
              {currentMonth.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {selectedDate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Selected Date:</strong> {formatDate(selectedDate)}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activity not found
            </h2>
            <p className="text-gray-600 mb-6">
              The activity you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate("/activities")}
              className={combineButtonClasses(
                buttonStyles.primary.base,
                buttonStyles.primary.gradient
              )}
            >
              Browse Activities
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const facilities = parseFacilities(activity.facilities);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Activities</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-600 mb-4">
                {activity.imageUrls && activity.imageUrls.length > 0 ? (
                  <img
                    src={activity.imageUrls[selectedImage]}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = cardImageFallback;
                    }}
                  />
                ) : (
                  <img
                    src={cardImageFallback}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                      isFavorited
                        ? "bg-red-500 text-white"
                        : "bg-white/90 text-gray-700 hover:bg-white"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white/90 text-gray-700 rounded-full backdrop-blur-sm hover:bg-white"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {discount}% OFF
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {activity.imageUrls && activity.imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {activity.imageUrls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-blue-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${activity.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = cardImageFallback;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                {activity.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {activity.category.name}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {activity.rating || "New"}
                  </span>
                  {activity.total_reviews > 0 && (
                    <span className="text-gray-500 text-sm">
                      ({activity.total_reviews} reviews)
                    </span>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {activity.title}
              </h1>

              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {activity.city}, {activity.province}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {activity.description !== "tidak ada"
                    ? activity.description
                    : "Explore this amazing activity and create unforgettable memories!"}
                </p>
              </div>

              {/* Facilities */}
              {facilities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Facilities & Features
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location Map */}
            {renderLocationMap()}
          </div>

          {/* Right Column - Booking Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price & Booking Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Price per person</p>
                <div className="flex items-center justify-center gap-3">
                  {activity.price &&
                    activity.price_discount &&
                    activity.price > activity.price_discount && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(activity.price)}
                      </span>
                    )}
                  <span className="text-3xl font-bold text-blue-600">
                    {formatCurrency(getCurrentPrice())}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Save{" "}
                      {formatCurrency(activity.price - activity.price_discount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Calendar */}
              <div className="mb-6">{renderCalendar()}</div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">
                    Subtotal ({quantity} tickets)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">
                      {formatDate(selectedDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !selectedDate}
                  className={combineButtonClasses(
                    buttonStyles.secondary.base,
                    buttonStyles.secondary.outlined,
                    "w-full h-12",
                    (!selectedDate || addingToCart) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>

                {/* Book Now Button */}
                <button
                  onClick={handleBookNow}
                  disabled={bookingNow || !selectedDate}
                  className={`
                    w-full h-14 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3
                    ${
                      !selectedDate || bookingNow
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                    }
                  `}
                >
                  {bookingNow ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Processing Booking...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-6 h-6" />
                      <span>Book Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Info */}
              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Flexible cancellation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Group discounts available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>Best price guarantee</span>
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

export default ActivityDetailWithCalendar;
