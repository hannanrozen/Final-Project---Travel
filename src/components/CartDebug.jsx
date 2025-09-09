import React, { useState, useEffect } from "react";
import { getCarts, addToCart } from "../api/cart";
import { useAuth } from "../hooks/useAuth";

const CartDebug = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, authenticated } = useAuth();

  const testGetCarts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Testing getCarts API...");
      const result = await getCarts();
      console.log("Cart API Response:", result);
      setCartData(result);
    } catch (err) {
      console.error("Cart API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Testing addToCart API...");
      // Using a test activity ID - you might need to use a real one
      const result = await addToCart({
        activityId: "bf80d67e-1866-4366-9f20-6fe81181c5b1",
      });
      console.log("Add to Cart Response:", result);
      setCartData(result);
    } catch (err) {
      console.error("Add to Cart Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      testGetCarts();
    }
  }, [authenticated]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cart API Debug</h1>

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Authentication Status:</h2>
        <p>Authenticated: {authenticated ? "Yes" : "No"}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : "Not logged in"}</p>
      </div>

      <div className="space-x-4 mb-4">
        <button
          onClick={testGetCarts}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Get Carts
        </button>
        <button
          onClick={testAddToCart}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Add to Cart
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          <h3 className="font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {cartData && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-semibold">API Response:</h3>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(cartData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CartDebug;
