import { createBrowserRouter } from "react-router-dom";
import HomeIndex from "./pages/landing/HomeIndex";
import PromoIndex from "./pages/landing/PromoIndex";
import LoginIndex from "./pages/auth/LoginIndex";
import RegisterIndex from "./pages/auth/RegisterIndex";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeIndex />,
  },
  {
    path: "/promo",
    element: <PromoIndex />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthRedirect>
        <LoginIndex />
      </AuthRedirect>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthRedirect>
        <RegisterIndex />
      </AuthRedirect>
    ),
  },
  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: (
          <AuthRedirect>
            <LoginIndex />
          </AuthRedirect>
        ),
      },
      {
        path: "register",
        element: (
          <AuthRedirect>
            <RegisterIndex />
          </AuthRedirect>
        ),
      },
    ],
  },
  {
    path: "/admin",
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
      },
    ],
  },
  //
]);
