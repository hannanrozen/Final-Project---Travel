import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import cardImageFallback from "../../assets/images/card_image.jpg";

export default function CartPage() {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const { items, loading, error, fetchCartItems, removeFromCart } = useCart();
  const { showToast } = useToast();

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [removing, setRemoving] = useState(new Set());
  const [imageErrors, setImageErrors] = useState(new Set());

  useEffect(() => {
    if (authenticated) {
      fetchCartItems();
    }
  }, [authenticated, fetchCartItems]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageSrc = (item) => {
    if (imageErrors.has(item.id)) {
      return cardImageFallback;
    }

    const activityImage =
      item.activity?.imageUrls?.[0] ||
      item.activity?.imageUrl ||
      item.activity?.image;

    if (
      !activityImage ||
      activityImage === "" ||
      activityImage === "null" ||
      activityImage === null
    ) {
      return cardImageFallback;
    }

    return activityImage;
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => new Set([...prev, itemId]));
  };

  const handleRemoveItem = async (cartId, activityTitle) => {
    try {
      setRemoving((prev) => new Set([...prev, cartId]));
      await removeFromCart(cartId);
      showToast(`${activityTitle} removed from cart`, "success");
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
      setImageErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      showToast("Failed to remove item from cart", "error");
    } finally {
      setRemoving((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const toggleItemSelection = (cartId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cartId)) {
        newSet.delete(cartId);
      } else {
        newSet.add(cartId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const getSelectedItemsTotal = () => {
    return items
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => {
        const price =
          item.activity?.price_discount || item.activity?.price || 0;
        return total + price;
      }, 0);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.activity?.price_discount || item.activity?.price || 0;
      return total + price;
    }, 0);
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) {
      showToast("Please select items to checkout", "warning");
      return;
    }
    const selectedCartItems = items.filter((item) =>
      selectedItems.has(item.id)
    );
    localStorage.setItem(
      "selectedCartItems",
      JSON.stringify(selectedCartItems)
    );
    navigate("/checkout");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Please log in to view your cart
            </h2>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go to Login
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-800 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-1">
                {items.length} {items.length === 1 ? "item" : "items"} in your
                cart
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Error Loading Cart
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => fetchCartItems()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Cart Content */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200">
                {/* Select All Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.size === items.length &&
                          items.length > 0
                        }
                        onChange={selectAllItems}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Select All ({items.length} items)
                      </span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {selectedItems.size} selected
                    </span>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-flex gap-6 p-6 hover:bg-gray-50 transition rounded-2xl"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>

                        {/* Activity Image */}
                        <div className="w-32 h-32 flex">
                          <img
                            src={getImageSrc(item)}
                            alt={item.activity?.title || "Activity"}
                            onError={(e) => {
                              e.currentTarget.src = cardImageFallback;
                              handleImageError(item.id);
                            }}
                            className="w-full h-full rounded-xl object-cover border border-gray-200"
                          />
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.activity?.title || "Unknown Activity"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.activity?.description
                              ? item.activity.description.substring(0, 100) +
                                "..."
                              : "No description available"}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              Category: {item.activity?.category?.name || "N/A"}
                            </span>
                            <span>•</span>
                            <span>
                              Rating: {item.activity?.rating || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex-shrink-0 text-right">
                          <div className="mb-4">
                            {item.activity?.price_discount &&
                            item.activity.price_discount <
                              item.activity.price ? (
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  {formatPrice(item.activity.price_discount)}
                                </div>
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.activity.price)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-lg font-bold text-gray-900">
                                {formatPrice(item.activity?.price || 0)}
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() =>
                              handleRemoveItem(item.id, item.activity?.title)
                            }
                            disabled={removing.has(item.id)}
                            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                          >
                            {removing.has(item.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 sticky top-8">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Items ({selectedItems.size} selected)
                      </span>
                      <span className="font-medium">
                        {formatPrice(getSelectedItemsTotal())}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total items in cart</span>
                      <span className="font-medium">
                        {formatPrice(getCartTotal())}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Selected Total
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(getSelectedItemsTotal())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    disabled={selectedItems.size === 0}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => navigate("/activities")}
                    className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12">
              <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start exploring our amazing activities and add some to your cart
                to get started!
              </p>
              <button
                onClick={() => navigate("/activities")}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Browse Activities</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
