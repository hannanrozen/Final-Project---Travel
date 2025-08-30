import { createContext, useContext, useReducer, useEffect } from "react";
import { cartAPI } from "../api/cart";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART_ITEMS":
      return { ...state, items: action.payload };
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
  });

  const fetchCartItems = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await cartAPI.getCarts();
      dispatch({ type: "SET_CART_ITEMS", payload: response.data || [] });
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addToCart = async (activityId) => {
    try {
      const response = await cartAPI.addToCart(activityId);
      dispatch({ type: "ADD_ITEM", payload: response.data });
      return response;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateCartItem = async (cartId, quantity) => {
    try {
      const response = await cartAPI.updateCart(cartId, quantity);
      dispatch({ type: "UPDATE_ITEM", payload: response.data });
      return response;
    } catch (error) {
      console.error("Failed to update cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      await cartAPI.deleteCart(cartId);
      dispatch({ type: "REMOVE_ITEM", payload: cartId });
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return (
        total +
        (item.activity?.price_discount || item.activity?.price || 0) *
          item.quantity
      );
    }, 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCartItems,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
