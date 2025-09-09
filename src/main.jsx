import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { TravelDataProvider } from "./hooks/useTravelDataNew.jsx";
import { CartProvider } from "./hooks/useCart.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <TravelDataProvider>
        <CartProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CartProvider>
      </TravelDataProvider>
    </AuthProvider>
  </StrictMode>
);
