import api from "../utils/axios.js";

export const getLoggedUser = async () => {
  try {
    const response = await api.get("/user");
    return {
      success: true,
      data: response.data,
      message: "Fetched logged user successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch logged user.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get("/all-user");
    return {
      success: true,
      data: response.data,
      message: "Fetched all users successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch all users.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.post("/update-profile", profileData);
    return {
      success: true,
      data: response.data,
      message: "Profile updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update profile.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateUserRole = async (roleData) => {
  try {
    const response = await api.post("/update-user-role", roleData);
    return {
      success: true,
      data: response.data,
      message: "User role updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update user role.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
