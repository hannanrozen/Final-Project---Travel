import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Star,
  Check,
  Upload,
  CreditCard,
  CheckCircle,
  Info,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Tag,
  Copy,
  FileText,
} from "lucide-react";
import { getActivityById } from "../../api/activity";
import { getPaymentMethods } from "../../api/payment-method";
import { getLoggedUser } from "../../api/user";
import { getPromos } from "../../api/promo";
import { createTransaction } from "../../api/transaction";
import { addToCart } from "../../api/cart";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const BookNowPage = () => {
  const { id: activityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated } = useAuth();
  const { showToast } = useToast();

  // Check if user came from activity detail page with booking data
  const bookingData = location.state || {};

  // Page state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data state
  const [activity, setActivity] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [promos, setPromos] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // Form state
  const [bookingDetails, setBookingDetails] = useState({
    quantity: bookingData.quantity || 1,
    date: bookingData.date || "",
    totalPrice: bookingData.totalPrice || 0,
  });
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [proofOfPayment, setProofOfPayment] = useState(null);

  // Load initial data with proper async handling
  useEffect(() => {
    const loadInitialData = async () => {
      if (!authenticated) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const [
          activityResponse,
          paymentMethodsResponse,
          userResponse,
          promosResponse,
        ] = await Promise.all([
          getActivityById(activityId),
          getPaymentMethods(),
          getLoggedUser(),
          getPromos(),
        ]);

        if (activityResponse.success) {
          setActivity(activityResponse.data.data);
          if (!bookingData.totalPrice) {
            setBookingDetails((prev) => ({
              ...prev,
              totalPrice: activityResponse.data.data.price * prev.quantity,
            }));
          }
        } else {
          alert("Failed to load activity details");
          navigate("/activities");
          return;
        }

        if (paymentMethodsResponse.success) {
          setPaymentMethods(paymentMethodsResponse.data.data || []);
        }

        if (promosResponse.success) {
          setPromos(promosResponse.data.data || []);
        }

        if (userResponse.success && userResponse.data.data) {
          const userData = userResponse.data.data;
          setContactInfo({
            firstName: userData.name?.split(" ")[0] || "",
            lastName: userData.name?.split(" ").slice(1).join(" ") || "",
            email: userData.email || "",
            phone: userData.phoneNumber || "",
          });
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        alert("Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [authenticated, activityId, navigate, bookingData.totalPrice]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateSubtotal = () => {
    return activity ? activity.price * bookingDetails.quantity : 0;
  };

  const calculateDiscount = () => {
    if (!selectedPromo) return 0;
    const subtotal = calculateSubtotal();

    const discountPercentage = Math.min(
      selectedPromo.promo_discount_price,
      100
    );
    return (subtotal * discountPercentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    // Ensure total is never negative
    return Math.max(0, subtotal - discount);
  };

  const validateContactInfo = () => {
    const { firstName, lastName, email, phone } = contactInfo;
    if (!firstName || !lastName || !email || !phone) {
      alert("Please fill in all contact information");
      return false;
    }
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return false;
    }
    if (!bookingDetails.date) {
      alert("Please select a booking date");
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateContactInfo()) return;
    setCurrentStep(2);
  };

  const handleBookNow = async () => {
    // Enhanced validation checks
    if (!selectedPaymentMethod) {
      showToast("Please select a payment method", "error");
      return;
    }

    if (!proofOfPayment) {
      showToast("Please upload proof of payment", "error");
      return;
    }

    // File size validation (5MB limit)
    if (proofOfPayment.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }

    // File type validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(proofOfPayment.type)) {
      showToast("Please upload a valid image (JPG, PNG) or PDF file", "error");
      return;
    }

    setProcessing(true);
    try {
      console.log("Starting booking process...");

      // First, add activity to cart to get cart ID
      const cartResponse = await addToCart({
        activityId,
        quantity: bookingDetails.quantity,
      });

      if (!cartResponse.success) {
        throw new Error(cartResponse.error || "Failed to add item to cart");
      }

      const cartId = cartResponse.data?.data?.id;

      // Validate cart ID exists
      if (!cartId) {
        console.error("Cart response:", cartResponse);
        throw new Error("Failed to obtain cart ID. Please try again.");
      }

      console.log("Cart ID obtained:", cartId);

      // Prepare cartIds array - ensure it's never null or empty
      const cartIds = [cartId];
      if (!cartIds || cartIds.length === 0 || !cartIds[0]) {
        throw new Error("Cart ID validation failed");
      }

      // Create transaction using FormData (includes file upload)
      const formData = new FormData();
      formData.append("paymentMethodId", selectedPaymentMethod.id);
      formData.append("cartIds", JSON.stringify(cartIds));
      formData.append("proofOfPayment", proofOfPayment);

      // Add promo if selected
      if (selectedPromo?.id) {
        formData.append("promoId", selectedPromo.id);
      }

      console.log("FormData being sent with:");
      console.log("- paymentMethodId:", selectedPaymentMethod.id);
      console.log("- cartIds:", JSON.stringify(cartIds));
      console.log("- proofOfPayment:", proofOfPayment.name);

      // Create transaction with FormData (includes proof of payment)
      const response = await createTransaction(formData);

      if (!response.success) {
        console.error("Transaction creation failed:", response);
        throw new Error(
          response.error || "Failed to create transaction. Please try again."
        );
      }

      const transactionData = response.data?.data;
      const transactionId = transactionData?.id;

      if (!transactionId) {
        throw new Error("Transaction created but ID not received");
      }

      console.log("Transaction created successfully:", transactionId);
      showToast("Booking completed successfully!", "success");

      // Prepare navigation state with all relevant data
      const navigationState = {
        transaction: transactionData,
        activity: activity,
        paymentMethod: selectedPaymentMethod,
        bookingDetails: bookingDetails,
        contactInfo: contactInfo,
        selectedPromo: selectedPromo,
      };

      // Navigate to confirmation page
      navigate(`/transaction/confirmation/${transactionId}`, {
        state: navigationState,
      });
    } catch (err) {
      console.error("Booking error:", err);
      const errorMessage =
        err.message || "An unexpected error occurred. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setProcessing(false);
    }
  };

  // Component: Step Indicator
  const StepIndicator = () => {
    const steps = [
      { number: 1, title: "Enter Info", icon: Info },
      { number: 2, title: "Payment & Booking", icon: CreditCard },
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                    step.number === currentStep
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-500 text-white shadow-lg"
                      : step.number < currentStep
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`text-sm mt-2 font-medium ${
                    currentStep === step.number
                      ? "text-blue-600"
                      : step.number < currentStep
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    step.number < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Component: Contact Info Form
  const ContactInfoForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Contact Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            First Name
          </label>
          <input
            type="text"
            value={contactInfo.firstName}
            onChange={(e) =>
              setContactInfo((prev) => ({ ...prev, firstName: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Last Name
          </label>
          <input
            type="text"
            value={contactInfo.lastName}
            onChange={(e) =>
              setContactInfo((prev) => ({ ...prev, lastName: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) =>
              setContactInfo((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) =>
              setContactInfo((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Booking Date
          </label>
          <input
            type="date"
            value={bookingDetails.date}
            onChange={(e) =>
              setBookingDetails((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-1" />
            Number of Participants
          </label>
          <input
            type="number"
            min="1"
            value={bookingDetails.quantity}
            onChange={(e) =>
              setBookingDetails((prev) => ({
                ...prev,
                quantity: parseInt(e.target.value) || 1,
                totalPrice: activity
                  ? activity.price * (parseInt(e.target.value) || 1)
                  : 0,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  // Component: Promo Selector
  const PromoSelector = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        <Tag className="inline w-5 h-5 mr-2" />
        Apply Promo Code (Optional)
      </h3>
      <div className="space-y-3">
        <div
          className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
            !selectedPromo
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setSelectedPromo(null)}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={!selectedPromo}
              onChange={() => setSelectedPromo(null)}
              className="mr-3 h-4 w-4 text-blue-600"
            />
            <span className="font-medium text-gray-900">No Promo</span>
          </div>
        </div>
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              selectedPromo?.id === promo.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedPromo(promo)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedPromo?.id === promo.id}
                  onChange={() => setSelectedPromo(promo)}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{promo.title}</h4>
                  <p className="text-sm text-gray-600">{promo.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">
                  {promo.promo_discount_price}% OFF
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleProceedToPayment}
          disabled={processing}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );

  // Helper function to copy payment method ID to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Payment Method ID copied to clipboard!", "success");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        showToast("Payment Method ID copied to clipboard!", "success");
      } catch {
        showToast("Failed to copy to clipboard", "error");
      }
      document.body.removeChild(textArea);
    }
  };

  // Component: Payment and Proof of Payment (Combined)
  const PaymentAndProofSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Payment Method Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          <CreditCard className="inline w-6 h-6 mr-2" />
          Select Payment Method
        </h2>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                selectedPaymentMethod?.id === method.id
                  ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedPaymentMethod(method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedPaymentMethod?.id === method.id}
                    onChange={() => setSelectedPaymentMethod(method)}
                    className="mr-4 h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="mr-4">
                    <img
                      src={method.imageUrl}
                      alt={method.name}
                      className="w-20 h-12 object-contain rounded-lg border border-gray-100"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {method.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {method.virtual_account_name || "Virtual Account"}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                        ID: {method.id}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(method.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="Copy Payment Method ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {selectedPaymentMethod?.id === method.id && (
                  <div className="text-blue-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {paymentMethods.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No payment methods available</p>
            <p className="text-sm">Please contact support for assistance</p>
          </div>
        )}
      </div>

      {/* Upload Proof of Payment */}
      <div className=" pt-8 ">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          <Upload className="inline w-5 h-5 mr-2" />
          Upload Proof of Payment
        </h3>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            proofOfPayment
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              const file = files[0];
              const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "application/pdf",
              ];
              if (allowedTypes.includes(file.type)) {
                setProofOfPayment(file);
              } else {
                showToast(
                  "Please upload a valid image (JPG, PNG) or PDF file",
                  "error"
                );
              }
            }
          }}
        >
          <Upload
            className={`w-16 h-16 mx-auto mb-4 ${
              proofOfPayment ? "text-green-500" : "text-gray-400"
            }`}
          />
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setProofOfPayment(e.target.files[0])}
            className="hidden"
            id="proof-upload"
          />
          <label
            htmlFor="proof-upload"
            className="cursor-pointer inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {proofOfPayment ? "Change File" : "Select File"}
          </label>
          <p className="text-gray-500 mt-3 text-sm">
            Drag & drop your payment receipt here or click to browse
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Supported formats: JPG, PNG, PDF (Max 5MB)
          </p>
          {proofOfPayment && (
            <div className="mt-6 p-4 bg-green-100 rounded-xl border border-green-200">
              <div className="flex items-center justify-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-green-700 font-semibold">
                    ✓ {proofOfPayment.name}
                  </p>
                  <p className="text-sm text-green-600">
                    Size: {(proofOfPayment.size / 1024 / 1024).toFixed(2)} MB •
                    Type: {proofOfPayment.type}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Status */}
      {(!selectedPaymentMethod || !proofOfPayment) && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900 mb-2">
                Complete these steps to proceed:
              </h4>
              <ul className="space-y-2 text-sm text-amber-800">
                {!selectedPaymentMethod && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                    Select a payment method above
                  </li>
                )}
                {!proofOfPayment && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                    Upload proof of payment document
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
        >
          <span>← Back</span>
        </button>
        <button
          onClick={handleBookNow}
          disabled={processing || !proofOfPayment || !selectedPaymentMethod}
          className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px] transform hover:-translate-y-1 disabled:transform-none"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Creating Transaction...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-3" />
              Book Now
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Component: Booking Summary
  const BookingSummary = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>

      {activity && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              {activity.title}
            </h4>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <MapPin className="w-4 h-4 mr-1" />
              {activity.city}
            </div>
            <div className="flex items-center text-sm text-yellow-600">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {activity.rating} ({activity.total_reviews} reviews)
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {bookingDetails.date
                  ? formatDate(bookingDetails.date)
                  : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Participants:</span>
              <span className="font-medium">{bookingDetails.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price per ticket:</span>
              <span className="font-medium">
                {formatCurrency(activity.price)}
              </span>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(calculateSubtotal())}
              </span>
            </div>

            {selectedPromo && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({selectedPromo.promo_discount_price}%):</span>
                <span>-{formatCurrency(calculateDiscount())}</span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold text-blue-600">
                <span>Total Amount:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <ContactInfoForm />
            <PromoSelector />
          </div>
        );
      case 2:
        return <PaymentAndProofSection />;
      default:
        return <ContactInfoForm />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Loading booking information...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Your Booking
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure your adventure with our easy 2-step booking process. Your
            dream experience is just a few clicks away!
          </p>
        </div>

        <StepIndicator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">{renderCurrentStep()}</div>
          <div className="lg:col-span-1">
            <BookingSummary />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookNowPage;
