import api from "../utils/axios.js";

export const getActivities = async () => {
  try {
    const response = await api.get("/activities");
    return {
      success: true,
      data: response.data,
      message: "Fetched activities successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch activities.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getActivityById = async (id) => {
  try {
    const response = await api.get(`/activities/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Fetched activity successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch activity.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getActivitiesByCategoryId = async (categoryId) => {
  try {
    const response = await api.get(`/activities/category/${categoryId}`);
    return {
      success: true,
      data: response.data,
      message: "Fetched activities by category successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch activities by category.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const createActivity = async (activityData) => {
  try {
    const response = await api.post("/activities", activityData);
    return {
      success: true,
      data: response.data,
      message: "Activity created successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create activity.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateActivity = async (id, activityData) => {
  try {
    const response = await api.post(`/activities/${id}`, activityData);
    return {
      success: true,
      data: response.data,
      message: "Activity updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update activity.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const deleteActivity = async (id) => {
  try {
    const response = await api.delete(`/activities/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Activity deleted successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete activity.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
