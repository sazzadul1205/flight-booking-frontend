// src/pages/FlightSearch.jsx
import { useState, useEffect } from "react";
import {
  searchFlights,
  getCities,
  getAirlines,
  filterFlights,
} from "../api/flight";

const FlightSearch = () => {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
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
    Flex: false, // Add Flex field - false means non-flexible
  });

  // Display values for city names (shows SearchString instead of AirportCode)
  const [displayValues, setDisplayValues] = useState({
    Origin: "",
    Destination: "",
  });

  // Filter state
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    fare_type: [],
    airlines: [],
    onward_flight_stops: [],
  });

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");
  const [searchError, setSearchError] = useState("");

  // Load airlines on mount
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

  // Handle input change - ensure proper types
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox separately
    if (type === "checkbox") {
      setSearchParams({ ...searchParams, [name]: checked });
      setSearchError("");
      return;
    }

    // Convert to proper types
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

  // Handle city search with debounce
  const handleCitySearch = async (e) => {
    const { name, value } = e.target;
    setDisplayValues({ ...displayValues, [name]: value });
    setActiveField(name);

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
  };

  // Select city from suggestion
  const selectCity = (city) => {
    // Store the AirportCode for search
    setSearchParams({
      ...searchParams,
      [activeField]: city.AirportCode,
    });
    // Store the SearchString for display
    setDisplayValues({
      ...displayValues,
      [activeField]: city.SearchString,
    });
    setCitySuggestions([]);
    setSearchError("");
  };

  // Handle flight search
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError("");

    // Validate required fields
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
    if (searchParams.Origin === searchParams.Destination) {
      setSearchError("Origin and Destination cannot be the same");
      return;
    }

    setLoading(true);

    // Format data properly for API - include all required fields
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
      Flex: null, // ← ALWAYS SEND NULL
    };

    console.log("Sending to API:", formattedParams);

    try {
      const data = await searchFlights(formattedParams);
      console.log("API Response:", data);

      const results = data.data || [];
      setFlights(results);
      setFilteredFlights(results);

      // Reset filters
      setFilters({
        min_price: "",
        max_price: "",
        fare_type: [],
        airlines: [],
        onward_flight_stops: [],
      });

      if (results.length === 0) {
        setSearchError("No flights found for your search criteria");
      }
    } catch (error) {
      console.error("Search error:", error);

      // Better error handling
      let errorMessage = "Failed to search flights. Please try again.";

      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);

        // Try to get error message from response
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        }
      } else if (error.request) {
        console.error("Error request:", error.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        console.error("Error message:", error.message);
        errorMessage = error.message;
      }

      setSearchError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = async () => {
    if (flights.length === 0) return;

    const filterData = {
      min_price: filters.min_price ? parseFloat(filters.min_price) : 0,
      max_price: filters.max_price ? parseFloat(filters.max_price) : 0,
      fare_type: filters.fare_type,
      airlines: filters.airlines,
      onward_flight_stops: filters.onward_flight_stops.map(Number),
    };

    try {
      const data = await filterFlights(flights, filterData);
      setFilteredFlights(data.data || []);
    } catch (error) {
      console.error("Filter error:", error);
      alert("Failed to apply filters");
    }
  };

  const resetFilters = () => {
    setFilters({
      min_price: "",
      max_price: "",
      fare_type: [],
      airlines: [],
      onward_flight_stops: [],
    });
    setFilteredFlights(flights);
  };

  const toggleFareType = (type) => {
    setFilters((prev) => ({
      ...prev,
      fare_type: prev.fare_type.includes(type)
        ? prev.fare_type.filter((t) => t !== type)
        : [...prev.fare_type, type],
    }));
  };

  const toggleAirline = (code) => {
    setFilters((prev) => ({
      ...prev,
      airlines: prev.airlines.includes(code)
        ? prev.airlines.filter((a) => a !== code)
        : [...prev.airlines, code],
    }));
  };

  const toggleStops = (stops) => {
    setFilters((prev) => ({
      ...prev,
      onward_flight_stops: prev.onward_flight_stops.includes(stops)
        ? prev.onward_flight_stops.filter((s) => s !== stops)
        : [...prev.onward_flight_stops, stops],
    }));
  };

  const getAirlineName = (code) => {
    const airline = airlines.find((a) => a.Code === code);
    return airline?.AriLineName || code;
  };

  const displayFlights = filteredFlights.length > 0 ? filteredFlights : flights;

  return (
    <div>
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <form onSubmit={handleSearch}>
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
                placeholder="Enter city (e.g., DAC)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
              {citySuggestions.length > 0 && activeField === "Origin" && (
                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {citySuggestions.map((city, index) => (
                    <div
                      key={index}
                      onClick={() => selectCity(city)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{city.AirportCode}</span>
                      <span className="text-gray-500 ml-2">
                        {city.SearchString}
                      </span>
                    </div>
                  ))}
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
                placeholder="Enter city (e.g., DXB)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
              {citySuggestions.length > 0 &&
                activeField === "Destination" && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {citySuggestions.map((city, index) => (
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
                    ))}
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

            {/* Return Date (for round trip) */}
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

          {/* Error Message */}
          {searchError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {searchError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </form>
      </div>

      {/* Filter Section */}
      {flights.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              {(filters.fare_type.length > 0 ||
                filters.airlines.length > 0 ||
                filters.min_price ||
                filters.max_price ||
                filters.onward_flight_stops.length > 0) && (
                  <button
                    onClick={resetFilters}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
            </div>
          </div>

          {showFilters && (
            <div className="space-y-4">
              {/* Price Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
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
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="w-full bg-blue-600 text-white py-1.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Apply Filters
                  </button>
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
                      onClick={() => toggleFareType(type)}
                      className={`px-3 py-1 rounded-lg text-xs border transition-colors ${filters.fare_type.includes(type)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stops */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stops
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3].map((stops) => (
                    <button
                      key={stops}
                      onClick={() => toggleStops(stops)}
                      className={`px-3 py-1 rounded-lg text-xs border transition-colors ${filters.onward_flight_stops.includes(stops)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {stops === 0
                        ? "Non-stop"
                        : `${stops} stop${stops > 1 ? "s" : ""}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Airlines */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Airlines
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(flights.map((f) => f.PlatingCarrier)))
                    .slice(0, 15)
                    .map((code) => (
                      <button
                        key={code}
                        onClick={() => toggleAirline(code)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${filters.airlines.includes(code)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                      >
                        {code}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flight Results */}
      {displayFlights.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Results ({displayFlights.length} flights)
          </h2>
          <div className="space-y-3">
            {displayFlights.map((flight, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                {/* Flight Route & Airline */}
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
                      {flight.Onwards?.[0]?.Origin || flight.Origin || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">To:</span>
                    <span className="ml-1 font-medium">
                      {flight.Onwards?.[0]?.Destination ||
                        flight.Destination ||
                        "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stops:</span>
                    <span className="ml-1 font-medium">
                      {flight.TotalTravelTimes?.[0]?.NoOfStop ||
                        flight.stops ||
                        0}
                    </span>
                  </div>
                </div>

                {/* Departure & Arrival Times */}
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm border-t pt-2">
                  <div>
                    <span className="text-gray-500">Departure:</span>
                    <span className="ml-1 font-medium">
                      {flight.Onwards?.[0]?.DepartureTime
                        ? new Date(
                          flight.Onwards[0].DepartureTime,
                        ).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Arrival:</span>
                    <span className="ml-1 font-medium">
                      {flight.Onwards?.[0]?.ArrivalTime
                        ? new Date(
                          flight.Onwards[0].ArrivalTime,
                        ).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 font-medium">
                      {flight.TotalTravelTimes?.[0]?.TotalTravelDuration ||
                        "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Flight #:</span>
                    <span className="ml-1 font-medium">
                      {flight.Onwards?.[0]?.FlightNumber || "N/A"}
                    </span>
                  </div>
                </div>

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
                      <span className="font-medium">Rule Applied:</span>{" "}
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

                {/* Additional Details */}
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm bg-gray-50 p-2 rounded">
                  <div>
                    <span className="text-gray-500">Cabin Class:</span>
                    <span className="ml-1 font-medium">
                      {flight.Onwards?.[0]?.CabinClass || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Baggage:</span>
                    <span className="ml-1 font-medium">
                      {flight.Onwards?.[0]?.AirBaggageAllowance || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Refundable:</span>
                    <span className="ml-1 font-medium">
                      {flight.IsRefundable ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bookable:</span>
                    <span className="ml-1 font-medium">
                      {flight.IsBookable ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Tax Breakdown */}
                {flight.FareBreakdown?.[0]?.TaxesBreakdown && (
                  <div className="mt-2">
                    <details className="text-xs">
                      <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                        Tax Breakdown (
                        {flight.FareBreakdown[0].TaxesBreakdown.length} taxes)
                      </summary>
                      <div className="mt-1 grid grid-cols-3 md:grid-cols-6 gap-1">
                        {flight.FareBreakdown[0].TaxesBreakdown.map(
                          (tax, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 px-2 py-1 rounded"
                            >
                              {tax.Category}: BDT {tax.Amount.toFixed(2)}
                            </span>
                          ),
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {flights.length === 0 && !loading && !searchError && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Search for flights to see results here
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Searching for flights...
        </div>
      )}
    </div>
  );
};

export default FlightSearch;