import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useRedirect = () => {
  const navigate = useNavigate();
  const { authenticated, user } = useAuth();

  const redirectToLogin = () => {
    navigate("/login", { replace: true });
  };

  const redirectToDashboard = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true }); // Changed to home page for regular users
    }
  };

  const redirectToHome = () => {
    navigate("/", { replace: true });
  };

  const requireAuth = (callback) => {
    if (!authenticated) {
      redirectToLogin();
      return false;
    }
    if (callback) callback();
    return true;
  };

  const requireAdmin = (callback) => {
    if (!authenticated || user?.role !== "admin") {
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
