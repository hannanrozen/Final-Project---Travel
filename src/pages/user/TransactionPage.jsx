import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cardImageFallback from "../../assets/images/card_image.jpg";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Upload,
  Check,
  X,
  AlertTriangle,
  Clock,
  FileText,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { getPaymentMethods } from "../../api/payment-method";
import {
  createTransaction,
  updateTransactionProofPayment,
} from "../../api/transaction";
import { getCarts } from "../../api/cart";
import { uploadImage } from "../../api/upload";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
// Removed unused imports - buttonStyles and combineButtonClasses

const TransactionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { authenticated } = useAuth();

  // State from navigation (direct booking) - wrapped in useMemo to fix dependency warning
  const bookingData = useMemo(() => location.state || {}, [location.state]);
  const isDirectBooking = bookingData.directBooking;

  // Page state
  const [currentStep, setCurrentStep] = useState(1); // 1: Choose booking, 2: Enter info, 3: Pay
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data state
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [transaction, setTransaction] = useState(null);

  // Form state - removed unused contactInfo
  const [proofOfPayment, setProofOfPayment] = useState(null);

  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);

        // Fetch payment methods
        console.log("Fetching payment methods...");
        const paymentResult = await getPaymentMethods();
        if (paymentResult.success) {
          const methods = paymentResult.data.data || [];
          console.log("Payment methods loaded:", methods);
          setPaymentMethods(methods);
        } else {
          console.error("Failed to load payment methods:", paymentResult);
          showToast("Failed to load payment methods", "error");
        }

        // For direct booking, give the cart API a moment to process the new item
        if (isDirectBooking) {
          console.log("Direct booking detected, waiting for cart to update...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Fetch cart data with retry for direct booking
        let cartResult;
        let retries = 0;
        const maxRetries = isDirectBooking ? 3 : 1;

        do {
          console.log(`Fetching cart items... (attempt ${retries + 1})`);
          cartResult = await getCarts();

          if (cartResult.success) {
            const carts = cartResult.data.data || [];
            console.log("Cart items loaded:", carts);

            if (carts.length > 0) {
              setCartItems(carts);
              break;
            } else if (isDirectBooking && retries < maxRetries - 1) {
              console.log("Cart empty for direct booking, retrying...");
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          } else {
            console.error("Failed to load cart items:", cartResult);
          }

          retries++;
        } while (retries < maxRetries);

        // Handle empty cart
        if (!cartResult.success || (cartResult.data.data || []).length === 0) {
          if (isDirectBooking && bookingData.activityId) {
            console.log("Using direct booking data as fallback");
            const directBookingItem = {
              id: "direct",
              activity: {
                id: bookingData.activityId,
                title: bookingData.activityTitle,
                price: bookingData.price,
              },
              quantity: bookingData.quantity,
              date: bookingData.date,
              totalPrice: bookingData.totalAmount,
            };
            setCartItems([directBookingItem]);
          } else {
            showToast(
              "Your cart is empty. Please add items to cart first.",
              "warning"
            );
            navigate("/activities");
            return;
          }
        }
      } catch (error) {
        console.error("Error initializing transaction:", error);
        showToast("Error loading transaction data", "error");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [authenticated, navigate, isDirectBooking, bookingData, showToast]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.totalPrice || item.activity?.price * item.quantity || 0),
      0
    );
  };

  const handleCreateTransaction = async () => {
    if (!selectedPaymentMethod) {
      showToast("Please select a payment method", "warning");
      return;
    }

    try {
      setProcessing(true);

      let transactionData;
      let cartIds = [];

      // Get cart IDs based on booking type
      if (isDirectBooking) {
        // For direct booking, refresh cart data to get the latest cart items
        console.log("Direct booking: fetching fresh cart data...");
        const cartResult = await getCarts();
        if (cartResult.success) {
          const carts = cartResult.data.data || [];
          if (carts.length > 0) {
            cartIds = carts.map((cart) => cart.id);
          } else {
            showToast(
              "No items found in cart. Please try adding the item again.",
              "error"
            );
            return;
          }
        } else {
          showToast("Failed to get cart items for transaction", "error");
          return;
        }
      } else {
        // For regular cart-based booking, use existing cart items
        cartIds = cartItems
          .map((item) => item.id)
          .filter((id) => id && id !== "direct"); // Exclude temporary IDs

        if (cartIds.length === 0) {
          showToast("No valid cart items found", "error");
          return;
        }
      }

      transactionData = {
        cartIds: cartIds,
        paymentMethodId: selectedPaymentMethod.id,
      };

      console.log("Creating transaction with data:", transactionData);

      // Validate transaction data
      if (!transactionData.cartIds || transactionData.cartIds.length === 0) {
        showToast("No items to process in transaction", "error");
        return;
      }

      if (!transactionData.paymentMethodId) {
        showToast("Please select a payment method", "error");
        return;
      }

      // Create transaction via API
      const result = await createTransaction(transactionData);

      if (result.success) {
        const transactionResult = result.data.data || result.data;
        setTransaction(transactionResult);
        setCurrentStep(2); // Move to upload proof step
        showToast(
          "Transaction created successfully! Please proceed with payment.",
          "success"
        );
      } else {
        console.error("Transaction creation failed:", result);
        showToast(result.error || "Failed to create transaction", "error");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      showToast("Error creating transaction. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofOfPayment) {
      showToast("Please select proof of payment", "warning");
      return;
    }

    if (!transaction?.id) {
      showToast("Invalid transaction. Please try again.", "error");
      return;
    }

    try {
      setProcessing(true);

      // First, upload the image file
      const uploadResult = await uploadImage(proofOfPayment);

      if (!uploadResult.success) {
        showToast(uploadResult.error || "Failed to upload image", "error");
        return;
      }

      // Then, update transaction with the uploaded image URL
      const imageUrl = uploadResult.data.url || uploadResult.data.data?.url;

      const updateResult = await updateTransactionProofPayment(transaction.id, {
        proofPaymentUrl: imageUrl,
      });

      if (updateResult.success) {
        showToast("Proof of payment uploaded successfully!", "success");

        // Navigate to user transactions page with success message
        navigate("/user/transactions", {
          state: {
            message:
              "Your payment proof has been submitted for verification. We'll notify you once it's confirmed.",
            transactionId: transaction.id,
          },
        });
      } else {
        showToast(
          updateResult.error || "Failed to update transaction with proof",
          "error"
        );
      }
    } catch (error) {
      console.error("Error uploading proof:", error);
      showToast("Error uploading proof of payment", "error");
    } finally {
      setProcessing(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "Review & Payment Method", icon: ShoppingCart },
      { number: 2, title: "Upload Proof", icon: Upload },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className={`flex items-center ${index > 0 ? "ml-4" : ""}`}>
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="ml-3">
                  <div
                    className={`text-sm font-medium ${
                      isActive ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 mx-4 ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderBookingDetails = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h3>
      <div className="space-y-4">
        {cartItems.map((item, index) => (
          <div
            key={item.id || index}
            className="flex gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {item.activity?.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {item.date ? formatDate(item.date) : "Date not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {item.quantity} {item.quantity > 1 ? "people" : "person"}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-lg font-bold text-blue-600">
                {formatCurrency(
                  item.totalPrice || item.activity?.price * item.quantity || 0
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span className="text-blue-600">
            {formatCurrency(getTotalAmount())}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Select Payment Method
      </h3>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No payment methods available</div>
          <button
            onClick={async () => {
              setLoading(true);
              const result = await getPaymentMethods();
              if (result.success) {
                setPaymentMethods(result.data.data || []);
              }
              setLoading(false);
            }}
            className="text-blue-500 hover:text-blue-600"
          >
            Retry loading payment methods
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                setSelectedPaymentMethod(method);
                console.log("Selected payment method:", method);
              }}
              className={`
                p-4 border-2 rounded-lg transition-all hover:shadow-md
                ${
                  selectedPaymentMethod?.id === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <img
                  src={method.imageUrl}
                  alt={method.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.src = cardImageFallback;
                  }}
                />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-600">Bank Transfer</div>
                </div>
                {selectedPaymentMethod?.id === method.id && (
                  <Check className="w-5 h-5 text-blue-500 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!selectedPaymentMethod && paymentMethods.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-700">
            Please select a payment method to continue
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Payment Instructions
        </h3>

        {selectedPaymentMethod && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={selectedPaymentMethod.imageUrl}
                alt={selectedPaymentMethod.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.src = cardImageFallback;
                }}
              />
              <div>
                <div className="font-medium">{selectedPaymentMethod.name}</div>
                <div className="text-sm text-gray-600">Transfer to:</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600">Account Number</div>
              <div className="font-mono text-lg font-bold">
                1234567890123456
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Account Name: PT Travel Explorer
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">
                Payment Instructions:
              </div>
              <ul className="mt-2 text-yellow-700 space-y-1">
                <li>
                  • Transfer exact amount: {formatCurrency(getTotalAmount())}
                </li>
                <li>
                  • Use transaction ID: {transaction?.id || "TXN-XXXXX"} as
                  reference
                </li>
                <li>• Upload proof of payment below</li>
                <li>• Payment verification may take 1-24 hours</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Proof of Payment *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProofOfPayment(e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="text-sm text-gray-500 mt-1">
            Upload screenshot or photo of your transfer receipt (JPG, PNG, max
            5MB)
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Booking
          </h1>
          <p className="text-gray-600">
            Secure your travel experience in just a few steps
          </p>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Is Direct Booking:</strong>{" "}
              {isDirectBooking ? "Yes" : "No"}
            </p>
            <p>
              <strong>Cart Items:</strong> {cartItems.length} items
            </p>
            <p>
              <strong>Cart Item IDs:</strong>{" "}
              {cartItems.map((item) => item.id).join(", ") || "None"}
            </p>
            <p>
              <strong>Payment Methods Available:</strong>{" "}
              {paymentMethods.length}
            </p>
            <p>
              <strong>Selected Payment Method:</strong>{" "}
              {selectedPaymentMethod?.name || "None"}
            </p>
            <p>
              <strong>Loading State:</strong> {loading ? "Loading..." : "Ready"}
            </p>
            <p>
              <strong>Processing State:</strong>{" "}
              {processing ? "Processing..." : "Ready"}
            </p>
            <p>
              <strong>User Token:</strong>{" "}
              {localStorage.getItem("token") ? "Present" : "Missing"}
            </p>
            <p>
              <strong>Booking Data:</strong> {JSON.stringify(bookingData)}
            </p>
            <p>
              <strong>Total Amount:</strong> {formatCurrency(getTotalAmount())}
            </p>
            {cartItems.length > 0 && (
              <div className="mt-2">
                <strong>Cart Items Details:</strong>
                <ul className="ml-4 list-disc">
                  {cartItems.map((item, index) => (
                    <li key={index}>
                      ID: {item.id}, Activity:{" "}
                      {item.activity?.title || "Unknown"}, Quantity:{" "}
                      {item.quantity}, Price:{" "}
                      {formatCurrency(item.totalPrice || 0)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Review booking and select payment method */}
          {currentStep === 1 && (
            <>
              {renderBookingDetails()}
              {renderPaymentMethods()}

              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleCreateTransaction}
                  disabled={
                    processing ||
                    !selectedPaymentMethod ||
                    cartItems.length === 0
                  }
                  className={`
                    px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2
                    ${
                      processing ||
                      !selectedPaymentMethod ||
                      cartItems.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                    }
                  `}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Transaction...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Upload proof of payment */}
          {currentStep === 2 && (
            <>
              {renderPaymentStep()}

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={handleUploadProof}
                  disabled={processing || !proofOfPayment}
                  className={`
                    px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2
                    ${
                      processing || !proofOfPayment
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                    }
                  `}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Complete Booking
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TransactionPage;
