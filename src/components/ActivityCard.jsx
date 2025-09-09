import { Star, MapPin, Eye, Calendar } from "lucide-react";
import { useState } from "react";
import { commonButtons } from "../utils/buttonStyles";
import cardImageFallback from "../assets/images/card_image.jpg";

export default function ActivityCard({
  activity,
  onViewDetails,
  onAddToCart,
  showAddToCart = true,
  variant = "default", // 'default', 'compact', 'featured'
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatRating = (rating) => {
    return Number(rating).toFixed(1);
  };

  const getImageUrl = () => {
    if (imageError) {
      return cardImageFallback;
    }
    if (activity?.imageUrls && activity.imageUrls.length > 0) {
      return activity.imageUrls[0];
    }
    return activity?.imageUrl || cardImageFallback;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageLoaded(true); // Set loaded to true to show the fallback image
    }
  };

  const hasDiscount =
    activity?.price_discount &&
    activity?.price_discount > 0 &&
    activity?.price_discount < activity?.price;

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="relative h-40">
          <img
            src={getImageUrl()}
            alt={activity?.title || "Activity"}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -
              {Math.round(
                ((activity.price - activity.price_discount) / activity.price) *
                  100
              )}
              %
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
            {activity?.title}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 line-clamp-1">
              {activity?.city}, {activity?.province}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {formatRating(activity?.rating || 0)}
                {activity?.total_reviews && activity?.total_reviews > 0
                  ? ` (${activity.total_reviews})`
                  : ""}
              </span>
            </div>
            <div className="text-right space-y-1">
              {hasDiscount && (
                <div className="text-xs text-gray-400 line-through">
                  {formatPrice(activity.price)}
                </div>
              )}
              <div className="text-sm font-bold text-blue-600">
                {formatPrice(
                  hasDiscount ? activity.price_discount : activity?.price || 0
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full ${
        variant === "featured" ? "lg:flex lg:flex-row" : ""
      }`}
    >
      <div className={`relative ${variant === "featured" ? "lg:w-1/2" : ""}`}>
        <div
          className={`${
            variant === "featured" ? "h-64 lg:h-full" : "h-48"
          } relative overflow-hidden`}
        >
          <img
            src={getImageUrl()}
            alt={activity?.title || "Activity"}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
              SAVE{" "}
              {Math.round(
                ((activity.price - activity.price_discount) / activity.price) *
                  100
              )}
              %
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>

      <div
        className={`p-6 flex flex-col flex-1 ${
          variant === "featured" ? "lg:w-1/2 justify-between" : ""
        }`}
      >
        {/* Header section - flexible content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {formatRating(activity?.rating || 0)}
              </span>
              {activity?.total_reviews && activity?.total_reviews > 0 && (
                <span className="text-sm text-gray-500">
                  ({activity.total_reviews} reviews)
                </span>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
            {activity?.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {activity?.description}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {activity?.address
                ? `${activity.city}, ${activity.province}`
                : "Location not specified"}
            </span>
          </div>
        </div>

        {/* Footer section - consistent spacing */}
        <div className="space-y-4 mt-auto">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {hasDiscount && (
                <div className="text-sm text-gray-400 line-through">
                  {formatPrice(activity.price)}
                </div>
              )}
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(
                  hasDiscount ? activity.price_discount : activity?.price || 0
                )}
              </div>
            </div>
            {hasDiscount && (
              <div className="text-right">
                <div className="text-sm text-green-600 font-medium">
                  You save{" "}
                  {formatPrice(activity.price - activity.price_discount)}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails?.(activity)}
              className={`${commonButtons.learnMoreButton} flex-1 text-xs px-3 py-1.5`}
            >
              <Eye className="w-3 h-3" />
              View Details
            </button>
            {showAddToCart && (
              <button
                onClick={() => onAddToCart?.(activity)}
                className={`${commonButtons.addToCartButton} flex-1 text-xs px-3 py-1.5`}
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
