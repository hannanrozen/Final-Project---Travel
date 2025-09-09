import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  ShoppingCart,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, selectedItems, clearCart } = useCart();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const selectedCartItems = items.filter((item) => selectedItems.has(item.id));
  const totalPrice = selectedCartItems.reduce(
    (sum, item) =>
      sum +
      (item.activity.price_discount || item.activity.price) * item.quantity,
    0
  );

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setTransactionSuccess(true);
      clearCart();
      showToast("Transaction successful!", "success");
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please log in to continue
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Cart
        </button>
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            {selectedCartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600">No items selected for checkout.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 mb-4">
                {selectedCartItems.map((item) => (
                  <li
                    key={item.id}
                    className="py-4 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {item.activity.title}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      Rp
                      {(
                        item.activity.price_discount || item.activity.price
                      ).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                Rp{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Method
            </h2>
            <div className="flex gap-4">
              <button
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  paymentMethod === "credit"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 bg-white"
                } flex items-center gap-2 font-medium text-gray-900 hover:border-blue-400 transition-colors`}
                onClick={() => setPaymentMethod("credit")}
              >
                <CreditCard className="w-5 h-5" /> Credit Card
              </button>
              <button
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  paymentMethod === "bank"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 bg-white"
                } flex items-center gap-2 font-medium text-gray-900 hover:border-blue-400 transition-colors`}
                onClick={() => setPaymentMethod("bank")}
              >
                <Shield className="w-5 h-5" /> Bank Transfer
              </button>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={
              isProcessing || !paymentMethod || selectedCartItems.length === 0
            }
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl mb-4"
          >
            {isProcessing ? (
              <LoadingSpinner size="small" />
            ) : (
              "Pay & Complete Transaction"
            )}
          </button>

          {transactionSuccess && (
            <div className="mt-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                Transaction Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase. Your transaction has been saved and
                you will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => navigate("/activities")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Back to Activities
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
