import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BannerCard from "../../components/BannerCard";
import SearchSection from "../../components/SearchSection";
import ActivityCard from "../../components/ActivityCard";
import PromoCard from "../../components/PromoCard";
import TrustedCompanies from "../../components/TrustedCompanies";
import FAQSection from "../../components/FAQSection";
import CallToActionSection from "../../components/CallToActionSection";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTravelData } from "../../hooks/useTravelDataNew";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { commonButtons } from "../../utils/buttonStyles";

export default function HomeIndex() {
  const navigate = useNavigate();
  const {
    banners,
    activities,
    promos,
    fetchBanners,
    fetchActivities,
    fetchPromos,
    searchActivities,
  } = useTravelData();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    // Fetch initial data
    fetchBanners();
    fetchActivities(6); // Limit to 6 activities for homepage
    fetchPromos(4); // Limit to 4 promos
  }, [fetchBanners, fetchActivities, fetchPromos]);

  // Auto-rotate hero banners
  useEffect(() => {
    if (banners.data && banners.data.length > 1) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % banners.data.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.data]);

  const handleSearch = async (searchParams) => {
    await searchActivities(searchParams);
    navigate("/activities");
  };

  const handleAddToCart = async (activity) => {
    try {
      await addToCart({
        activityId: activity.id,
        quantity: 1,
      });
      showToast("Activity added to cart!", "success");
    } catch (error) {
      showToast(error.message || "Failed to add to cart", "error");
    }
  };

  const handleViewActivity = (activity) => {
    navigate(`/activity/${activity.id}`);
  };

  const handleViewPromo = (promo) => {
    navigate(`/promo/${promo.id}`);
  };

  const handleExploreActivities = () => {
    navigate("/activities");
  };

  const handleExplorePromos = () => {
    navigate("/promos");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section with Banner */}
      <section className="relative">
        {banners.loading ? (
          <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-500 to-sky-600">
            <LoadingSpinner size="large" />
          </div>
        ) : banners.data && banners.data.length > 0 ? (
          <BannerCard
            banner={banners.data[heroIndex]}
            variant="hero"
            className="min-h-[600px]"
          />
        ) : (
          <div className="min-h-[600px] bg-gradient-to-br from-blue-500 to-cyan-600  flex items-center justify-center text-white">
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl lg:text-6xl font-bold">
                Discover Your Next Amazing Journey
              </h1>
              <p className="text-xl opacity-90">
                Excitement and Wonder Await You!
              </p>
            </div>
          </div>
        )}

        {/* Search Section Overlay */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <SearchSection onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <TrustedCompanies className="pt-32" />

      {/* Best Travel Deals Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 block">
              Featured Activities
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Discover the Best Travel Deals of the Month
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our most popular activities from every category. Whether
              it's a resort getaway, adventure trip, or cultural experience, we
              have something extraordinary for every traveler.
            </p>
          </div>

          {activities.loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {activities.data.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onViewDetails={handleViewActivity}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleExploreActivities}
              className={commonButtons.exploreButton}
            >
              Explore All Activities
            </button>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 block">
              Limited Time Offers
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Amazing Deals & Discounts
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these incredible savings! Use our exclusive
              promo codes and save big on your next adventure.
            </p>
          </div>

          {promos.loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
              {promos.data.map((promo) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  variant="compact"
                  onViewDetails={handleViewPromo}
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleExplorePromos}
              className={commonButtons.promoButton}
            >
              View All Promos
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Call to Action */}
      <CallToActionSection
        onGetStarted={() => navigate("/activities")}
        onExplore={() => navigate("/categories")}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
