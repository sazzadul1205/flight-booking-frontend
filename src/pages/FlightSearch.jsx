// src/pages/FlightSearch.jsx
import { useState, useEffect, useRef } from "react";
import {
  searchFlights,
  getCities,
  getAirlines,
  filterFlights,
} from "../api/flight";

const FlightSearch = () => {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filteredFlights, setFilteredFlights] = useState([]);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // PAGINATION REF
  const isFirstRender = useRef(true);

  // PAGINATION COMPUTED VALUES
  const currentFlights = filteredFlights.length > 0 ? filteredFlights : flights;
  const totalItems = currentFlights.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // GET CURRENT PAGE ITEMS
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentFlights.slice(startIndex, endIndex);
  };

  // PAGINATED FLIGHTS
  const paginatedFlights = getCurrentPageItems();

  // Update current page when flights change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [flights, filteredFlights]);

  // AIRLINE DROPDOWN STATE
  const [airlineSearch, setAirlineSearch] = useState("");
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState([]);

  // FLIGHT SEARCH STATE
  const [searchParams, setSearchParams] = useState({
    JourneyType: 1,
    Origin: "",
    Destination: "",
    DepartureDate: "",
    ReturnDate: "",
    ClassType: "Economy",
    NoofAdult: 1,
    NoofChildren: 0,
    NoofInfant: 0,
    Flex: null,
  });

  // FLIGHT DISPLAY STATE
  const [displayValues, setDisplayValues] = useState({
    Origin: "",
    Destination: "",
  });

  // COMPLETE FILTER STATE
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    fare_type: [],
    airlines: [],
    airline_code: [],
    aircraft: [],
    baggage: [],
    onward_flight_stops: [],
    onward_depart_time: [],
    onward_arrival_time: [],
    onward_flying_time: [],
    onward_transit_hour: [],
    onward_layover_airport: [],
    onward_destination_airport: [],
    return_flight_stops: [],
    return_depart_time: [],
    return_arrival_time: [],
    return_flying_time: [],
    return_transit_hour: [],
    return_layover_airport: [],
    return_destination_airport: [],
  });

  // CITY SUGGESTIONS
  const [activeField, setActiveField] = useState("");
  const [searchError, setSearchError] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);

  // TIME RANGE OPTIONS
  const timeRanges = [
    { name: "00:00 To 05:59" },
    { name: "06:00 To 11:59" },
    { name: "12:00 To 17:59" },
    { name: "18:00 To 23:59" },
  ];

  // STOP OPTIONS
  const stopOptions = [0, 1, 2, 3];

  // LOAD AIRLINES ON MOUNT
  useEffect(() => {
    const loadAirlines = async () => {
      try {
        const data = await getAirlines();
        setAirlines(data.data || []);
      } catch (error) {
        console.error("Failed to load airlines:", error);
      }
    };
    loadAirlines();
  }, []);

  // Log flight states
  // useEffect(() => {
  //   console.log("Flights:", flights.length);
  //   console.log("Filtered Flights:", filteredFlights.length);
  //   console.log("Current Flights:", currentFlights.length);
  // }, [flights, filteredFlights, currentFlights.length]);

  // Helper to format milliseconds to hours/minutes
  const formatDuration = (ms) => {
    if (!ms) return "N/A";
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Helper to get layover airports from Onwards segments
  const getLayoverAirports = (onwards) => {
    if (!onwards || onwards.length < 2) return [];
    // The layover airports are the destinations of all segments except the last one
    return onwards.slice(0, -1).map((seg) => seg.Destination);
  };

  // Helper to get total flying time
  const getTotalFlyingTime = (onwards) => {
    if (!onwards || !onwards.length) return null;
    let totalMs = 0;
    for (const seg of onwards) {
      if (seg.TravelDuration) {
        // TravelDuration is like "5h 10m" - parse it
        const parts = seg.TravelDuration.match(/(\d+)h\s*(\d+)m/);
        if (parts) {
          totalMs += parseInt(parts[1]) * 3600000 + parseInt(parts[2]) * 60000;
        }
      }
    }
    return totalMs;
  };

  // AIRLINE DROPDOWN HANDLERS
  const handleAirlineSearch = (e) => {
    const value = e.target.value;
    setAirlineSearch(value);
    setShowAirlineDropdown(true);
  };

  // SELECT AIRLINE
  const selectAirline = (airline) => {
    if (selectedAirlines.some((a) => a.ID === airline.ID)) {
      return;
    }
    setSelectedAirlines([...selectedAirlines, airline]);
    setFilters((prev) => ({
      ...prev,
      airlines: [...prev.airlines, airline.AriLineName],
      airline_code: [...prev.airline_code, airline.Code],
    }));
    setAirlineSearch("");
    setShowAirlineDropdown(false);
  };

  // REMOVE AIRLINE
  const removeAirline = (airline) => {
    setSelectedAirlines(selectedAirlines.filter((a) => a.ID !== airline.ID));
    setFilters((prev) => ({
      ...prev,
      airlines: prev.airlines.filter((name) => name !== airline.AriLineName),
      airline_code: prev.airline_code.filter((code) => code !== airline.Code),
    }));
  };

  const clearAllAirlines = () => {
    setSelectedAirlines([]);
    setFilters((prev) => ({
      ...prev,
      airlines: [],
      airline_code: [],
    }));
    setAirlineSearch("");
    setShowAirlineDropdown(false);
  };

  // FILTERED AIRLINES
  const filteredAirlines = airlines.filter((airline) => {
    const searchLower = airlineSearch.toLowerCase();
    return (
      airline.Code.toLowerCase().includes(searchLower) ||
      airline.AriLineName.toLowerCase().includes(searchLower)
    );
  });

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setSearchParams({ ...searchParams, [name]: checked });
      setSearchError("");
      return;
    }

    let processedValue = value;
    if (name === "JourneyType") {
      processedValue = parseInt(value);
    } else if (
      name === "NoofAdult" ||
      name === "NoofChildren" ||
      name === "NoofInfant"
    ) {
      processedValue = parseInt(value) || 0;
    }

    setSearchParams({ ...searchParams, [name]: processedValue });
    setSearchError("");
  };

  // CITY SEARCH
  const handleCitySearch = async (e) => {
    const { name, value } = e.target;
    setDisplayValues({ ...displayValues, [name]: value });
    setActiveField(name);
    setCityLoading(true);

    if (value.length > 1) {
      try {
        const data = await getCities(value);
        setCitySuggestions(data.data || []);
      } catch (error) {
        console.error("City search error:", error);
        setCitySuggestions([]);
      }
    } else {
      setCitySuggestions([]);
    }
    setCityLoading(false);
  };

  // SELECT CITY
  const selectCity = (city) => {
    setSearchParams({
      ...searchParams,
      [activeField]: city.AirportCode,
    });
    setDisplayValues({
      ...displayValues,
      [activeField]: city.SearchString,
    });
    setCitySuggestions([]);
    setSearchError("");
  };

  // FLIGHT SEARCH
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError("");

    if (!searchParams.Origin) {
      setSearchError("Please enter Origin");
      return;
    }
    if (!searchParams.Destination) {
      setSearchError("Please enter Destination");
      return;
    }
    if (!searchParams.DepartureDate) {
      setSearchError("Please select Departure Date");
      return;
    }
    if (searchParams.JourneyType === 2 && !searchParams.ReturnDate) {
      setSearchError("Return Date is required for Round Trip");
      return;
    }
    if (searchParams.Origin === searchParams.Destination) {
      setSearchError("Origin and Destination cannot be the same");
      return;
    }

    setLoading(true);

    const formattedParams = {
      JourneyType: parseInt(searchParams.JourneyType) || 1,
      Origin: searchParams.Origin.toUpperCase().trim(),
      Destination: searchParams.Destination.toUpperCase().trim(),
      DepartureDate: searchParams.DepartureDate,
      ReturnDate: searchParams.ReturnDate || "",
      ClassType: searchParams.ClassType || "Economy",
      NoofAdult: parseInt(searchParams.NoofAdult) || 1,
      NoofChildren: parseInt(searchParams.NoofChildren) || 0,
      NoofInfant: parseInt(searchParams.NoofInfant) || 0,
      Flex: null,
    };

    try {
      const data = await searchFlights(formattedParams);
      const results = data.data || [];
      setFlights(results);
      setFilteredFlights([]); // Clear filtered results
      resetFilters();

      if (results.length === 0) {
        setSearchError("No flights found for your search criteria");
      }
    } catch (error) {
      console.error("Search error:", error);
      let errorMessage = "Failed to search flights. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      setSearchError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // FILTER
  const applyFilters = async () => {
    if (flights.length === 0) {
      setSearchError("No flights to filter");
      return;
    }

    setFilterLoading(true);
    setSearchError("");

    const filterData = {};

    // Price range - only include if value is not empty
    if (filters.min_price && filters.min_price !== "") {
      filterData.min_price = parseFloat(filters.min_price);
    }
    if (filters.max_price && filters.max_price !== "") {
      filterData.max_price = parseFloat(filters.max_price);
    }

    // Arrays with values
    if (filters.fare_type.length > 0) filterData.fare_type = filters.fare_type;
    if (filters.airlines.length > 0) filterData.airlines = filters.airlines;
    if (filters.airline_code.length > 0)
      filterData.airline_code = filters.airline_code;
    if (filters.aircraft.length > 0) filterData.aircraft = filters.aircraft;
    if (filters.baggage.length > 0) filterData.baggage = filters.baggage;

    // Stops
    if (filters.onward_flight_stops.length > 0) {
      filterData.onward_flight_stops = filters.onward_flight_stops;
    }
    if (filters.return_flight_stops.length > 0) {
      filterData.return_flight_stops = filters.return_flight_stops;
    }

    // Time ranges
    if (filters.onward_depart_time.length > 0) {
      filterData.onward_depart_time = filters.onward_depart_time;
    }
    if (filters.onward_arrival_time.length > 0) {
      filterData.onward_arrival_time = filters.onward_arrival_time;
    }
    if (filters.onward_flying_time.length > 0) {
      filterData.onward_flying_time = filters.onward_flying_time;
    }
    if (filters.onward_transit_hour.length > 0) {
      filterData.onward_transit_hour = filters.onward_transit_hour;
    }
    if (filters.return_depart_time.length > 0) {
      filterData.return_depart_time = filters.return_depart_time;
    }
    if (filters.return_arrival_time.length > 0) {
      filterData.return_arrival_time = filters.return_arrival_time;
    }
    if (filters.return_flying_time.length > 0) {
      filterData.return_flying_time = filters.return_flying_time;
    }
    if (filters.return_transit_hour.length > 0) {
      filterData.return_transit_hour = filters.return_transit_hour;
    }

    // Airport filters
    if (filters.onward_layover_airport.length > 0) {
      filterData.onward_layover_airport = filters.onward_layover_airport;
    }
    if (filters.onward_destination_airport.length > 0) {
      filterData.onward_destination_airport =
        filters.onward_destination_airport;
    }
    if (filters.return_layover_airport.length > 0) {
      filterData.return_layover_airport = filters.return_layover_airport;
    }
    if (filters.return_destination_airport.length > 0) {
      filterData.return_destination_airport =
        filters.return_destination_airport;
    }

    // If no filters are selected, show all flights
    if (Object.keys(filterData).length === 0) {
      setFilteredFlights(flights);
      setCurrentPage(1);
      setFilterLoading(false);
      return;
    }

    console.log("Sending to backend:", {
      flightsCount: flights.length,
      filterData,
    });

    try {
      const response = await filterFlights(flights, filterData);
      // console.log("Filter response:", response);

      // Set filtered flights
      const filtered = response.data || [];
      setFilteredFlights(filtered);
      setCurrentPage(1);

      // Show message if no results
      if (filtered.length === 0) {
        setSearchError("No flights match your filter criteria");
      } else {
        setSearchError("");
      }
    } catch (error) {
      console.error("Filter error:", error);
      setSearchError(
        error.response?.data?.message ||
          "Failed to apply filters. Please try again.",
      );
    } finally {
      setFilterLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      min_price: "",
      max_price: "",
      fare_type: [],
      airlines: [],
      airline_code: [],
      aircraft: [],
      baggage: [],
      onward_flight_stops: [],
      onward_depart_time: [],
      onward_arrival_time: [],
      onward_flying_time: [],
      onward_transit_hour: [],
      onward_layover_airport: [],
      onward_destination_airport: [],
      return_flight_stops: [],
      return_depart_time: [],
      return_arrival_time: [],
      return_flying_time: [],
      return_transit_hour: [],
      return_layover_airport: [],
      return_destination_airport: [],
    });
    setSelectedAirlines([]);
    setAirlineSearch("");
    setShowAirlineDropdown(false);
    setFilteredFlights([]);
    setCurrentPage(1);
    setSearchError("");
  };

  // TOGGLE HELPERS
  const toggleArrayValue = (array, value) => {
    return array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value];
  };

  // TOGGLE TIME RANGES
  const toggleTimeRange = (filterKey, time) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: toggleArrayValue(prev[filterKey], time),
    }));
  };

  // TOGGLE STOPS
  const toggleStop = (filterKey, stop) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: toggleArrayValue(prev[filterKey], stop),
    }));
  };

  // TOGGLE FARE TYPE
  const toggleFareType = (type) => {
    setFilters((prev) => ({
      ...prev,
      fare_type: toggleArrayValue(prev.fare_type, type),
    }));
  };

  // GET AIRLINE NAME
  const getAirlineName = (code) => {
    const airline = airlines.find((a) => a.Code === code);
    return airline?.AriLineName || code;
  };

  // PAGINATION HANDLERS
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document
        .getElementById("flight-results")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // COUNT ACTIVE FILTERS
  const getActiveFilterCount = () => {
    let count = 0;
    const filterValues = Object.values(filters);
    filterValues.forEach((value) => {
      if (Array.isArray(value) && value.length > 0) count++;
      else if (typeof value === "string" && value !== "") count++;
      else if (typeof value === "number" && value > 0) count++;
    });
    return count;
  };

  // RENDER PAGINATION
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        onClick={goToPreviousPage}
        disabled={currentPage === 1 || filterLoading}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 1 || filterLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        ← Prev
      </button>,
    );

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          disabled={filterLoading}
          className="px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-400">
            …
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          disabled={filterLoading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            currentPage === i ? "bg-blue-600 text-white" : "hover:bg-gray-200"
          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-400">
            …
          </span>,
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          disabled={filterLoading}
          className="px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {totalPages}
        </button>,
      );
    }

    pages.push(
      <button
        key="next"
        onClick={goToNextPage}
        disabled={currentPage === totalPages || filterLoading}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          currentPage === totalPages || filterLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Next →
      </button>,
    );

    return pages;
  };

  return (
    <div className="space-y-4">
      {/* SEARCH FORM - Full width at top */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Heading */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Search Flights
        </h2>

        {/* Search Form */}
        <form onSubmit={handleSearch}>
          {/* Origin, Destination, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Origin */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin
              </label>
              <input
                type="text"
                name="Origin"
                value={displayValues.Origin}
                onChange={handleCitySearch}
                onBlur={() => setTimeout(() => setCitySuggestions([]), 200)}
                placeholder="Enter city (e.g., DAC)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
              {activeField === "Origin" &&
                (citySuggestions.length > 0 || cityLoading) && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {cityLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Searching cities...
                      </div>
                    ) : (
                      citySuggestions.map((city, index) => (
                        <div
                          key={index}
                          onClick={() => selectCity(city)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <span className="font-medium">
                            {city.AirportCode}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {city.SearchString}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
            </div>

            {/* Destination */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                name="Destination"
                value={displayValues.Destination}
                onChange={handleCitySearch}
                onBlur={() => setTimeout(() => setCitySuggestions([]), 200)}
                placeholder="Enter city (e.g., DXB)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
              {activeField === "Destination" &&
                (citySuggestions.length > 0 || cityLoading) && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {cityLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Searching cities...
                      </div>
                    ) : (
                      citySuggestions.map((city, index) => (
                        <div
                          key={index}
                          onClick={() => selectCity(city)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <span className="font-medium">
                            {city.AirportCode}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {city.SearchString}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                name="DepartureDate"
                value={searchParams.DepartureDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Return Date */}
            {searchParams.JourneyType === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  name="ReturnDate"
                  value={searchParams.ReturnDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Journey Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Journey Type
              </label>
              <select
                name="JourneyType"
                value={searchParams.JourneyType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>One Way</option>
                <option value={2}>Round Trip</option>
              </select>
            </div>

            {/* Class Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                name="ClassType"
                value={searchParams.ClassType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>

            {/* Adults */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adults
              </label>
              <input
                type="number"
                name="NoofAdult"
                value={searchParams.NoofAdult}
                onChange={handleChange}
                min="1"
                max="9"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Error */}
          {searchError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {searchError}
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </form>
      </div>

      {/* RESULTS & FILTERS - Side by side */}
      {flights.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT COLUMN - Flight Results */}
          <div className="lg:w-2/3">
            <div
              id="flight-results"
              className="bg-white rounded-lg shadow-md p-4"
            >
              {/* Results Header */}
              <div className="flex justify-between items-center mb-3">
                {/* Results Title */}
                <h2 className="text-lg font-semibold text-gray-800">
                  Results ({totalItems} flights)
                </h2>

                {/* Pagination */}
                <span className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems}
                </span>
              </div>

              {/* Filter Loading Overlay */}
              {filterLoading && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Filtering flights, please wait...
                </div>
              )}

              {/* Flights */}
              <div
                className={`space-y-3 ${filterLoading ? "opacity-60 pointer-events-none" : ""}`}
              >
                {paginatedFlights.map((flight, index) => {
                  // Extract data for display
                  const onwardSegments = flight.Onwards || [];
                  const returnSegments = flight.Returns || [];
                  const totalTravel = flight.TotalTravelTimes?.[0] || {};
                  const layoverTimeMs = totalTravel.TotalLayoverTime;
                  const layoverAirports = getLayoverAirports(onwardSegments);
                  const flyingTimeMs = getTotalFlyingTime(onwardSegments);
                  const firstOnward = onwardSegments[0] || {};
                  const lastOnward =
                    onwardSegments[onwardSegments.length - 1] || {};

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      {/* Airline, From, To, Stops */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Airline:</span>
                          <span className="ml-1 font-medium">
                            {getAirlineName(flight.PlatingCarrier) ||
                              flight.CarrierName ||
                              flight.PlatingCarrier ||
                              "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">From:</span>
                          <span className="ml-1 font-medium">
                            {firstOnward.Origin || flight.Origin || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">To:</span>
                          <span className="ml-1 font-medium">
                            {lastOnward.Destination ||
                              flight.Destination ||
                              "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stops:</span>
                          <span className="ml-1 font-medium">
                            {totalTravel.NoOfStop || flight.stops || 0}
                          </span>
                        </div>
                      </div>

                      {/* Departure, Arrival, Duration, Flight # */}
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm border-t pt-2">
                        <div>
                          <span className="text-gray-500">Departure:</span>
                          <span className="ml-1 font-medium">
                            {firstOnward.DepartureTime
                              ? new Date(
                                  firstOnward.DepartureTime,
                                ).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Arrival:</span>
                          <span className="ml-1 font-medium">
                            {lastOnward.ArrivalTime
                              ? new Date(
                                  lastOnward.ArrivalTime,
                                ).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-1 font-medium">
                            {totalTravel.TotalTravelDuration || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Flight #:</span>
                          <span className="ml-1 font-medium">
                            {firstOnward.FlightNumber || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Aircraft, Baggage, Refundable, Fare Type */}
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm border-t pt-2">
                        <div>
                          <span className="text-gray-500">Aircraft:</span>
                          <span className="ml-1 font-medium">
                            {firstOnward.Equipment || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Baggage:</span>
                          <span className="ml-1 font-medium">
                            {firstOnward.AirBaggageAllowance || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Refundable:</span>
                          <span
                            className={`ml-1 font-medium ${flight.IsRefundable ? "text-green-600" : "text-red-600"}`}
                          >
                            {flight.IsRefundable ? "Yes" : "No"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fare Type:</span>
                          <span className="ml-1 font-medium">
                            {flight.FareType || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Layover details (if applicable) */}
                      {onwardSegments.length > 1 && layoverTimeMs > 0 && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm border-t pt-2">
                          <div>
                            <span className="text-gray-500">Layover Time:</span>
                            <span className="ml-1 font-medium">
                              {formatDuration(layoverTimeMs)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Layover Airports:
                            </span>
                            <span className="ml-1 font-medium">
                              {layoverAirports.length > 0
                                ? layoverAirports.join(", ")
                                : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Flying Time (air):
                            </span>
                            <span className="ml-1 font-medium">
                              {flyingTimeMs
                                ? formatDuration(flyingTimeMs)
                                : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Transit Hour:</span>
                            <span className="ml-1 font-medium">
                              {formatDuration(layoverTimeMs)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Return leg info (if round trip) */}
                      {returnSegments.length > 0 && (
                        <div className="mt-2 border-t pt-2">
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Return Leg
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">From:</span>
                              <span className="ml-1 font-medium">
                                {returnSegments[0]?.Origin || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">To:</span>
                              <span className="ml-1 font-medium">
                                {returnSegments[returnSegments.length - 1]
                                  ?.Destination || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Departure:</span>
                              <span className="ml-1 font-medium">
                                {returnSegments[0]?.DepartureTime
                                  ? new Date(
                                      returnSegments[0].DepartureTime,
                                    ).toLocaleString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Arrival:</span>
                              <span className="ml-1 font-medium">
                                {returnSegments[returnSegments.length - 1]
                                  ?.ArrivalTime
                                  ? new Date(
                                      returnSegments[returnSegments.length - 1]
                                        .ArrivalTime,
                                    ).toLocaleString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fare Breakdown */}
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm border-t pt-2">
                        <div>
                          <span className="text-gray-500">Base Fare:</span>
                          <span className="ml-1 font-medium">
                            BDT {(flight.BasePrice || 0).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tax:</span>
                          <span className="ml-1 font-medium">
                            BDT {(flight.TotalTax || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-green-600">
                          <span className="text-gray-500">Net Fare:</span>
                          <span className="ml-1 font-bold">
                            BDT{" "}
                            {(flight.NewBaseFare !== undefined
                              ? flight.NewBaseFare + (flight.TotalTax || 0)
                              : flight.TotalPrice || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-blue-600">
                          <span className="text-gray-500">Gross Fare:</span>
                          <span className="ml-1 font-bold">
                            BDT{" "}
                            {(flight.NewBaseFare !== undefined
                              ? flight.NewBaseFare +
                                (flight.TotalTax || 0) +
                                (flight.NewDiscount || 0)
                              : flight.TotalPrice || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Applied Rule Info */}
                      {flight.AppliedRule && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded flex flex-wrap gap-3">
                          <span>
                            <span className="font-medium">Rule:</span>{" "}
                            {flight.AppliedRule.airline_code || "Global"}
                          </span>
                          <span>
                            <span className="font-medium">Markup:</span>{" "}
                            {flight.AppliedRule.markup_value}
                            {flight.AppliedRule.markup_type === "percentage"
                              ? "%"
                              : " BDT"}
                          </span>
                          <span>
                            <span className="font-medium">Commission:</span>{" "}
                            {flight.AppliedRule.commission_value}
                            {flight.AppliedRule.commission_type === "percentage"
                              ? "%"
                              : " BDT"}
                          </span>
                          {flight.NewDiscount !== undefined && (
                            <span className="text-green-600">
                              <span className="font-medium">Discount:</span> BDT{" "}
                              {flight.NewDiscount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-gray-200">
                  {/* Page Info */}
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>

                  {/* Pagination */}
                  <div className="flex flex-wrap gap-1">
                    {renderPagination()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Filters */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Filters{" "}
                  {getActiveFilterCount() > 0 &&
                    `(${getActiveFilterCount()} active)`}
                </h3>
                <div className="flex gap-2">
                  {filterLoading && (
                    <span className="text-sm text-blue-600 flex items-center gap-1">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Applying...
                    </span>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    disabled={filterLoading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 lg:hidden"
                  >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </button>
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={resetFilters}
                      disabled={filterLoading}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`${showFilters ? "block" : "hidden lg:block"} space-y-4 max-h-150 overflow-y-auto pr-2`}
              >
                {/* Price Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={(e) =>
                        setFilters({ ...filters, min_price: e.target.value })
                      }
                      disabled={filterLoading}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={(e) =>
                        setFilters({ ...filters, max_price: e.target.value })
                      }
                      disabled={filterLoading}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Fare Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fare Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Refundable", "Non-Refundable"].map((type) => (
                      <button
                        key={type}
                        onClick={() => !filterLoading && toggleFareType(type)}
                        disabled={filterLoading}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                          filters.fare_type.includes(type)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Airlines */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Airlines ({selectedAirlines.length} selected)
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <input
                        type="text"
                        value={airlineSearch}
                        onChange={handleAirlineSearch}
                        onFocus={() => {
                          if (airlines.length > 0 && airlineSearch.length > 0) {
                            setShowAirlineDropdown(true);
                          }
                        }}
                        disabled={filterLoading}
                        placeholder="Search airline..."
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                      />
                      {selectedAirlines.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllAirlines}
                          disabled={filterLoading}
                          className="px-3 py-1.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 text-gray-600 text-sm disabled:opacity-50"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Selected Airlines Tags */}
                    {selectedAirlines.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedAirlines.map((airline) => (
                          <span
                            key={airline.ID}
                            className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1"
                          >
                            {airline.Code}
                            <button
                              onClick={() =>
                                !filterLoading && removeAirline(airline)
                              }
                              disabled={filterLoading}
                              className="hover:text-red-600 ml-1 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Airline Dropdown */}
                    {showAirlineDropdown &&
                      filteredAirlines.length > 0 &&
                      !filterLoading && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                          {filteredAirlines.slice(0, 20).map((airline) => {
                            const isSelected = selectedAirlines.some(
                              (a) => a.ID === airline.ID,
                            );
                            return (
                              <div
                                key={airline.ID}
                                onClick={() => {
                                  if (!isSelected) {
                                    selectAirline(airline);
                                  }
                                }}
                                className={`px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center ${
                                  isSelected ? "bg-blue-50 opacity-50" : ""
                                }`}
                              >
                                <div>
                                  <span className="font-medium text-gray-800">
                                    {airline.Code}
                                  </span>
                                  <span className="text-gray-500 ml-2 text-xs">
                                    {airline.AriLineName}
                                  </span>
                                </div>
                                {isSelected && (
                                  <span className="text-blue-600 text-xs">
                                    ✓ Selected
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {filteredAirlines.length > 20 && (
                            <div className="px-3 py-1 text-xs text-gray-400 text-center border-t border-gray-100">
                              {filteredAirlines.length - 20} more airlines...
                            </div>
                          )}
                          {filteredAirlines.length === 0 && airlineSearch && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No airlines found
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Onward Stops */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Onward Stops
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {stopOptions.map((stops) => (
                      <button
                        key={stops}
                        onClick={() =>
                          !filterLoading &&
                          toggleStop("onward_flight_stops", stops)
                        }
                        disabled={filterLoading}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                          filters.onward_flight_stops.includes(stops)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {stops === 0
                          ? "Non-stop"
                          : `${stops} stop${stops > 1 ? "s" : ""}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Onward Departure Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Onward Departure Time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {timeRanges.map((time) => (
                      <button
                        key={time.name}
                        onClick={() =>
                          !filterLoading &&
                          toggleTimeRange("onward_depart_time", time)
                        }
                        disabled={filterLoading}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                          filters.onward_depart_time.some(
                            (t) => t.name === time.name,
                          )
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {time.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Onward Arrival Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Onward Arrival Time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {timeRanges.map((time) => (
                      <button
                        key={time.name}
                        onClick={() =>
                          !filterLoading &&
                          toggleTimeRange("onward_arrival_time", time)
                        }
                        disabled={filterLoading}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                          filters.onward_arrival_time.some(
                            (t) => t.name === time.name,
                          )
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {time.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Return Filters */}
                {searchParams.JourneyType === 2 && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Return Stops
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {stopOptions.map((stops) => (
                          <button
                            key={stops}
                            onClick={() =>
                              !filterLoading &&
                              toggleStop("return_flight_stops", stops)
                            }
                            disabled={filterLoading}
                            className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                              filters.return_flight_stops.includes(stops)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {stops === 0
                              ? "Non-stop"
                              : `${stops} stop${stops > 1 ? "s" : ""}`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Return Departure Time
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {timeRanges.map((time) => (
                          <button
                            key={time.name}
                            onClick={() =>
                              !filterLoading &&
                              toggleTimeRange("return_depart_time", time)
                            }
                            disabled={filterLoading}
                            className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                              filters.return_depart_time.some(
                                (t) => t.name === time.name,
                              )
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {time.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Return Arrival Time
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {timeRanges.map((time) => (
                          <button
                            key={time.name}
                            onClick={() =>
                              !filterLoading &&
                              toggleTimeRange("return_arrival_time", time)
                            }
                            disabled={filterLoading}
                            className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                              filters.return_arrival_time.some(
                                (t) => t.name === time.name,
                              )
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {time.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={applyFilters}
                  disabled={filterLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {filterLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Applying...
                    </>
                  ) : (
                    "Apply Filters"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No results */}
      {flights.length === 0 && !loading && !searchError && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Search for flights to see results here
        </div>
      )}

      {/* Loading flights */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Searching for flights...
        </div>
      )}
    </div>
  );
};

export default FlightSearch;
