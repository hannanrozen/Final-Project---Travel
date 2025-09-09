import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { commonButtons } from "../utils/buttonStyles";
import cardImageFallback from "../assets/images/card_image.jpg";

export default function BannerCard({
  banner,
  onViewDetails,
  variant = "hero", // 'hero', 'card', 'carousel'
  className = "",
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (imageError) {
      return cardImageFallback;
    }
    return banner?.imageUrl || cardImageFallback;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageLoaded(true);
    }
  };

  if (variant === "hero") {
    return (
      <div
        className={`relative min-h-[500px] lg:min-h-[600px]  overflow-hidden ${className}`}
      >
        <img
          src={getImageUrl()}
          alt={banner?.name || "Banner"}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600  animate-pulse" />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-start p-8 lg:p-16">
          <div className="max-w-2xl text-white space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {banner?.name || "Discover Your Next Amazing Journey"}
            </h1>
            <p className="text-lg lg:text-xl opacity-90 leading-relaxed">
              Excitement and Wonder Await You!
            </p>
            <button
              onClick={() => onViewDetails?.(banner)}
              className={commonButtons.exploreButton}
            >
              Explore Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "carousel") {
    return (
      <div
        className={`relative h-64 lg:h-80 rounded-xl overflow-hidden ${className}`}
      >
        <img
          src={getImageUrl()}
          alt={banner?.name || "Banner"}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl lg:text-2xl font-bold mb-2">{banner?.name}</h3>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(banner)}
              className="text-sm font-medium underline hover:no-underline transition-all"
            >
              Learn More
            </button>
          )}
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group ${className}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={banner?.name || "Banner"}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {banner?.name}
        </h3>

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(banner)}
            className={`${commonButtons.learnMoreButton} w-full mt-4`}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
