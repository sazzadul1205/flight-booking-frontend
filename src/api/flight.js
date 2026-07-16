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

// Search flights
export const searchFlights = async (searchParams) => {
  const response = await axios.post(
    `${API_URL}/flights/search`,
    searchParams,
    authConfig(),
  );
  return response.data;
};

// Get cities
export const getCities = async (query) => {
  const response = await axios.get(
    `${API_URL}/cities?input=${query}`,
    authConfig(),
  );
  return response.data;
};

// Get airlines
export const getAirlines = async () => {
  const response = await axios.get(`${API_URL}/airlines`, authConfig());
  return response.data;
};

// Filter flights
export const filterFlights = async (flights, filter) => {
  const response = await axios.post(
    `${API_URL}/filter`,
    { flights, filter },
    authConfig(),
  );
  return response.data;
};
