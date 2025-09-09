import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { ShoppingCart, Plus, ArrowLeft } from "lucide-react";

export default function SimpleCartPage() {
  const navigate = useNavigate();
  const { user, authenticated } = useAuth();
  const { items, loading, error, fetchCartItems } = useCart();

  useEffect(() => {
    if (authenticated) {
      fetchCartItems();
    }
  }, [authenticated, fetchCartItems]);

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
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Debug Information:
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Authenticated: {authenticated ? "Yes" : "No"}</p>
            <p>User: {user?.email || "Not logged in"}</p>
            <p>Cart Items Count: {items?.length || 0}</p>
            <p>Loading: {loading ? "Yes" : "No"}</p>
            <p>Error: {error || "None"}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Error Loading Cart
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => fetchCartItems()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Cart Content */}
        {!error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {items && items.length > 0 ? (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Cart Items ({items.length})
                </h2>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">
                          {item.activity?.title ||
                            item.title ||
                            `Item ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity || 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: {item.activity?.price || item.price || "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          $
                          {(
                            (item.activity?.price || item.price || 0) *
                            (item.quantity || 1)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-blue-600">
                      $
                      {items
                        .reduce(
                          (total, item) =>
                            total +
                            (item.activity?.price || item.price || 0) *
                              (item.quantity || 1),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-6">
                  Start shopping to add items to your cart
                </p>
                <button
                  onClick={() => navigate("/activities")}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
