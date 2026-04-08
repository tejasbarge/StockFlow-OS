import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/transactions`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const addStock = async (transactionData) => {
  const response = await axios.post(`${API_URL}/add`, transactionData, getAuthHeaders());
  return response.data;
};

export const reduceStock = async (transactionData) => {
  const response = await axios.post(`${API_URL}/reduce`, transactionData, getAuthHeaders());
  return response.data;
};

export const getTransactionHistory = async (productId) => {
  const response = await axios.get(`${API_URL}/${productId}`, getAuthHeaders());
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};
