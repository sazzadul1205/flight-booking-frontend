// api/config.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get auth token
const getToken = () => localStorage.getItem("token");

// Axios config with auth
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// Get all rules (user-specific + global)
export const getAllRules = async () => {
  const response = await axios.get(`${API_URL}/config/lists`, authConfig());
  return response.data;
};

// Get user-specific rules only
export const getUserRules = async () => {
  const response = await axios.get(`${API_URL}/config/user`, authConfig());
  return response.data;
};

// Get global rules only
export const getGlobalRules = async () => {
  const response = await axios.get(`${API_URL}/config/global`, authConfig());
  return response.data;
};

// Get rule by ID
export const getRuleById = async (id) => {
  const response = await axios.get(`${API_URL}/config/${id}`, authConfig());
  return response.data;
};

// Create rule
export const createRule = async (ruleData) => {
  const response = await axios.post(
    `${API_URL}/config`,
    ruleData,
    authConfig(),
  );
  return response.data;
};

// Update rule
export const updateRule = async (id, ruleData) => {
  const response = await axios.put(
    `${API_URL}/config/${id}`,
    ruleData,
    authConfig(),
  );
  return response.data;
};

// Delete rule
export const deleteRule = async (id) => {
  const response = await axios.delete(`${API_URL}/config/${id}`, authConfig());
  return response.data;
};

// Toggle rule status
export const toggleRuleStatus = async (id, is_active) => {
  const response = await axios.patch(
    `${API_URL}/config/${id}/toggle`,
    { is_active },
    authConfig(),
  );
  return response.data;
};
