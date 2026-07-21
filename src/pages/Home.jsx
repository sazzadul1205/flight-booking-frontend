// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

// API
import { getCities } from "../api/flight";

// Icons
import { FaArrowRight } from "react-icons/fa";

// Components
import DatePicker from "../components/DatePicker";
import TravelerClassPicker from "../components/TravelerClassPicker";

// Helper function to extract city name from SearchString
const extractCityName = (searchString) => {
  if (!searchString) return "";
  const parts = searchString.split(",");
  return parts.length > 1 ? parts[parts.length - 2].trim() : searchString;
};

// Format date helper - moved to top before being used
const formatDateToYYYYMMDD = (day, month, year) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    JourneyType: 1,
    Origin: "DAC",
    Destination: "CXB",
    DepartureDate: "",
    ReturnDate: "",
    ClassType: "Economy",
    NoofAdult: 1,
    NoofChildren: 0,
    NoofInfant: 0,
    Flex: null,
  });
  const [displayOrigin, setDisplayOrigin] = useState(
    "Hazrat Shahjalal International Airport,Dhaka,Bangladesh",
  );
  const [displayDestination, setDisplayDestination] = useState(
    "CXB, Coxs Bazar Airport,Coxs Bazar,Bangladesh",
  );
  const [selectedDate, setSelectedDate] = useState({
    full: "19 Jul'26",
    dayName: "Wednesday",
    day: 19,
    month: 6,
    year: 2026,
  });
  const [travelerSelection, setTravelerSelection] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    classType: "Economy",
  });

  // Traveler Selection
  const [searchInput, setSearchInput] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [cityLoading, setCityLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTravelerPicker, setShowTravelerPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Refs
  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  const navigate = useNavigate();

  const sortCitiesByRelevance = (cities, query) => {
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
  };

  const performCitySearch = useCallback(async (query) => {
    if (query.length <= 1) {
      setCitySuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCityLoading(true);
    try {
      const data = await getCities(query, controller.signal);

      // Sort results by relevance
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
  }, []);

  // Debounced version of the search
  const debouncedCitySearch = useCallback(
    (query) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        performCitySearch(query);
      }, 300);
    },
    [performCitySearch],
  );

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

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

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

      const formattedDate = {
        full: `${day} ${monthNames[month]}'${String(year).slice(-2)}`,
        dayName: dayNames[today.getDay()],
        day: day,
        month: month,
        year: year,
      };

      const formattedDateForAPI = formatDateToYYYYMMDD(day, month, year);
      setSelectedDate(formattedDate);
      setSearchParams((prev) => ({
        ...prev,
        DepartureDate: formattedDateForAPI,
      }));
    }
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

  const formatSearchParams = () => {
    let departureDate = searchParams.DepartureDate;
    if (!departureDate && selectedDate) {
      departureDate = formatDateToYYYYMMDD(
        selectedDate.day,
        selectedDate.month,
        selectedDate.year,
      );
    }

    return {
      JourneyType: searchParams.JourneyType || 1,
      Origin: searchParams.Origin,
      Destination: searchParams.Destination,
      DepartureDate: departureDate,
      ReturnDate: searchParams.ReturnDate || "",
      ClassType: travelerSelection.classType || "Economy",
      NoofAdult: travelerSelection.adults || 1,
      NoofChildren: travelerSelection.children || 0,
      NoofInfant: travelerSelection.infants || 0,
      IsSpecialTexRedumption: false,
      IsFlexSearch: false,
      Flex: null,
      ChildrenAges: [],
    };
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

    setLoading(true);
    try {
      const formattedParams = formatSearchParams();

      const queryParams = new URLSearchParams({
        journeyType: formattedParams.JourneyType,
        origin: formattedParams.Origin,
        destination: formattedParams.Destination,
        departureDate: formattedParams.DepartureDate,
        returnDate: formattedParams.ReturnDate,
        classType: formattedParams.ClassType,
        noOfAdult: formattedParams.NoOfAdult,
        noOfChildren: formattedParams.NoOfChildren,
        noOfInfant: formattedParams.NoOfInfant,
      });

      const searchUrl = `/search?${queryParams.toString()}`;
      navigate(searchUrl);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to search flights. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const formattedDate = formatDateToYYYYMMDD(date.day, date.month, date.year);
    setSearchParams({
      ...searchParams,
      DepartureDate: formattedDate,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white max-w-5xl p-6 rounded-2xl shadow-2xl w-full mx-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center gap-2">
            <div className="relative flex-1">
              <div
                className="bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer"
                onClick={() => openDropdown("Origin")}
              >
                <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                  From
                </span>

                <h1 className="text-lg font-bold text-blue-900 truncate">
                  {extractCityName(displayOrigin)}
                </h1>

                <p
                  className="text-[11px] text-blue-600 truncate max-w-50 "
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
                className="bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer"
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
          <div className="relative flex-1 max-w-54">
            <div
              className="bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer transition-all"
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

          <div className="flex-1 relative bg-white hover:bg-blue-50/90 rounded-xl p-3 shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 cursor-pointer max-w-54">
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
        </div>

        {searchError && (
          <div className="mt-4 text-red-500 text-sm text-center">
            {searchError}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
