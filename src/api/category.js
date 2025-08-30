import api from "../utils/axios.js";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return {
      success: true,
      data: response.data,
      message: "Fetched categories successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch categories.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Fetched category successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch category.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories", categoryData);
    return {
      success: true,
      data: response.data,
      message: "Category created successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create category.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.post(`/categories/${id}`, categoryData);
    return {
      success: true,
      data: response.data,
      message: "Category updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update category.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Category deleted successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete category.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
