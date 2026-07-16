import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Search flights with pricing
export const searchFlights = async (searchParams) => {
  const token = localStorage.getItem("token");
  console.log("Sending", searchParams);

  const response = await axios.post(`${API_URL}/flights/search`, searchParams, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Reveve", searchParams);
  return response.data;
};

// Get cities
export const getCities = async (query) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/flights/cities?input=${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get airlines
export const getAirlines = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/flights/airlines`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get config lists (markups & commissions)
export const getConfigLists = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/flights/config/lists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
