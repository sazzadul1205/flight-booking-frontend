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
  const [flights, setFlights] = useState([]); // ALL flights from search
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Store IGXKey for caching
  const [igxKey, setIgxKey] = useState(null);

  // Pagination states - THIS IS WHAT SHOWS ON SCREEN
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayFlights, setDisplayFlights] = useState([]); // Only the current page

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

  // Debounce timer for real-time filtering
  const filterDebounceTimer = useRef(null);

  // Track previous filters to avoid unnecessary calls
  const previousFiltersRef = useRef(filters);
  const isFirstFilterRun = useRef(true);

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

  // Check if any filters are applied
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some((val) => {
      if (Array.isArray(val)) return val.length > 0;
      return val !== "" && val !== null && val !== undefined;
    });
  }, [filters]);

  // Apply filters function with pagination - UPDATED to use setDisplayFlights
  const applyFilters = useCallback(
    async (page = 1, append = false) => {
      // If no IGXKey or no flights, skip
      if (!igxKey || flights.length === 0) {
        setDisplayFlights(flights);
        return;
      }

      // If no filters are selected, use the raw flights with pagination
      if (!hasActiveFilters()) {
        console.log("No filters selected, paginating all flights");
        const startIndex = (page - 1) * 20;
        const endIndex = Math.min(startIndex + 20, flights.length);
        const pageData = flights.slice(startIndex, endIndex);

        if (append) {
          setDisplayFlights((prev) => [...prev, ...pageData]);
        } else {
          setDisplayFlights(pageData);
        }

        setPagination({
          page: page,
          limit: 20,
          total: flights.length,
          totalPages: Math.ceil(flights.length / 20),
          hasMore: endIndex < flights.length,
        });
        setSearchError("");
        return;
      }

      // If loading more, set the flag
      if (page > 1) {
        setIsLoadingMore(true);
      }

      setFilterLoading(true);
      setSearchError("");

      try {
        // Build filter data
        const filterData = {};

        // Price range
        if (filters.min_price && filters.min_price !== "") {
          filterData.min_price = parseFloat(filters.min_price);
        }
        if (filters.max_price && filters.max_price !== "") {
          filterData.max_price = parseFloat(filters.max_price);
        }

        // Arrays with values
        const filterKeys = [
          "fare_type",
          "airlines",
          "airline_code",
          "aircraft",
          "baggage",
          "onward_flight_stops",
          "return_flight_stops",
          "onward_depart_time",
          "onward_arrival_time",
          "onward_flying_time",
          "onward_transit_hour",
          "return_depart_time",
          "return_arrival_time",
          "return_flying_time",
          "return_transit_hour",
          "onward_layover_airport",
          "onward_destination_airport",
          "return_layover_airport",
          "return_destination_airport",
        ];

        filterKeys.forEach((key) => {
          if (filters[key] && filters[key].length > 0) {
            filterData[key] = extractFilterValues(filters[key]);
          }
        });

        console.log("Sending filter request with IGXKey:", igxKey);
        console.log("Page:", page, "Append:", append);

        // Use the new filter API with IGXKey and pagination
        const response = await filterFlights(igxKey, filterData, page, 20);
        console.log("Filter response:", response);

        const filtered = response.data || [];
        console.log("Filtered flights count:", filtered.length);

        // Handle paginated response
        if (append) {
          setDisplayFlights((prev) => [...prev, ...filtered]);
        } else {
          setDisplayFlights(filtered);
        }

        setPagination(
          response.pagination || {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / 20),
            hasMore: false,
          },
        );

        if (filtered.length === 0 && page === 1) {
          setSearchError("No flights match your filter criteria");
        } else {
          setSearchError("");
        }
      } catch (error) {
        console.error("Real-time filter error:", error);

        // Handle cache expired error
        if (
          error.response?.status === 410 ||
          error.response?.data?.code === "CACHE_EXPIRED"
        ) {
          setSearchError("Flight data expired. Please search again.");
          setIgxKey(null);
        } else {
          setSearchError(
            error.response?.data?.message ||
              "Failed to apply filters. Please try again.",
          );
        }
      } finally {
        setFilterLoading(false);
        setIsLoadingMore(false);
      }
    },
    [igxKey, flights, hasActiveFilters, filters, extractFilterValues],
  );

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    console.log("🔍 loadMore called:", {
      hasMore: pagination.hasMore,
      isLoadingMore,
      filterLoading,
      currentPage: pagination.page,
    });

    if (!pagination.hasMore || isLoadingMore || filterLoading) {
      console.log("⛔ Skipping loadMore - conditions not met");
      return;
    }

    const nextPage = pagination.page + 1;
    console.log("📄 Loading page:", nextPage);
    applyFilters(nextPage, true);
  }, [pagination, isLoadingMore, filterLoading, applyFilters]);

  // Auto-trigger filter when filters change (REAL-TIME)
  useEffect(() => {
    // Skip on initial mount or if no IGXKey/flights
    if (!igxKey || flights.length === 0) {
      return;
    }

    // Skip the first run after search (filters are reset, so no need to filter)
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      previousFiltersRef.current = filters;
      return;
    }

    // Check if filters actually changed (deep compare for arrays)
    const filtersChanged =
      JSON.stringify(previousFiltersRef.current) !== JSON.stringify(filters);
    if (!filtersChanged) {
      return;
    }

    // Update previous filters ref
    previousFiltersRef.current = filters;

    // Reset pagination when filters change
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasMore: false,
    });
    setDisplayFlights([]);

    // Clear any pending debounce
    if (filterDebounceTimer.current) {
      clearTimeout(filterDebounceTimer.current);
      filterDebounceTimer.current = null;
    }

    // Debounce the filter call
    filterDebounceTimer.current = setTimeout(() => {
      applyFilters(1, false);
    }, 300);

    // Cleanup debounce on unmount or before next effect
    return () => {
      if (filterDebounceTimer.current) {
        clearTimeout(filterDebounceTimer.current);
        filterDebounceTimer.current = null;
      }
    };
  }, [filters, igxKey, flights.length, applyFilters]);

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
    setDisplayFlights([]);
    setSearchError("");
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasMore: false,
    });
    // Reset the first-run flag so future filter changes will trigger
    isFirstFilterRun.current = true;
    previousFiltersRef.current = {
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
    };
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
      // Reset everything for new search
      setFlights([]);
      setDisplayFlights([]);
      setFilterOptions({});
      setIgxKey(null);
      setLoading(true);
      setSearchError("");
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      });

      // Reset filter tracking refs
      isFirstFilterRun.current = true;
      previousFiltersRef.current = filters;

      // Clear any pending filter debounce
      if (filterDebounceTimer.current) {
        clearTimeout(filterDebounceTimer.current);
        filterDebounceTimer.current = null;
      }

      try {
        const data = await searchFlights(formattedParams);
        const results = data.data || [];
        setFlights(results);

        // Store IGXKey for future filter operations
        if (data.igxKey) {
          console.log("IGXKey received:", data.igxKey);
          setIgxKey(data.igxKey);
        }

        // Store filter options from API response
        if (data.filter) {
          setFilterOptions(data.filter);
        }

        resetFilters();

        // After resetting filters, load the first page
        if (results.length > 0) {
          // Show first page (20 items)
          const firstPage = results.slice(0, 20);
          setDisplayFlights(firstPage);
          setPagination({
            page: 1,
            limit: 20,
            total: results.length,
            totalPages: Math.ceil(results.length / 20),
            hasMore: results.length > 20,
          });
        }

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
        setIgxKey(null);
      } finally {
        setLoading(false);
      }
    },
    [filters, resetFilters],
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
      if (filterDebounceTimer.current) {
        clearTimeout(filterDebounceTimer.current);
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

  // Check if we should show loading state
  const showLoading =
    loading || (flights.length === 0 && !searchError && !loading);
  const showResults = displayFlights.length > 0 && !searchError;
  const showError = searchError && !loading;

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

      {/* Show infinite loader/skeleton when loading */}
      {showLoading && (
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
            />
          </div>
          <div className="w-2/3">
            <FlightResults
              flights={[]}
              loading={true}
              error={null}
              infiniteLoading={true}
            />
          </div>
        </div>
      )}

      {/* Flight Results */}
      {showResults && (
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
            />
          </div>

          {/* Flight Results with Infinite Scroll */}
          <div className="w-2/3">
            <FlightResults
              flights={displayFlights}
              loading={loading}
              error={searchError}
              onRetry={handleSearch}
              hasMore={pagination.hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
            />
          </div>
        </div>
      )}

      {/* Show error state when there's an error */}
      {showError && (
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
