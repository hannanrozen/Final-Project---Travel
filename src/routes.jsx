import { createBrowserRouter } from "react-router-dom";
import HomeIndex from "./pages/landing/HomeIndex";
import PromoIndex from "./pages/landing/PromoPage";
import ActivitiesPage from "./pages/landing/ActivitiesPage";
import ActivityDetailWithCalendar from "./pages/landing/ActivityDetailPage";
import LoginIndex from "./pages/auth/LoginIndex";
import RegisterIndex from "./pages/auth/RegisterIndex";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import SimpleCartPage from "./pages/user/SimpleCartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import TransactionPage from "./pages/user/TransactionPage";
import TransactionHistory from "./pages/user/MyTransactionsPage";
import ProfilePage from "./pages/user/ProfilePage";
import BookNowPage from "./pages/user/BookNowPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminActivitiesPage from "./pages/admin/AdminActivitiesPage";
import AdminBannersPage from "./pages/admin/AdminBannersPage";
import AdminPromosPage from "./pages/admin/AdminPromosPage";
import AdminPaymentMethodsPage from "./pages/admin/AdminPaymentMethodsPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";
// import AdminUsersPage from "./pages/admin/AdminUsersPage";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <HomeIndex />,
  },
  {
    path: "/promos",
    element: <PromoIndex />,
  },
  {
    path: "/activities",
    element: <ActivitiesPage />,
  },
  {
    path: "/activity/:id",
    element: <ActivityDetailWithCalendar />,
  },

  // Auth routes (redirect if already authenticated)
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

  // User protected routes
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/book-now/:id",
    element: (
      <ProtectedRoute>
        <BookNowPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute>
        <SimpleCartPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transaction",
    element: (
      <ProtectedRoute>
        <TransactionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-transactions",
    element: (
      <ProtectedRoute>
        <TransactionHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },

  // Admin protected routes (require admin role)
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/categories",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminCategoriesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/activities",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminActivitiesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/banners",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminBannersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/promos",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminPromosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/payment-methods",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminPaymentMethodsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/transactions",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminTransactionsPage />
      </ProtectedRoute>
    ),
  },
  // {
  //   path: "/admin/users",
  //   element: (
  //     <ProtectedRoute requireAdmin={true}>
  //       <AdminUsersPage />
  //     </ProtectedRoute>
  //   ),
  // },
]);
