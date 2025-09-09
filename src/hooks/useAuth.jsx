import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  getCurrentUser,
  logout as logoutUser,
  login as loginUser,
  register as registerUser,
} from "../api/auth.js";

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        // If we have both token and user data, restore the user
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (parseError) {
          console.error("Error parsing saved user data:", parseError);
          // Clear invalid data
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        // No token or user data, check if user is authenticated via API
        const isAuth = await isAuthenticated();
        if (isAuth) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // cek status auth sekali saat mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force logout even if API call fails
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await loginUser(credentials);
      if (result.success && result.data.token) {
        // Make sure token is saved
        localStorage.setItem("token", result.data.token);

        // Update user state
        setUser(result.data.data);

        // Also save user to localStorage for persistence
        localStorage.setItem("user", JSON.stringify(result.data.data));

        return result;
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await registerUser(userData);
      if (result.success) {
        // Don't automatically log in, just return success
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    authenticated: !!user,
    loading,
    login,
    register,
    refresh: checkAuthStatus,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook for protected routes
// eslint-disable-next-line react-refresh/only-export-components
export const useRequireAuth = (redirectTo = "/auth/login") => {
  const { authenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !authenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authenticated, loading, redirectTo, navigate]);

  return { authenticated, loading };
};
