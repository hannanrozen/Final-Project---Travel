// src/components/CartCard.jsx
import { useState } from "react";
import { MapPin, Trash2, Eye, Star, Users } from "lucide-react";
import cardImageFallback from "../assets/images/card_image.jpg";

export default function CartCard({
  cartItem,
  onRemove,
  onViewActivity,
  className = "",
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const getImageUrl = () => {
    if (imageError) return cardImageFallback;
    const activity = cartItem.activity || {};
    const imageUrl =
      activity.imageUrls?.[0] || activity.imageUrl || activity.image;

    if (!imageUrl || imageUrl === "" || imageUrl === "null") {
      return cardImageFallback;
    }

    return imageUrl;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageLoaded(true);
    }
  };

  const activity = cartItem.activity || {};
  const currentPrice = activity?.price_discount || activity?.price || 0;
  const originalPrice = activity?.price;
  const hasDiscount =
    originalPrice &&
    activity?.price_discount &&
    originalPrice > activity.price_discount;
  const quantity = cartItem.quantity || 1;
  const subtotal = currentPrice * quantity;

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden ${className}`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative md:w-48 h-48 md:h-auto flex-shrink-0">
          <img
            src={getImageUrl()}
            alt={activity?.title || "Activity"}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {activity?.title || "Unknown Activity"}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                {activity?.description || "No description available"}
              </p>

              <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                {activity?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{activity.city}</span>
                  </div>
                )}
                {activity?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{activity.rating}</span>
                  </div>
                )}
                {activity?.total_reviews && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{activity.total_reviews} reviews</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                {hasDiscount && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </div>
                )}
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(currentPrice)}
                  <span className="text-sm text-gray-500 ml-1">/ person</span>
                </div>
                {hasDiscount && (
                  <div className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                    -
                    {Math.round(
                      ((originalPrice - activity.price_discount) /
                        originalPrice) *
                        100
                    )}
                    %
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Quantity:{" "}
                  <span className="font-medium text-gray-900">{quantity}</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatPrice(subtotal)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 ml-4">
              <button
                onClick={() => onViewActivity?.(activity)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View details"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onRemove?.(cartItem.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove from cart"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
