import api from "../utils/axios.js";

export const getPromos = async () => {
  try {
    const response = await api.get("/promos");
    return {
      success: true,
      data: response.data,
      message: "Fetched promos successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch promos.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getPromoById = async (id) => {
  try {
    const response = await api.get(`/promos/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Fetched promo successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch promo.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const createPromo = async (promoData) => {
  try {
    const response = await api.post("/promos", promoData);
    return {
      success: true,
      data: response.data,
      message: "Promo created successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create promo.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updatePromo = async (id, promoData) => {
  try {
    const response = await api.post(`/promos/${id}`, promoData);
    return {
      success: true,
      data: response.data,
      message: "Promo updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update promo.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const deletePromo = async (id) => {
  try {
    const response = await api.delete(`/promos/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Promo deleted successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete promo.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
