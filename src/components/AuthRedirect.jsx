import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRedirect } from "../hooks/useRedirect";

const AuthRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { redirectToHome } = useRedirect();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      redirectToHome();
    }
  }, [isAuthenticated, loading, redirectToHome]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthRedirect;
