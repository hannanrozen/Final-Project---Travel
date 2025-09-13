import { createContext, useContext, useReducer, useCallback } from "react";
import { addToCart, updateCart, deleteCart, getCarts } from "../api/cart";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART_ITEMS":
      return { ...state, items: action.payload, error: null };
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload], error: null };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
        error: null,
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        error: null,
      };
    case "CLEAR_CART":
      return { ...state, items: [], selectedItems: new Set(), error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "TOGGLE_SELECT_ITEM": {
      const newSelectedItems = new Set(state.selectedItems);
      if (newSelectedItems.has(action.payload)) {
        newSelectedItems.delete(action.payload);
      } else {
        newSelectedItems.add(action.payload);
      }
      return { ...state, selectedItems: newSelectedItems };
    }
    case "SELECT_ALL_ITEMS":
      return {
        ...state,
        selectedItems: new Set(state.items.map((item) => item.id)),
      };
    case "CLEAR_SELECTION":
      return { ...state, selectedItems: new Set() };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    selectedItems: new Set(),
    loading: false,
    error: null,
  });

  const fetchCartItems = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      const response = await getCarts();

      if (response.success) {
        // Handle the correct data structure from API
        const cartItems = response.data?.data || response.data || [];
        dispatch({ type: "SET_CART_ITEMS", payload: cartItems });
      } else {
        // If 404 (no carts), treat as empty cart instead of error
        if (response.status === 404) {
          dispatch({ type: "SET_CART_ITEMS", payload: [] });
        } else {
          console.error("Failed to fetch cart items:", response.error);
          dispatch({
            type: "SET_ERROR",
            payload: response.error || "Failed to fetch cart items",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      // If 404 (no carts), treat as empty cart instead of error
      if (error.response?.status === 404) {
        dispatch({ type: "SET_CART_ITEMS", payload: [] });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to fetch cart items",
        });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const addToCartItem = async (activityId) => {
    try {
      const response = await addToCart({ activityId });
      if (response.success) {
        // Refresh cart items to get updated data
        await fetchCartItems();
        return response;
      } else {
        throw new Error(response.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateCartItem = async (cartId, cartData) => {
    try {
      const response = await updateCart(cartId, cartData);
      if (response.success) {
        // Refresh cart items to get updated data
        await fetchCartItems();
        return response;
      } else {
        throw new Error(response.error || "Failed to update cart");
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const response = await deleteCart(cartId);
      if (response.success) {
        dispatch({ type: "REMOVE_ITEM", payload: cartId });
        // Also refresh to get updated data
        await fetchCartItems();
        return response;
      } else {
        throw new Error(response.error || "Failed to remove from cart");
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleSelectItem = (itemId) => {
    dispatch({ type: "TOGGLE_SELECT_ITEM", payload: itemId });
  };

  const selectAllItems = () => {
    dispatch({ type: "SELECT_ALL_ITEMS" });
  };

  const clearSelection = () => {
    dispatch({ type: "CLEAR_SELECTION" });
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

  // Removed automatic fetch on mount - let components control when to fetch

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart: addToCartItem,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCartItems,
        getCartTotal,
        getCartItemCount,
        toggleSelectItem,
        selectAllItems,
        clearSelection,
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
