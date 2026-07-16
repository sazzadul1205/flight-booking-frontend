// api/flight.js
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
  // Ensure the field names match what the backend expects
  const formattedParams = {
    JourneyType: parseInt(searchParams.JourneyType) || 1,
    Origin: searchParams.Origin?.toUpperCase().trim() || "",
    Destination: searchParams.Destination?.toUpperCase().trim() || "",
    DepartureDate: searchParams.DepartureDate || "",
    ReturnDate: searchParams.ReturnDate || "",
    ClassType: searchParams.ClassType || "Economy",
    NoofAdult: parseInt(searchParams.NoofAdult) || 1,
    NoofChildren: parseInt(searchParams.NoofChildren) || 0,
    NoofInfant: parseInt(searchParams.NoofInfant) || 0,
    IsSpecialTexRedumption: searchParams.IsSpecialTexRedumption || false,
    IsFlexSearch: searchParams.IsFlexSearch || false,
    Flex: searchParams.Flex ?? null, // Use null if not provided
    ChildrenAges: Array.isArray(searchParams.ChildrenAges)
      ? searchParams.ChildrenAges
      : [],
  };

  console.log("Sending to API:", formattedParams);

  const response = await axios.post(
    `${API_URL}/flights/search`,
    formattedParams,
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
