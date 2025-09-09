import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import CartCard from "../../components/CartCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";

// ...existing code...

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    loading,
    error,
    total,
    itemCount,
    fetchCartItems,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();
  const { showToast } = useToast();

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(itemId, { quantity: newQuantity });
      showToast("Cart updated successfully", "success");
    } catch {
      showToast("Failed to update cart", "error");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      showToast("Item removed from cart", "success");
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  const handleViewActivity = (activity) => {
    navigate(`/activity/${activity.id}`);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    try {
      // Simulate promo code validation
      // In real app, you'd call an API to validate promo codes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock promo validation
      const mockPromos = {
        SAVE10: { discount: 0.1, minPurchase: 100000 },
        WELCOME20: { discount: 0.2, minPurchase: 500000 },
        SUMMER15: { discount: 0.15, minPurchase: 200000 },
      };

      const promo = mockPromos[promoCode.toUpperCase()];
      if (promo && total >= promo.minPurchase) {
        setPromoDiscount(promo.discount);
        showToast(
          `Promo code applied! ${Math.round(promo.discount * 100)}% discount`,
          "success"
        );
      } else if (promo) {
        showToast(
          `Minimum purchase of ${formatPrice(promo.minPurchase)} required`,
          "warning"
        );
      } else {
        showToast("Invalid promo code", "error");
      }
    } catch {
      showToast("Failed to apply promo code", "error");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const selectedTotal = items
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => {
      const price = item.activity?.price_discount || item.activity?.price || 0;
      return sum + price * item.quantity;
    }, 0);

  const finalTotal = selectedTotal - selectedTotal * promoDiscount;
  const savings = selectedTotal * promoDiscount;

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      showToast("Please select items to checkout", "warning");
      return;
    }

    const selectedCartItems = items.filter((item) =>
      selectedItems.has(item.id)
    );
    navigate("/checkout", {
      state: {
        cartItems: selectedCartItems,
        promoCode: promoDiscount > 0 ? promoCode : null,
        promoDiscount,
        total: finalTotal,
      },
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Please Sign In
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to view your cart
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchCartItems()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2">
                {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={() => clearCart()}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any activities to your cart yet
            </p>
            <button
              onClick={() => navigate("/activities")}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Explore Activities
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.size === items.length && items.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">
                    Select All ({items.length} items)
                  </span>
                </label>
              </div>

              {/* Cart Items List */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200"
                >
                  <div className="p-4 border-b border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900">
                        Select this item
                      </span>
                    </label>
                  </div>

                  <CartCard
                    cartItem={item}
                    onUpdateQuantity={handleQuantityUpdate}
                    onRemove={handleRemoveItem}
                    onViewActivity={handleViewActivity}
                    className="border-0 shadow-none"
                  />
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Selected Items */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Selected Items ({selectedItems.size})
                    </span>
                    <span className="font-medium">
                      {formatPrice(selectedTotal)}
                    </span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Promo Discount ({Math.round(promoDiscount * 100)}%)
                      </span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCode.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                {selectedItems.size === 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Select items to proceed to checkout
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Cart Item Component
const EnhancedCartItem = ({
  item,
  isSelected,
  onSelect,
  onQuantityChange,
  onRemove,
  onViewActivity,
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const activity = item.activity;
  const currentPrice = activity?.price_discount || activity?.price || 0;
  const originalPrice = activity?.price;
  const hasDiscount =
    originalPrice &&
    activity?.price_discount &&
    originalPrice > activity.price_discount;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((originalPrice - activity.price_discount) / originalPrice) * 100
      )
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>

          {/* Activity Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-600">
              {activity?.imageUrls?.[0] ? (
                <img
                  src={activity.imageUrls[0]}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Activity Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {activity?.title || "Unknown Activity"}
                </h3>

                <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                  {activity?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.city}</span>
                    </div>
                  )}

                  {activity?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    {hasDiscount && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(currentPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        -{discountPercentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          onQuantityChange(Math.max(1, item.quantity - 1))
                        }
                        className="p-2 hover:bg-gray-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onQuantityChange(item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(currentPrice * item.quantity)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={onViewActivity}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View activity details"
                >
                  <Info className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {}}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Add to favorites"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={onRemove}
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
    </div>
  );
};

// Cart Summary Component
const CartSummary = ({
  items,
  selectedItems,
  // total,
  promoCode,
  promoDiscount,
  isApplyingPromo,
  onPromoCodeChange,
  onApplyPromo,
  onCheckout,
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedTotal = items
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => {
      const price = item.activity?.price_discount || item.activity?.price || 0;
      return sum + price * item.quantity;
    }, 0);

  const discountAmount = selectedTotal * promoDiscount;
  const finalTotal = selectedTotal - discountAmount;
  const selectedCount = selectedItems.size;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        Order Summary
      </h3>

      {/* Selected Items Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">
              {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
            </span>
          </div>
          <span className="font-bold text-blue-800">
            {formatPrice(selectedTotal)}
          </span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({selectedCount} items)</span>
          <span>{formatPrice(selectedTotal)}</span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>Promo Discount ({Math.round(promoDiscount * 100)}%)</span>
            </div>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Have a promo code?
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              placeholder="Enter promo code"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <button
            onClick={onApplyPromo}
            disabled={isApplyingPromo || !promoCode.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
          >
            {isApplyingPromo ? "..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={selectedCount === 0}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 rounded-lg transition-all duration-200 font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
      >
        <ShoppingCart className="w-5 h-5" />
        Proceed to Checkout
        <ArrowRight className="w-5 h-5" />
      </button>

      {selectedCount === 0 && (
        <p className="text-sm text-gray-500 mt-3 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Select items to proceed to checkout
        </p>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Secure checkout with SSL encryption</span>
        </div>
      </div>
    </div>
  );
};
