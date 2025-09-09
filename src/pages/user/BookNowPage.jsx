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
} from "lucide-react";
import { getActivityById } from "../../api/activity";
import { getPaymentMethods } from "../../api/payment-method";
import { getLoggedUser } from "../../api/user";
import { getPromos } from "../../api/promo";
import {
  createTransaction,
  updateTransactionProofPayment,
} from "../../api/transaction";
import { addToCart } from "../../api/cart";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const BookNowPage = () => {
  const { id: activityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated } = useAuth();

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
  const [transaction, setTransaction] = useState(null);

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
    // Cap discount percentage at 100%
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

  const handleSelectPaymentMethod = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setProcessing(true);
    try {
      // First add activity to cart if not already added
      const cartResponse = await addToCart({
        activityId: activityId,
        quantity: bookingDetails.quantity,
      });

      if (!cartResponse.success) {
        alert(cartResponse.error || "Failed to add activity to cart");
        return;
      }

      // Get the cart ID from the response
      const cartId = cartResponse.data?.data?.id;

      if (!cartId) {
        alert("Failed to get cart ID");
        return;
      }

      // Create transaction with cart ID
      const transactionData = {
        cartIds: [cartId],
        paymentMethodId: selectedPaymentMethod.id,
      };

      if (selectedPromo) {
        transactionData.promoId = selectedPromo.id;
      }

      const response = await createTransaction(transactionData);
      if (response.success) {
        setTransaction(response.data.data);
        setCurrentStep(3);
        alert(
          "Transaction created successfully! Please upload proof of payment."
        );
      } else {
        alert(response.error || "Failed to create transaction");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction");
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofOfPayment) {
      alert("Please select a proof of payment file");
      return;
    }

    if (!transaction?.id) {
      alert("Transaction not found. Please try again.");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("proofPaymentUrl", proofOfPayment);

      const response = await updateTransactionProofPayment(
        transaction.id,
        formData
      );
      if (response.success) {
        setCurrentStep(4);
        alert("Proof of payment uploaded successfully");
      } else {
        alert(response.error || "Failed to upload proof of payment");
      }
    } catch (error) {
      console.error("Error uploading proof:", error);
      alert("Failed to upload proof of payment");
    } finally {
      setProcessing(false);
    }
  };

  // Component: Step Indicator
  const StepIndicator = () => {
    const steps = [
      { number: 1, title: "Enter Info", icon: Info },
      { number: 2, title: "Payment", icon: CreditCard },
      { number: 3, title: "Upload Proof", icon: Upload },
      { number: 4, title: "Confirmation", icon: CheckCircle },
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

  // Component: Payment Methods
  const PaymentMethods = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Select Payment Method
      </h2>
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              selectedPaymentMethod?.id === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedPaymentMethod(method)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={selectedPaymentMethod?.id === method.id}
                onChange={() => setSelectedPaymentMethod(method)}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <img
                src={method.imageUrl}
                alt={method.name}
                className="w-12 h-8 object-contain mr-4"
              />
              <div>
                <h3 className="font-medium text-gray-900">{method.name}</h3>
                <p className="text-sm text-gray-600">
                  {method.virtual_account_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleSelectPaymentMethod}
          disabled={processing || !selectedPaymentMethod}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Creating Transaction..." : "Create Transaction"}
        </button>
      </div>
    </div>
  );

  // Component: Upload Proof
  const UploadProof = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Proof of Payment
      </h2>
      {transaction && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Transaction Details
          </h3>
          <p className="text-blue-800">Transaction ID: {transaction.id}</p>
          <p className="text-blue-800">
            Total Amount: {formatCurrency(calculateTotal())}
          </p>
          <p className="text-blue-800">
            Payment Method: {selectedPaymentMethod?.name}
          </p>
        </div>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setProofOfPayment(e.target.files[0])}
          className="hidden"
          id="proof-upload"
        />
        <label
          htmlFor="proof-upload"
          className="cursor-pointer inline-block px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
        >
          Select File
        </label>
        <p className="text-gray-500 mt-2">
          Upload your payment receipt (JPG, PNG, or PDF)
        </p>
        {proofOfPayment && (
          <p className="text-green-600 mt-2">
            File selected: {proofOfPayment.name}
          </p>
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleUploadProof}
          disabled={processing || !proofOfPayment}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Uploading..." : "Upload Proof"}
        </button>
      </div>
    </div>
  );

  // Component: Confirmation Step
  const ConfirmationStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Booking Confirmed!
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your booking. Your transaction is being processed and you
        will receive a confirmation email shortly.
      </p>
      <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Activity:</span> {activity?.title}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {formatDate(bookingDetails.date)}
          </p>
          <p>
            <span className="font-medium">Participants:</span>{" "}
            {bookingDetails.quantity}
          </p>
          <p>
            <span className="font-medium">Total Amount:</span>{" "}
            {formatCurrency(calculateTotal())}
          </p>
          <p>
            <span className="font-medium">Transaction ID:</span>{" "}
            {transaction?.id}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate("/my-transactions")}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg"
        >
          View My Transactions
        </button>
        <button
          onClick={() => navigate("/activities")}
          className="px-8 py-3 text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200"
        >
          Browse More Activities
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
        return <PaymentMethods />;
      case 3:
        return <UploadProof />;
      case 4:
        return <ConfirmationStep />;
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
            Secure your adventure with our easy 4-step booking process. Your
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
