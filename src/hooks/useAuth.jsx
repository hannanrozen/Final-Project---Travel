import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../api/auth.js";

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const isAuth = await isAuthenticated();

      if (isAuth) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
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

  const value = {
    user,
    authenticated: !!user,
    loading,
    refresh: checkAuthStatus,
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
