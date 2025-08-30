import api from "../utils/axios.js";

export const addToCart = async (cartData) => {
  try {
    const response = await api.post("/add-to-cart", cartData);
    return {
      success: true,
      data: response.data,
      message: "Added to cart successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to add to cart.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateCart = async (cartData) => {
  try {
    const response = await api.post("/update-cart", cartData);
    return {
      success: true,
      data: response.data,
      message: "Cart updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update cart.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const deleteCart = async (cartData) => {
  try {
    const response = await api.delete("/delete-cart", { data: cartData });
    return {
      success: true,
      data: response.data,
      message: "Cart deleted successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete cart.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getCarts = async () => {
  try {
    const response = await api.get("/carts");
    return {
      success: true,
      data: response.data,
      message: "Fetched carts successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch carts.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
