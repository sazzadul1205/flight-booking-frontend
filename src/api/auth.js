import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// POST login
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

// POST register
export const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
  });
  return response.data;
};

// GET profile
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// POST logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
