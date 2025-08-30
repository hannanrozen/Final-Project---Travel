import api from "../utils/axios.js";

export const getPaymentMethods = async () => {
  try {
    const response = await api.get("/payment-methods");
    return {
      success: true,
      data: response.data,
      message: "Fetched payment methods successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch payment methods.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const generatePaymentMethods = async (data) => {
  try {
    const response = await api.post("/generate-payment-methods", data);
    return {
      success: true,
      data: response.data,
      message: "Payment methods generated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to generate payment methods.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
