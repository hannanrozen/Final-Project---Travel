import { useState } from "react";
import { Tag, Calendar, Copy, Check } from "lucide-react";
import { commonButtons } from "../utils/buttonStyles";
import cardImageFallback from "../assets/images/card_image.jpg";

export default function PromoCard({
  promo,
  onClaim,
  onViewDetails,
  variant = "default", // 'default', 'compact', 'featured'
  className = "",
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const getImageUrl = () => {
    if (imageError) {
      return cardImageFallback;
    }
    return promo?.imageUrl || cardImageFallback;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageLoaded(true);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCopyCode = async () => {
    if (promo?.promo_code) {
      try {
        await navigator.clipboard.writeText(promo.promo_code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    }
  };

  if (variant === "compact") {
    return (
      <div
        className={`bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl p-4 text-white ${className}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4" />
          <span className="text-sm font-medium opacity-90">Special Offer</span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{promo?.title}</h3>
        <div className="text-2xl font-bold mb-3">
          Save {formatPrice(promo?.promo_discount_price || 0)}
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
            {promo?.promo_code}
          </code>
          <button
            onClick={handleCopyCode}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {codeCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group ${className}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={promo?.title || "Promo"}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600  animate-pulse" />
        )}

        {/* Discount Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
          Save {formatPrice(promo?.promo_discount_price || 0)}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600">
            Limited Time Offer
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {promo?.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {promo?.description}
        </p>

        {/* Promo Code */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600 block mb-1">
                Promo Code:
              </span>
              <code className="text-lg font-bold text-blue-600 font-mono">
                {promo?.promo_code}
              </code>
            </div>
            <button
              onClick={handleCopyCode}
              className={`${commonButtons.copyCodeButton} ${
                codeCopied ? "bg-green-100 text-green-700" : ""
              }`}
              title="Copy code"
            >
              {codeCopied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="text-sm text-gray-500 mb-4">
          <span className="font-medium">Minimum purchase:</span>{" "}
          {formatPrice(promo?.minimum_claim_price || 0)}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(promo)}
              className={`${commonButtons.learnMoreButton} flex-1 text-sm`}
            >
              View Terms
            </button>
          )}
          {onClaim && (
            <button
              onClick={() => onClaim(promo)}
              className={`${commonButtons.promoButton} flex-1 text-sm`}
            >
              Claim Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
