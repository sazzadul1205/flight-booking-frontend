import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

// API
import {
  searchFlights,
  getCities,
  getAirlines,
  filterFlights,
} from "../api/flight";

// Icons
import { FaArrowRight } from "react-icons/fa";

// Components
import DatePicker from "../components/DatePicker";
import TravelerClassPicker from "../components/TravelerClassPicker";
import FlightResults from "../components/FlightResults";
import FlightFilters from "../components/FlightFilters";

const extractCityName = (searchString) => {
  if (!searchString) return "";
  const parts = searchString.split(",");
  return parts.length > 1 ? parts[parts.length - 2].trim() : searchString;
};

const formatDateToYYYYMMDD = (day, month, year) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const parseDateFromString = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);

  const date = new Date(year, month, day);
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return {
    full: `${day} ${monthNames[month]}'${String(year).slice(-2)}`,
    dayName: dayNames[date.getDay()],
    day: day,
    month: month,
    year: year,
  };
};

// Get today's date formatted
const getTodayDate = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return {
    full: `${day} ${monthNames[month]}'${String(year).slice(-2)}`,
    dayName: dayNames[today.getDay()],
    day: day,
    month: month,
    year: year,
  };
};

// Map city code to display name
const getCityDisplayName = (cityCode) => {
  const cityMap = {
    DAC: "Hazrat Shahjalal International Airport,Dhaka,Bangladesh",
    CXB: "CXB, Coxs Bazar Airport,Coxs Bazar,Bangladesh",
  };
  return cityMap[cityCode] || `${cityCode}, Airport,City,Country`;
};

const Search = () => {
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  // Extract URL params
  const urlOrigin = queryParams.get("origin") || "DAC";
  const urlDestination = queryParams.get("destination") || "CXB";
  const urlDepartureDate = queryParams.get("departureDate") || "";
  const urlReturnDate = queryParams.get("returnDate") || "";
  const urlClassType = queryParams.get("classType") || "Economy";
  const urlNoOfAdult = parseInt(queryParams.get("noOfAdult")) || 1;
  const urlNoOfChildren = parseInt(queryParams.get("noOfChildren")) || 0;
  const urlNoOfInfant = parseInt(queryParams.get("noOfInfant")) || 0;
  const urlJourneyType = parseInt(queryParams.get("journeyType")) || 1;

  // Use today's date as fallback
  const todayDate = getTodayDate();

  // Parse date from URL or use today's date
  const parsedDate = urlDepartureDate
    ? parseDateFromString(urlDepartureDate)
    : null;

  const [searchParams, setSearchParams] = useState({
    JourneyType: urlJourneyType,
    Origin: urlOrigin,
    Destination: urlDestination,
    DepartureDate:
      urlDepartureDate ||
      formatDateToYYYYMMDD(todayDate.day, todayDate.month, todayDate.year),
    ReturnDate: urlReturnDate || "",
    ClassType: urlClassType,
    NoofAdult: urlNoOfAdult,
    NoofChildren: urlNoOfChildren,
    NoofInfant: urlNoOfInfant,
    Flex: null,
  });

  const [displayOrigin, setDisplayOrigin] = useState(
    getCityDisplayName(urlOrigin),
  );
  const [displayDestination, setDisplayDestination] = useState(
    getCityDisplayName(urlDestination),
  );

  // Set initial date - use URL date if available, otherwise today
  const [selectedDate, setSelectedDate] = useState(parsedDate || todayDate);

  const [travelerSelection, setTravelerSelection] = useState({
    adults: urlNoOfAdult,
    children: urlNoOfChildren,
    infants: urlNoOfInfant,
    classType: urlClassType,
  });

  // Traveler Selection
  const [searchInput, setSearchInput] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [cityLoading, setCityLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTravelerPicker, setShowTravelerPicker] = useState(false);
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    fare_type: [],
    airlines: [],
    airline_code: [],
    aircraft: [],
    baggage: [],
    onward_flight_stops: [],
    return_flight_stops: [],
    onward_depart_time: [],
    return_depart_time: [],
    onward_arrival_time: [],
    return_arrival_time: [],
    onward_transit_hour: [],
    return_transit_hour: [],
    onward_flying_time: [],
    return_flying_time: [],
    onward_layover_airport: [],
    return_layover_airport: [],
    onward_destination_airport: [],
    return_destination_airport: [],
  });

  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);

  // Create airlines array from filterOptions
  const airlinesList = useMemo(() => {
    if (!filterOptions?.airlines || !filterOptions?.airline_code) return [];
    return filterOptions.airlines.map((name, index) => ({
      ID: index + 1,
      Code:
        filterOptions.airline_code[index] || name.substring(0, 2).toUpperCase(),
      AriLineName: name,
    }));
  }, [filterOptions]);

  // Helper to extract filter values
  const extractFilterValues = useCallback((items) => {
    if (!items || items.length === 0) return [];
    if (
      typeof items[0] === "object" &&
      items[0] !== null &&
      "name" in items[0]
    ) {
      return items.map((item) => item.name);
    }
    return items;
  }, []);

  // Apply filters function - FIXED
  // Apply filters function - WITH COMPLETE LOGGING
  const applyFilters = useCallback(async () => {
    console.log("=== APPLY FILTERS STARTED ===");
    console.log("Flights count:", flights.length);
    console.log("Current filters:", JSON.stringify(filters, null, 2));

    if (flights.length === 0) {
      setSearchError("No flights to filter");
      return;
    }

    setFilterLoading(true);
    setSearchError("");

    const filterData = {};

    // Price range
    if (filters.min_price && filters.min_price !== "") {
      filterData.min_price = parseFloat(filters.min_price);
    }
    if (filters.max_price && filters.max_price !== "") {
      filterData.max_price = parseFloat(filters.max_price);
    }

    // Arrays with values
    if (filters.fare_type.length > 0) {
      filterData.fare_type = extractFilterValues(filters.fare_type);
    }
    if (filters.airlines.length > 0) {
      filterData.airlines = extractFilterValues(filters.airlines);
    }
    if (filters.airline_code.length > 0) {
      filterData.airline_code = extractFilterValues(filters.airline_code);
    }
    if (filters.aircraft.length > 0) {
      filterData.aircraft = extractFilterValues(filters.aircraft);
    }
    if (filters.baggage.length > 0) {
      filterData.baggage = extractFilterValues(filters.baggage);
    }
    if (filters.onward_flight_stops.length > 0) {
      filterData.onward_flight_stops = extractFilterValues(
        filters.onward_flight_stops,
      );
    }
    if (filters.return_flight_stops.length > 0) {
      filterData.return_flight_stops = extractFilterValues(
        filters.return_flight_stops,
      );
    }
    if (filters.onward_depart_time.length > 0) {
      filterData.onward_depart_time = extractFilterValues(
        filters.onward_depart_time,
      );
    }
    if (filters.onward_arrival_time.length > 0) {
      filterData.onward_arrival_time = extractFilterValues(
        filters.onward_arrival_time,
      );
    }
    if (filters.onward_flying_time.length > 0) {
      filterData.onward_flying_time = extractFilterValues(
        filters.onward_flying_time,
      );
    }
    if (filters.onward_transit_hour.length > 0) {
      filterData.onward_transit_hour = extractFilterValues(
        filters.onward_transit_hour,
      );
    }
    if (filters.return_depart_time.length > 0) {
      filterData.return_depart_time = extractFilterValues(
        filters.return_depart_time,
      );
    }
    if (filters.return_arrival_time.length > 0) {
      filterData.return_arrival_time = extractFilterValues(
        filters.return_arrival_time,
      );
    }
    if (filters.return_flying_time.length > 0) {
      filterData.return_flying_time = extractFilterValues(
        filters.return_flying_time,
      );
    }
    if (filters.return_transit_hour.length > 0) {
      filterData.return_transit_hour = extractFilterValues(
        filters.return_transit_hour,
      );
    }
    if (filters.onward_layover_airport.length > 0) {
      filterData.onward_layover_airport = extractFilterValues(
        filters.onward_layover_airport,
      );
    }
    if (filters.onward_destination_airport.length > 0) {
      filterData.onward_destination_airport = extractFilterValues(
        filters.onward_destination_airport,
      );
    }
    if (filters.return_layover_airport.length > 0) {
      filterData.return_layover_airport = extractFilterValues(
        filters.return_layover_airport,
      );
    }
    if (filters.return_destination_airport.length > 0) {
      filterData.return_destination_airport = extractFilterValues(
        filters.return_destination_airport,
      );
    }

    // If no filters are selected, show all flights
    if (Object.keys(filterData).length === 0) {
      console.log("No filters selected, showing all flights");
      setFilteredFlights(flights);
      setSearchError("");
      setFilterLoading(false);
      return;
    }

    console.log("=== FINAL FILTER DATA ===");
    console.log("Filter data being sent:", JSON.stringify(filterData, null, 2));
    console.log("Filter keys:", Object.keys(filterData));

    // Log first flight structure to understand what we're filtering
    if (flights.length > 0) {
      console.log(
        "Sample flight (first):",
        JSON.stringify(flights[0], null, 2),
      );
      console.log("What aircraft values exist in flights?");
      const aircraftValues = new Set();
      flights.forEach((f) => {
        if (f.OnwardFlights && f.OnwardFlights.length > 0) {
          f.OnwardFlights.forEach((of) => {
            if (of.Aircraft) aircraftValues.add(of.Aircraft);
          });
        }
      });
      console.log("Aircraft values in flights:", Array.from(aircraftValues));
    }

    try {
      console.log("=== CALLING FILTER API ===");
      const response = await filterFlights(flights, filterData);
      console.log("=== API RESPONSE ===");
      console.log("Full response:", response);
      console.log("Response data type:", typeof response.data);
      console.log("Response data:", response.data);
      console.log("Response data length:", response.data?.length);

      const filtered = response.data || [];
      console.log("Filtered flights count:", filtered.length);

      setFilteredFlights(filtered);

      if (filtered.length === 0) {
        console.warn("⚠️ No flights matched the filter criteria");
        setSearchError("No flights match your filter criteria");
      } else {
        console.log(`✅ Successfully filtered ${filtered.length} flights`);
        console.log(
          "First filtered flight:",
          JSON.stringify(filtered[0], null, 2),
        );
        setSearchError("");
      }
    } catch (error) {
      console.error("=== FILTER ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error stack:", error.stack);
      setSearchError(
        error.response?.data?.message ||
          "Failed to apply filters. Please try again.",
      );
    } finally {
      setFilterLoading(false);
      console.log("=== APPLY FILTERS COMPLETED ===");
    }
  }, [flights, filters, extractFilterValues]);

  const resetFilters = useCallback(() => {
    setFilters({
      min_price: "",
      max_price: "",
      fare_type: [],
      airlines: [],
      airline_code: [],
      aircraft: [],
      baggage: [],
      onward_flight_stops: [],
      return_flight_stops: [],
      onward_depart_time: [],
      return_depart_time: [],
      onward_arrival_time: [],
      return_arrival_time: [],
      onward_transit_hour: [],
      return_transit_hour: [],
      onward_flying_time: [],
      return_flying_time: [],
      onward_layover_airport: [],
      return_layover_airport: [],
      onward_destination_airport: [],
      return_destination_airport: [],
    });
    setSelectedAirlines([]);
    setFilteredFlights([]);
    setSearchError("");
  }, []);

  // Refs
  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const loadAirlines = async () => {
      try {
        // eslint-disable-next-line no-unused-vars
        const data = await getAirlines();
      } catch (error) {
        console.error("Failed to load airlines:", error);
      }
    };
    loadAirlines();
  }, []);

  const formatSearchParams = useCallback(() => {
    let departureDate = searchParams.DepartureDate;
    if (!departureDate && selectedDate) {
      departureDate = formatDateToYYYYMMDD(
        selectedDate.day,
        selectedDate.month,
        selectedDate.year,
      );
    }

    return {
      JourneyType: parseInt(searchParams.JourneyType) || 1,
      Origin: searchParams.Origin,
      Destination: searchParams.Destination,
      DepartureDate: departureDate,
      ReturnDate: searchParams.ReturnDate || "",
      ClassType: travelerSelection.classType || "Economy",
      NoofAdult: parseInt(travelerSelection.adults) || 1,
      NoofChildren: parseInt(travelerSelection.children) || 0,
      NoofInfant: parseInt(travelerSelection.infants) || 0,
      Flex: null,
    };
  }, [searchParams, selectedDate, travelerSelection]);

  const performSearch = useCallback(
    async (formattedParams) => {
      // Reset everything for new search to show skeleton
      setFlights([]);
      setFilteredFlights([]);
      setFilterOptions({});
      setLoading(true);
      setSearchError("");

      try {
        const data = await searchFlights(formattedParams);
        const results = data.data || [];
        setFlights(results);
        setFilteredFlights([]); // Clear filtered results

        // Store filter options from API response
        if (data.filter) {
          setFilterOptions(data.filter);
        }

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
          errorMessage =
            "No response from server. Please check your connection.";
        }
        setSearchError(errorMessage);
        setFlights([]);
        setFilterOptions({});
      } finally {
        setLoading(false);
      }
    },
    [resetFilters],
  );

  const sortCitiesByRelevance = useCallback((cities, query) => {
    const searchLower = query.toLowerCase().trim();

    return cities
      .map((city) => {
        let score = 0;
        const searchString = (city.SearchString || "").toLowerCase();
        const airportCode = (city.AirportCode || "").toLowerCase();
        const cityName = (city.CityName || "").toLowerCase();
        const country = (city.Country || "").toLowerCase();
        const airportName = (city.AirportName || "").toLowerCase();

        if (airportCode === searchLower) {
          score += 100;
        }
        if (airportCode.startsWith(searchLower)) {
          score += 80;
        }
        if (cityName === searchLower) {
          score += 90;
        }
        if (cityName.startsWith(searchLower)) {
          score += 70;
        }
        if (cityName.includes(searchLower)) {
          score += 50;
        }
        if (searchString.includes(searchLower)) {
          score += 40;
        }
        if (airportName.startsWith(searchLower)) {
          score += 60;
        }
        if (airportName.includes(searchLower)) {
          score += 30;
        }
        if (country.includes(searchLower)) {
          score += 20;
        }
        const words = searchString.split(/[\s,]+/);
        for (const word of words) {
          if (word.startsWith(searchLower)) {
            score += 25;
          }
        }

        return { ...city, score };
      })
      .sort((a, b) => b.score - a.score);
  }, []);

  const performCitySearch = useCallback(
    async (query) => {
      if (query.length <= 1) {
        setCitySuggestions([]);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setCityLoading(true);
      try {
        const data = await getCities(query, controller.signal);
        const sortedData = sortCitiesByRelevance(data.data || [], query);
        setCitySuggestions(sortedData);
      } catch (error) {
        if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
          console.error("City search error:", error);
          setCitySuggestions([]);
        }
      } finally {
        setCityLoading(false);
      }
    },
    [sortCitiesByRelevance],
  );

  const debouncedCitySearch = useCallback(
    (query) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        performCitySearch(query);
      }, 300);
    },
    [performCitySearch],
  );

  // Auto-trigger search on mount if URL has params
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // If there are URL params, trigger search
      const hasSearchParams = queryParams.toString().length > 0;

      if (hasSearchParams) {
        // Small delay to ensure all states are properly set
        setTimeout(() => {
          const formattedParams = formatSearchParams();

          // Only trigger if we have the minimum required params
          if (
            formattedParams.Origin &&
            formattedParams.Destination &&
            formattedParams.DepartureDate
          ) {
            performSearch(formattedParams);
          }
        }, 500);
      }
    }
  }, [queryParams, formatSearchParams, performSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveField(null);
        setCitySuggestions([]);
        setSearchInput("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleCitySearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedCitySearch(value);
  };

  const selectCity = (city) => {
    const field = activeField;
    if (field === "Origin") {
      setSearchParams({ ...searchParams, Origin: city.AirportCode });
      setDisplayOrigin(city.SearchString);
    } else if (field === "Destination") {
      setSearchParams({ ...searchParams, Destination: city.AirportCode });
      setDisplayDestination(city.SearchString);
    }
    setActiveField(null);
    setCitySuggestions([]);
    setSearchInput("");
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  const openDropdown = (field) => {
    setActiveField(field);
    setSearchInput("");
    setCitySuggestions([]);
  };

  const handleTravelerChange = (data) => {
    setTravelerSelection(data);
    setSearchParams({
      ...searchParams,
      NoofAdult: data.adults,
      NoofChildren: data.children,
      NoofInfant: data.infants,
      ClassType: data.classType,
    });
  };

  const getTravelerDisplayText = () => {
    const total =
      travelerSelection.adults +
      travelerSelection.children +
      travelerSelection.infants;
    return total === 0
      ? "0 Traveler"
      : `${total} Traveler${total > 1 ? "s" : ""}`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError("");

    if (!searchParams.Origin) {
      setSearchError("Please select Origin");
      return;
    }
    if (!searchParams.Destination) {
      setSearchError("Please select Destination");
      return;
    }

    if (!searchParams.DepartureDate && !selectedDate) {
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

    const formattedParams = formatSearchParams();
    await performSearch(formattedParams);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const formattedDate = formatDateToYYYYMMDD(date.day, date.month, date.year);
    setSearchParams({
      ...searchParams,
      DepartureDate: formattedDate,
    });
  };

  // Determine which flights to display (filtered or all)
  const displayFlights = filteredFlights.length > 0 ? filteredFlights : flights;

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Main Content */}
      <div className="bg-white p-6 max-w-full w-full pt-24">
        {/* Search Form */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative flex items-stretch gap-2">
            <div className="relative flex-1">
              <div
                className="bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer h-full"
                onClick={() => openDropdown("Origin")}
              >
                <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                  From
                </span>

                <h1 className="text-lg font-bold text-blue-900 truncate">
                  {extractCityName(displayOrigin)}
                </h1>

                <p
                  className="text-[11px] text-blue-600 truncate max-w-50"
                  title={displayOrigin}
                >
                  {displayOrigin}
                </p>
              </div>

              {activeField === "Origin" && (
                <div
                  ref={dropdownRef}
                  className="absolute z-20 top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-blue-100 p-3 max-h-60 overflow-y-auto"
                >
                  <input
                    type="text"
                    placeholder="Search city or airport..."
                    value={searchInput}
                    onChange={handleCitySearch}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />

                  {cityLoading && (
                    <div className="text-blue-500 text-sm mt-2">Loading...</div>
                  )}

                  <ul className="mt-2 divide-y divide-gray-100">
                    {citySuggestions.slice(0, 20).map((city) => {
                      const cityName = extractCityName(city.SearchString);

                      return (
                        <li
                          key={city.ID}
                          onClick={() => selectCity(city)}
                          className="py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="font-medium text-gray-800 truncate">
                            {city.AirportCode} - {cityName}
                          </div>

                          <div className="text-xs text-gray-500 truncate max-w-50">
                            {city.SearchString}
                          </div>
                        </li>
                      );
                    })}

                    {!cityLoading &&
                      citySuggestions.length === 0 &&
                      searchInput.length > 1 && (
                        <li className="py-2 text-gray-500 text-sm">
                          No cities found
                        </li>
                      )}

                    {searchInput.length <= 1 && !cityLoading && (
                      <li className="py-2 text-gray-400 text-sm">
                        Type at least 2 characters to search
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                <FaArrowRight className="text-white" />
              </div>
            </div>

            <div className="relative flex-1">
              <div
                className="bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer h-full"
                onClick={() => openDropdown("Destination")}
              >
                <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider pl-2">
                  To
                </span>
                <h1 className="text-lg font-bold text-blue-900 pl-2 truncate">
                  {extractCityName(displayDestination)}
                </h1>
                <p
                  className="text-[11px] text-blue-600 truncate pl-2 max-w-50"
                  title={displayDestination}
                >
                  {displayDestination}
                </p>
              </div>

              {activeField === "Destination" && (
                <div
                  ref={dropdownRef}
                  className="absolute z-20 top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-blue-100 p-3 max-h-60 overflow-y-auto"
                >
                  <input
                    type="text"
                    placeholder="Search city or airport..."
                    value={searchInput}
                    onChange={handleCitySearch}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {cityLoading && (
                    <div className="text-blue-500 text-sm mt-2">Loading...</div>
                  )}
                  <ul className="mt-2 divide-y divide-gray-100">
                    {citySuggestions.slice(0, 20).map((city) => {
                      const cityName = extractCityName(city.SearchString);

                      return (
                        <li
                          key={city.ID}
                          onClick={() => selectCity(city)}
                          className="py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="font-medium text-gray-800 truncate">
                            {city.AirportCode} - {cityName}
                          </div>

                          <div className="text-xs text-gray-500 truncate">
                            {city.SearchString}
                          </div>
                        </li>
                      );
                    })}
                    {!cityLoading &&
                      citySuggestions.length === 0 &&
                      searchInput.length > 1 && (
                        <li className="py-2 text-gray-500 text-sm">
                          No cities found
                        </li>
                      )}
                    {searchInput.length <= 1 && !cityLoading && (
                      <li className="py-2 text-gray-400 text-sm">
                        Type at least 2 characters to search
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex-1 max-w-50">
            <div
              className="bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer transition-all h-full"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                Departure Date
              </span>
              <h1 className="text-base font-bold text-blue-900">
                {selectedDate.full}
              </h1>
              <p className="text-[11px] text-blue-500">
                {selectedDate.dayName}
              </p>
            </div>

            {showDatePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDatePicker(false)}
                />
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateSelect}
                  onClose={() => setShowDatePicker(false)}
                />
              </>
            )}
          </div>

          <div className="flex-1 relative bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer max-w-50 h-full">
            <div onClick={() => setShowTravelerPicker(!showTravelerPicker)}>
              <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                Traveler, Class
              </span>
              <h1 className="text-base font-bold text-blue-900">
                {getTravelerDisplayText()}
              </h1>
              <p className="text-[11px] text-blue-500">
                {travelerSelection.classType}
              </p>
            </div>

            {showTravelerPicker && (
              <TravelerClassPicker
                selectedTravelers={travelerSelection}
                onTravelerChange={handleTravelerChange}
                onClose={() => setShowTravelerPicker(false)}
              />
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-8 rounded-xl shadow-lg transition-colors disabled:opacity-50 h-full flex items-center justify-center min-w-30"
          >
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </div>
      </div>

      {/* Show skeleton when loading and no flights yet */}
      {(loading || (flights.length === 0 && !searchError && !loading)) &&
        displayFlights.length === 0 && (
          <div className="flex items-start gap-2 px-5 mt-5">
            <div className="w-1/3">
              <FlightFilters
                filters={filters}
                setFilters={setFilters}
                filterOptions={filterOptions}
                airlines={airlinesList}
                selectedAirlines={selectedAirlines}
                setSelectedAirlines={setSelectedAirlines}
                journeyType={searchParams.JourneyType}
                filterLoading={true}
                applyFilters={applyFilters}
              />
            </div>
            <div className="w-2/3">
              <FlightResults flights={[]} loading={true} error={null} />
            </div>
          </div>
        )}

      {/* Flight Results */}
      {displayFlights.length > 0 && !searchError && (
        <div className="flex items-start gap-2 px-5 mt-5">
          {/* Filter List */}
          <div className="w-1/3">
            <FlightFilters
              filters={filters}
              setFilters={setFilters}
              filterOptions={filterOptions}
              airlines={airlinesList}
              selectedAirlines={selectedAirlines}
              setSelectedAirlines={setSelectedAirlines}
              journeyType={searchParams.JourneyType}
              filterLoading={filterLoading}
              applyFilters={applyFilters}
            />
          </div>

          {/* Flight Results */}
          <div className="w-2/3">
            <FlightResults
              flights={displayFlights}
              loading={loading}
              error={searchError}
              onRetry={handleSearch}
            />
          </div>
        </div>
      )}

      {/* Show error state when there's an error */}
      {searchError && !loading && (
        <div className="flex items-start gap-2 px-5 mt-5">
          <div className="w-1/3">
            <FlightFilters
              filters={filters}
              setFilters={setFilters}
              filterOptions={filterOptions}
              airlines={airlinesList}
              selectedAirlines={selectedAirlines}
              setSelectedAirlines={setSelectedAirlines}
              journeyType={searchParams.JourneyType}
              filterLoading={false}
              applyFilters={applyFilters}
            />
          </div>
          <div className="w-2/3">
            <FlightResults
              flights={[]}
              loading={false}
              error={searchError}
              onRetry={handleSearch}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
