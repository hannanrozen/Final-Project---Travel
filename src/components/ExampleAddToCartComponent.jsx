// Example: Add to Cart Button Handler
// Use this in any component (ActivityCard, ActivityDetailPage, etc.)

import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";

const ExampleAddToCartComponent = ({ activity }) => {
  const { addToCart } = useCart();
  const { authenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = async (activityId) => {
    // Check authentication
    if (!authenticated) {
      showToast("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }

    try {
      // Call the useCart hook's addToCart function
      await addToCart(activityId);
      showToast("Activity added to cart!", "success");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showToast(error.message || "Failed to add to cart", "error");
    }
  };

  return (
    <button
      onClick={() => handleAddToCart(activity.id)}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
    >
      <ShoppingCart className="w-5 h-5" />
      <span>Add to Cart</span>
    </button>
  );
};

export default ExampleAddToCartComponent;
