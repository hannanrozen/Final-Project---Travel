import api from "../utils/axios.js";

export const getBanners = async () => {
  try {
    const response = await api.get("/banners");
    return {
      success: true,
      data: response.data,
      message: "Fetched banners successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch banners.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getBannerById = async (id) => {
  try {
    const response = await api.get(`/banners/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Fetched banner successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch banner.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const createBanner = async (bannerData) => {
  try {
    const response = await api.post("/banners", bannerData);
    return {
      success: true,
      data: response.data,
      message: "Banner created successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create banner.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateBanner = async (id, bannerData) => {
  try {
    const response = await api.post(`/banners/${id}`, bannerData);
    return {
      success: true,
      data: response.data,
      message: "Banner updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update banner.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const deleteBanner = async (id) => {
  try {
    const response = await api.delete(`/banners/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Banner deleted successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete banner.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
