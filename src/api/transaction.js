import api from "../utils/axios.js";

export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/transaction/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Fetched transaction by ID successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch transaction by ID.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getMyTransactions = async () => {
  try {
    const response = await api.get("/my-transactions");
    return {
      success: true,
      data: response.data,
      message: "Fetched my transactions successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch my transactions.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const getAllTransactions = async () => {
  try {
    const response = await api.get("/all-transactions");
    return {
      success: true,
      data: response.data,
      message: "Fetched all transactions successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch all transactions.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post("/create-transaction", transactionData);
    return {
      success: true,
      data: response.data,
      message: "Transaction created successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create transaction.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const cancelTransaction = async (cancelData) => {
  try {
    const response = await api.post("/cancel-transaction", cancelData);
    return {
      success: true,
      data: response.data,
      message: "Transaction cancelled successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to cancel transaction.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateTransactionProofPayment = async (proofData) => {
  try {
    const response = await api.post(
      "/update-transaction-proof-payment",
      proofData
    );
    return {
      success: true,
      data: response.data,
      message: "Transaction proof payment updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update transaction proof payment.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export const updateTransactionStatus = async (statusData) => {
  try {
    const response = await api.post("/update-transaction-status", statusData);
    return {
      success: true,
      data: response.data,
      message: "Transaction status updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update transaction status.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
