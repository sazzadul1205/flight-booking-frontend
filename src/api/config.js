// src/api/config.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// MARKUP API calls
export const getMarkups = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/config/markups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createMarkup = async (data) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/config/markups`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateMarkup = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_URL}/config/markups/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteMarkup = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/config/markups/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// COMMISSION API calls
export const getCommissions = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/config/commissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createCommission = async (data) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/config/commissions`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateCommission = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_URL}/config/commissions/${id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const deleteCommission = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/config/commissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
