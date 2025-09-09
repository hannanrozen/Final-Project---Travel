import { ShoppingCart, Plus, Minus, Trash2, Heart, Eye } from "lucide-react";
import { useState } from "react";
import { commonButtons } from "../utils/buttonStyles";
import cardImageFallback from "../assets/images/card_image.jpg";

export default function CartCard({
  cartItem,
  onUpdateQuantity,
  onRemove,
  onViewActivity,
  className = "",
}) {
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    onUpdateQuantity?.(cartItem.id, newQuantity);
  };

  const getImageUrl = () => {
    if (imageError) {
      return cardImageFallback;
    }
    if (
      cartItem?.activity?.imageUrls &&
      cartItem.activity.imageUrls.length > 0
    ) {
      return cartItem.activity.imageUrls[0];
    }
    return cartItem?.activity?.imageUrl || cardImageFallback;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageLoaded(true);
    }
  };

  const subtotal =
    (cartItem?.activity?.price_discount || cartItem?.activity?.price || 0) *
    quantity;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image */}
        <div className="relative lg:w-48 h-48 lg:h-auto flex-shrink-0">
          <img
            src={getImageUrl()}
            alt={cartItem?.activity?.title || "Activity"}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {cartItem?.activity?.title}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {cartItem?.activity?.description}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>
                  {cartItem?.activity?.city}, {cartItem?.activity?.province}
                </span>
              </div>
            </div>

            <button
              onClick={() => onRemove?.(cartItem.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove from cart"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Price and Quantity */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start justify-between lg:block">
              <div className="space-y-1">
                {cartItem?.activity?.price_discount &&
                  cartItem?.activity?.price_discount <
                    cartItem?.activity?.price && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatPrice(cartItem.activity.price)}
                    </div>
                  )}
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(
                    cartItem?.activity?.price_discount ||
                      cartItem?.activity?.price ||
                      0
                  )}
                  <span className="text-sm text-gray-500 font-normal">
                    {" "}
                    / person
                  </span>
                </div>
              </div>
              {cartItem?.activity?.price_discount &&
                cartItem?.activity?.price_discount <
                  cartItem?.activity?.price && (
                  <div className="text-right lg:hidden">
                    <div className="text-sm text-green-600 font-medium">
                      You save{" "}
                      {formatPrice(
                        cartItem.activity.price -
                          cartItem.activity.price_discount
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex items-center gap-4">
              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <div className="text-sm text-gray-500">Subtotal</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatPrice(subtotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onViewActivity?.(cartItem?.activity)}
              className={`${commonButtons.learnMoreButton} flex-1 text-sm`}
            >
              <Eye className="w-3 h-3" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
