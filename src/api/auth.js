import api from "../utils/axios.js";

export const login = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    if (response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }

    return {
      success: true,
      data: response.data,
      message: "Login successful",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Login failed. Please try again.";

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } catch (error) {
    console.warn("Logout API call failed:", error.message);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/register", userData);

    // Don't automatically save user data after registration
    // Let them login manually for better security

    return {
      success: true,
      data: response.data,
      message: "Registration successful",
    };
  } catch (e) {
    console.error("Registration error:", e);
    const errorMessage =
      e.response?.data?.message ||
      e.response?.data?.error ||
      "Registration failed. Please try again.";

    return {
      success: false,
      error: errorMessage,
      status: e.response?.status,
    };
  }
};

export const isAuthenticated = async () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getCurrentUser = () => {
  const userString = localStorage.getItem("user");

  try {
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};
