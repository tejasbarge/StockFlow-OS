import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/products`;

// Helper to get auth header (assuming token is stored in localStorage)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProducts = async (searchTerm = "", category = "") => {
  let url = API_URL + "?";
  if (searchTerm) url += `search=${searchTerm}&`;
  if (category) url += `category=${category}&`;
  
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(API_URL, productData, getAuthHeaders());
  return response.data;
};

export const updateProduct = async ({ id, ...productData }) => {
  const response = await axios.put(`${API_URL}/${id}`, productData, getAuthHeaders());
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};
