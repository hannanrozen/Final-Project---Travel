// Transaction Flow Test
// This file helps test the transaction API endpoints

const BASE_URL = "http://localhost:3000/api/v1";

// Renamed to avoid unused function warning
async function _testTransactionFlow() {
  console.log("Testing Transaction Flow...\n");

  // Test 1: Get payment methods
  console.log("1. Testing payment methods...");
  try {
    const response = await fetch(`${BASE_URL}/payment-methods`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    console.log("Payment methods:", result);
  } catch (error) {
    console.error("Payment methods error:", error);
  }

  // Test 2: Get cart data
  console.log("\n2. Testing cart data...");
  try {
    const response = await fetch(`${BASE_URL}/carts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    console.log("Cart data:", result);
  } catch (error) {
    console.error("Cart data error:", error);
  }

  // Test 3: Create transaction (with mock data)
  console.log("\n3. Testing transaction creation...");
  const mockTransactionData = {
    cartIds: ["mock-cart-id"],
    paymentMethodId: "mock-payment-method-id",
  };

  try {
    const response = await fetch(`${BASE_URL}/create-transaction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockTransactionData),
    });
    const result = await response.json();
    console.log("Transaction creation:", result);
  } catch (error) {
    console.error("Transaction creation error:", error);
  }
}

// Add this to your browser console to test
console.log(
  "Run testTransactionFlow() in your browser console to test the API endpoints"
);
