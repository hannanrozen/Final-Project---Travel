import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const redirectToLogin = () => {
    navigate("/login", { replace: true });
  };

  const redirectToDashboard = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const redirectToHome = () => {
    navigate("/", { replace: true });
  };

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      redirectToLogin();
      return false;
    }
    if (callback) callback();
    return true;
  };

  const requireAdmin = (callback) => {
    if (!isAuthenticated || user?.role !== "admin") {
      redirectToHome();
      return false;
    }
    if (callback) callback();
    return true;
  };

  return {
    redirectToLogin,
    redirectToDashboard,
    redirectToHome,
    requireAuth,
    requireAdmin,
    navigate,
  };
};
