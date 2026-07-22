import { useState } from "react";
import {
  FaTimes,
  FaFilter,
  FaDollarSign,
  FaTag,
  FaPlane,
  FaSuitcase,
  FaClock,
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaChair,
  FaBuilding,
  FaGlobe,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaStopwatch,
  FaHiking,
  FaCheck,
  FaMinus,
  FaPlus,
  FaRedo,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";

const FlightFilters = ({
  filters,
  setFilters,
  filterOptions,
  airlines = [],
  selectedAirlines = [],
  setSelectedAirlines,
  journeyType,
  filterLoading,
  applyFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    fareType: true,
    airlines: true,
    aircraft: true,
    baggage: true,
    onwardStops: true,
    onwardDeparture: true,
    onwardArrival: true,
    onwardFlying: true,
    onwardTransit: true,
    onwardLayover: true,
    onwardDestination: true,
    returnStops: false,
    returnDeparture: false,
    returnArrival: false,
    returnFlying: false,
    returnTransit: false,
    returnLayover: false,
    returnDestination: false,
  });

  console.log("filters", filters);

  // Helper to toggle array values
  const toggleArrayValue = (array, value) => {
    return array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value];
  };

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle time range
  const toggleTimeRange = (filterKey, time) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: toggleArrayValue(prev[filterKey], time),
    }));
  };

  // Toggle stop
  const toggleStop = (filterKey, stop) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: toggleArrayValue(prev[filterKey], stop),
    }));
  };

  // Toggle fare type
  const toggleFareType = (type) => {
    setFilters((prev) => ({
      ...prev,
      fare_type: toggleArrayValue(prev.fare_type, type),
    }));
  };

  // Toggle airline selection
  const toggleAirline = (airline) => {
    const isSelected = selectedAirlines.some((a) => a.ID === airline.ID);

    if (isSelected) {
      setSelectedAirlines(selectedAirlines.filter((a) => a.ID !== airline.ID));
      setFilters((prev) => ({
        ...prev,
        airlines: prev.airlines.filter((name) => name !== airline.AriLineName),
        airline_code: prev.airline_code.filter((code) => code !== airline.Code),
      }));
    } else {
      setSelectedAirlines([...selectedAirlines, airline]);
      setFilters((prev) => ({
        ...prev,
        airlines: [...prev.airlines, airline.AriLineName],
        airline_code: [],
      }));
    }
  };

  // Check if airline is selected
  const isAirlineSelected = (airline) => {
    return selectedAirlines.some((a) => a.ID === airline.ID);
  };

  // Clear all airlines
  const clearAllAirlines = () => {
    setSelectedAirlines([]);
    setFilters((prev) => ({
      ...prev,
      airlines: [],
      airline_code: [],
    }));
  };

  // Check if section has any selected filters
  const hasSelectedFilters = (section) => {
    const sectionMap = {
      price: filters.min_price !== "" || filters.max_price !== "",
      fareType: filters.fare_type?.length > 0,
      airlines: filters.airlines?.length > 0,
      aircraft: filters.aircraft?.length > 0,
      baggage: filters.baggage?.length > 0,
      onwardStops: filters.onward_flight_stops?.length > 0,
      onwardDeparture: filters.onward_depart_time?.length > 0,
      onwardArrival: filters.onward_arrival_time?.length > 0,
      onwardFlying: filters.onward_flying_time?.length > 0,
      onwardTransit: filters.onward_transit_hour?.length > 0,
      onwardLayover: filters.onward_layover_airport?.length > 0,
      onwardDestination: filters.onward_destination_airport?.length > 0,
      returnStops: filters.return_flight_stops?.length > 0,
      returnDeparture: filters.return_depart_time?.length > 0,
      returnArrival: filters.return_arrival_time?.length > 0,
      returnFlying: filters.return_flying_time?.length > 0,
      returnTransit: filters.return_transit_hour?.length > 0,
      returnLayover: filters.return_layover_airport?.length > 0,
      returnDestination: filters.return_destination_airport?.length > 0,
    };
    return sectionMap[section] || false;
  };

  // Get filter count
  const getFilterCount = () => {
    let count = 0;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    if (filters.fare_type?.length > 0) count += filters.fare_type.length;
    if (filters.airlines?.length > 0) count += filters.airlines.length;
    if (filters.aircraft?.length > 0) count += filters.aircraft.length;
    if (filters.baggage?.length > 0) count += filters.baggage.length;
    if (filters.onward_flight_stops?.length > 0)
      count += filters.onward_flight_stops.length;
    if (filters.onward_depart_time?.length > 0)
      count += filters.onward_depart_time.length;
    if (filters.onward_arrival_time?.length > 0)
      count += filters.onward_arrival_time.length;
    if (filters.onward_flying_time?.length > 0)
      count += filters.onward_flying_time.length;
    if (filters.onward_transit_hour?.length > 0)
      count += filters.onward_transit_hour.length;
    if (filters.onward_layover_airport?.length > 0)
      count += filters.onward_layover_airport.length;
    if (filters.onward_destination_airport?.length > 0)
      count += filters.onward_destination_airport.length;
    if (filters.return_flight_stops?.length > 0)
      count += filters.return_flight_stops.length;
    if (filters.return_depart_time?.length > 0)
      count += filters.return_depart_time.length;
    if (filters.return_arrival_time?.length > 0)
      count += filters.return_arrival_time.length;
    if (filters.return_flying_time?.length > 0)
      count += filters.return_flying_time.length;
    if (filters.return_transit_hour?.length > 0)
      count += filters.return_transit_hour.length;
    if (filters.return_layover_airport?.length > 0)
      count += filters.return_layover_airport.length;
    if (filters.return_destination_airport?.length > 0)
      count += filters.return_destination_airport.length;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
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
  };

  // Section render helper with icon
  const renderSection = (
    title,
    sectionKey,
    icon,
    children,
    showBorder = true,
  ) => {
    const hasFilters = hasSelectedFilters(sectionKey);
    const sectionFilters = filters[sectionKey];
    const filterCount = Array.isArray(sectionFilters)
      ? sectionFilters.length
      : hasFilters
        ? 1
        : 0;

    return (
      <div
        className={`${showBorder ? "border-b border-gray-100" : ""} pb-4 mb-4 transition-all hover:bg-gray-50/50 rounded-lg px-2 -mx-2`}
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left group"
        >
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-blue-500 group-hover:text-blue-600 transition-colors">
              {icon}
            </span>
            {title}
            {hasFilters && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {filterCount}
              </span>
            )}
          </span>
          <span className="text-gray-400 group-hover:text-gray-600 transition-all transform group-hover:scale-110">
            {expandedSections[sectionKey] ? (
              <FaMinus className="w-3 h-3" />
            ) : (
              <FaPlus className="w-3 h-3" />
            )}
          </span>
        </button>
        {expandedSections[sectionKey] && (
          <div className="mt-3 animate-fadeIn">{children}</div>
        )}
      </div>
    );
  };

  // Skeleton loader for sections
  const renderSkeletonSection = () => (
    <div className="border-b border-gray-100 pb-4 mb-4 px-2 -mx-2 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="w-3 h-3 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-14"></div>
        </div>
      </div>
    </div>
  );

  // Check if filter options are loading (no data yet)
  const isLoading = !filterOptions || Object.keys(filterOptions).length === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl bg-linear-to-r from-blue-50 to-white">
        <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <FaFilter className="w-4 h-4" />
          </div>
          Filters
          {!isLoading && getFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
              {getFilterCount()}
            </span>
          )}
        </h1>
        <button
          onClick={clearAllFilters}
          disabled={filterLoading || isLoading}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg"
        >
          <FaTimes className="text-xs" />
          Clear All
        </button>
      </div>

      {/* Filter Content */}
      <div className="p-5 space-y-1">
        {isLoading ? (
          // Show skeleton loaders
          <>
            {renderSkeletonSection()}
            {renderSkeletonSection()}
            {renderSkeletonSection()}
            {renderSkeletonSection()}
            <div className="mt-4">
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            {renderSection(
              "Price Range",
              "price",
              <FaDollarSign className="w-4 h-4" />,
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 items-center gap-1">
                    <span className="text-blue-500">$</span> Min Price
                    {filterOptions?.min_price && (
                      <span className="text-gray-400 text-xs font-normal ml-1">
                        (Min: {filterOptions.min_price})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder={filterOptions?.min_price?.toString() || "Min"}
                    value={filters.min_price || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, min_price: e.target.value })
                    }
                    disabled={filterLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all hover:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 items-center gap-1">
                    <span className="text-blue-500">$</span> Max Price
                    {filterOptions?.max_price && (
                      <span className="text-gray-400 text-xs font-normal ml-1">
                        (Max: {filterOptions.max_price})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder={filterOptions?.max_price?.toString() || "Max"}
                    value={filters.max_price || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, max_price: e.target.value })
                    }
                    disabled={filterLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all hover:border-blue-300"
                  />
                </div>
              </div>,
              false,
            )}
            {/* Fare Type */}
            {(filterOptions?.fare_type || []).length > 0 &&
              renderSection(
                "Fare Type",
                "fareType",
                <FaTag className="w-4 h-4" />,
                <div className="flex flex-wrap gap-2">
                  {filterOptions.fare_type.map((type) => (
                    <button
                      key={type}
                      onClick={() => !filterLoading && toggleFareType(type)}
                      disabled={filterLoading}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        filters.fare_type.includes(type)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.fare_type.includes(type) && (
                        <FaCheck className="w-3 h-3" />
                      )}
                      {type}
                    </button>
                  ))}
                </div>,
              )}
            {/* Airlines */}
            {(airlines || []).length > 0 &&
              renderSection(
                "Airlines",
                "airlines",
                <FaPlane className="w-4 h-4" />,
                <div>
                  {selectedAirlines.length > 0 && (
                    <button
                      onClick={clearAllAirlines}
                      disabled={filterLoading}
                      className="text-xs text-blue-600 hover:text-blue-800 mb-2 block disabled:opacity-50 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
                    >
                      <FaTimes className="inline mr-1 text-xs" />
                      Clear selected ({selectedAirlines.length})
                    </button>
                  )}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {airlines.map((airline) => (
                      <label
                        key={airline.ID}
                        className={`flex items-center gap-2 cursor-pointer hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-all ${
                          isAirlineSelected(airline)
                            ? "bg-blue-50 border border-blue-200"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAirlineSelected(airline)}
                          onChange={() => toggleAirline(airline)}
                          disabled={filterLoading}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="font-medium text-blue-600">
                            {airline.Code}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {airline.AriLineName}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>,
              )}
            {/* Aircraft */}
            {(filterOptions?.aircraft || []).length > 0 &&
              renderSection(
                "Aircraft",
                "aircraft",
                <FaChair className="w-4 h-4" />,
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {filterOptions.aircraft.map((aircraft) => (
                    <button
                      key={aircraft}
                      onClick={() =>
                        !filterLoading &&
                        setFilters((prev) => ({
                          ...prev,
                          aircraft: toggleArrayValue(prev.aircraft, aircraft),
                        }))
                      }
                      disabled={filterLoading}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                        filters.aircraft.includes(aircraft)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.aircraft.includes(aircraft) && (
                        <FaCheck className="inline mr-1 w-2.5 h-2.5" />
                      )}
                      {aircraft}
                    </button>
                  ))}
                </div>,
              )}
            {/* Baggage */}
            {(filterOptions?.baggage || []).length > 0 &&
              renderSection(
                "Baggage",
                "baggage",
                <FaSuitcase className="w-4 h-4" />,
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {filterOptions.baggage.map((baggage) => (
                    <button
                      key={baggage}
                      onClick={() =>
                        !filterLoading &&
                        setFilters((prev) => ({
                          ...prev,
                          baggage: toggleArrayValue(prev.baggage, baggage),
                        }))
                      }
                      disabled={filterLoading}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                        filters.baggage.includes(baggage)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={baggage}
                    >
                      {filters.baggage.includes(baggage) && (
                        <FaCheck className="inline mr-1 w-2.5 h-2.5" />
                      )}
                      {baggage.length > 20
                        ? baggage.substring(0, 20) + "..."
                        : baggage}
                    </button>
                  ))}
                </div>,
              )}
            {/* Onward Stops */}
            {(filterOptions?.onward_flight_stops || []).length > 0 &&
              renderSection(
                "Onward Stops",
                "onwardStops",
                <FaExchangeAlt className="w-4 h-4" />,
                <div className="flex flex-wrap gap-2">
                  {filterOptions.onward_flight_stops.map((stops) => (
                    <button
                      key={stops}
                      onClick={() =>
                        !filterLoading &&
                        toggleStop("onward_flight_stops", stops)
                      }
                      disabled={filterLoading}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.onward_flight_stops.includes(stops)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_flight_stops.includes(stops) && (
                        <FaCheck className="inline mr-1 w-3 h-3" />
                      )}
                      {stops === 0
                        ? "✈️ Non-stop"
                        : `${stops} stop${stops > 1 ? "s" : ""}`}
                    </button>
                  ))}
                </div>,
              )}
            {/* Onward Departure Time */}
            {(filterOptions?.onward_depart_time || []).length > 0 &&
              renderSection(
                "Onward Departure",
                "onwardDeparture",
                <FaPlaneDeparture className="w-4 h-4" />,
                <div className="flex flex-wrap gap-2">
                  {filterOptions.onward_depart_time.map((time) => (
                    <button
                      key={time.name}
                      onClick={() =>
                        !filterLoading &&
                        toggleTimeRange("onward_depart_time", time)
                      }
                      disabled={filterLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.onward_depart_time.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_depart_time.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                      <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                      {time.name}
                    </button>
                  ))}
                </div>,
              )}
            {/* Onward Arrival Time */}
            {(filterOptions?.onward_arrival_time || []).length > 0 &&
              renderSection(
                "Onward Arrival",
                "onwardArrival",
                <FaPlaneArrival className="w-4 h-4" />,
                <div className="flex flex-wrap gap-2">
                  {filterOptions.onward_arrival_time.map((time) => (
                    <button
                      key={time.name}
                      onClick={() =>
                        !filterLoading &&
                        toggleTimeRange("onward_arrival_time", time)
                      }
                      disabled={filterLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.onward_arrival_time.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_arrival_time.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                      <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                      {time.name}
                    </button>
                  ))}
                </div>,
              )}
            {/* Onward Flying Time */}
            {(filterOptions?.onward_flying_time || []).length > 0 &&
              renderSection(
                "Onward Flying Time",
                "onwardFlying",
                <FaStopwatch className="w-4 h-4" />,
                <div className="flex flex-wrap gap-2">
                  {filterOptions.onward_flying_time.map((time) => (
                    <button
                      key={time.name}
                      onClick={() =>
                        !filterLoading &&
                        toggleTimeRange("onward_flying_time", time)
                      }
                      disabled={filterLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.onward_flying_time.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_flying_time.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                      <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                      {time.name}
                    </button>
                  ))}
                </div>,
              )}
            {/* Onward Transit Time */}
            {(filterOptions?.onward_transit_hour || []).length > 0 &&
              renderSection(
                "Onward Transit Time",
                "onwardTransit",
                <FaHiking className="w-4 h-4" />,
                <div className="flex flex-wrap gap-2">
                  {filterOptions.onward_transit_hour.map((time) => (
                    <button
                      key={time.name}
                      onClick={() =>
                        !filterLoading &&
                        toggleTimeRange("onward_transit_hour", time)
                      }
                      disabled={filterLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.onward_transit_hour.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_transit_hour.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                      <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                      {time.name}
                    </button>
                  ))}
                </div>,
              )}
            {/* Onward Layover Airports */}
            {(filterOptions?.onward_layover_airport || []).length > 0 &&
              renderSection(
                "Onward Layover Airports",
                "onwardLayover",
                <FaMapMarkerAlt className="w-4 h-4" />,
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {filterOptions.onward_layover_airport.map((airport) => (
                    <button
                      key={airport}
                      onClick={() =>
                        !filterLoading &&
                        setFilters((prev) => ({
                          ...prev,
                          onward_layover_airport: toggleArrayValue(
                            prev.onward_layover_airport,
                            airport,
                          ),
                        }))
                      }
                      disabled={filterLoading}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                        filters.onward_layover_airport.includes(airport)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_layover_airport.includes(airport) && (
                        <FaCheck className="inline mr-1 w-2.5 h-2.5" />
                      )}
                      <FaBuilding className="inline mr-1 w-2.5 h-2.5 opacity-70" />
                      {airport}
                    </button>
                  ))}
                </div>,
              )}
            {/* Onward Destination Airports */}
            {(filterOptions?.onward_destination_airport || []).length > 0 &&
              renderSection(
                "Onward Destination Airports",
                "onwardDestination",
                <FaGlobe className="w-4 h-4" />,
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {filterOptions.onward_destination_airport.map((airport) => (
                    <button
                      key={airport}
                      onClick={() =>
                        !filterLoading &&
                        setFilters((prev) => ({
                          ...prev,
                          onward_destination_airport: toggleArrayValue(
                            prev.onward_destination_airport,
                            airport,
                          ),
                        }))
                      }
                      disabled={filterLoading}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                        filters.onward_destination_airport.includes(airport)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_destination_airport.includes(airport) && (
                        <FaCheck className="inline mr-1 w-2.5 h-2.5" />
                      )}
                      <FaMapMarkerAlt className="inline mr-1 w-2.5 h-2.5 opacity-70" />
                      {airport}
                    </button>
                  ))}
                </div>,
              )}
            {/* Return Filters - Only for Round Trip */}
            {journeyType === 2 && (
              <>
                <div className="border-t-2 border-blue-100 pt-2 mt-2 mb-3">
                  <h4 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded-lg">
                      <FaRedo className="w-3.5 h-3.5" />
                    </div>
                    <span>Return Filters</span>
                    <span className="flex-1 h-px bg-linear-to-r from-blue-200 to-transparent"></span>
                  </h4>
                </div>

                {/* Return Stops */}
                {(filterOptions?.return_flight_stops || []).length > 0 &&
                  renderSection(
                    "Return Stops",
                    "returnStops",
                    <FaExchangeAlt className="w-4 h-4" />,
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.return_flight_stops.map((stops) => (
                        <button
                          key={stops}
                          onClick={() =>
                            !filterLoading &&
                            toggleStop("return_flight_stops", stops)
                          }
                          disabled={filterLoading}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            filters.return_flight_stops.includes(stops)
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_flight_stops.includes(stops) && (
                            <FaCheck className="inline mr-1 w-3 h-3" />
                          )}
                          {stops === 0
                            ? "✈️ Non-stop"
                            : `${stops} stop${stops > 1 ? "s" : ""}`}
                        </button>
                      ))}
                    </div>,
                  )}

                {/* Return Departure Time */}
                {(filterOptions?.return_depart_time || []).length > 0 &&
                  renderSection(
                    "Return Departure",
                    "returnDeparture",
                    <FaPlaneDeparture className="w-4 h-4" />,
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.return_depart_time.map((time) => (
                        <button
                          key={time.name}
                          onClick={() =>
                            !filterLoading &&
                            toggleTimeRange("return_depart_time", time)
                          }
                          disabled={filterLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            filters.return_depart_time.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_depart_time.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                          <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                          {time.name}
                        </button>
                      ))}
                    </div>,
                  )}

                {/* Return Arrival Time */}
                {(filterOptions?.return_arrival_time || []).length > 0 &&
                  renderSection(
                    "Return Arrival",
                    "returnArrival",
                    <FaPlaneArrival className="w-4 h-4" />,
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.return_arrival_time.map((time) => (
                        <button
                          key={time.name}
                          onClick={() =>
                            !filterLoading &&
                            toggleTimeRange("return_arrival_time", time)
                          }
                          disabled={filterLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            filters.return_arrival_time.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_arrival_time.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                          <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                          {time.name}
                        </button>
                      ))}
                    </div>,
                  )}

                {/* Return Flying Time */}
                {(filterOptions?.return_flying_time || []).length > 0 &&
                  renderSection(
                    "Return Flying Time",
                    "returnFlying",
                    <FaStopwatch className="w-4 h-4" />,
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.return_flying_time.map((time) => (
                        <button
                          key={time.name}
                          onClick={() =>
                            !filterLoading &&
                            toggleTimeRange("return_flying_time", time)
                          }
                          disabled={filterLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            filters.return_flying_time.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_flying_time.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                          <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                          {time.name}
                        </button>
                      ))}
                    </div>,
                  )}

                {/* Return Transit Time */}
                {(filterOptions?.return_transit_hour || []).length > 0 &&
                  renderSection(
                    "Return Transit Time",
                    "returnTransit",
                    <FaHiking className="w-4 h-4" />,
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.return_transit_hour.map((time) => (
                        <button
                          key={time.name}
                          onClick={() =>
                            !filterLoading &&
                            toggleTimeRange("return_transit_hour", time)
                          }
                          disabled={filterLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            filters.return_transit_hour.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_transit_hour.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1 w-3 h-3" />}
                          <FaClock className="inline mr-1 w-3 h-3 opacity-70" />
                          {time.name}
                        </button>
                      ))}
                    </div>,
                  )}

                {/* Return Layover Airports */}
                {(filterOptions?.return_layover_airport || []).length > 0 &&
                  renderSection(
                    "Return Layover Airports",
                    "returnLayover",
                    <FaMapMarkerAlt className="w-4 h-4" />,
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {filterOptions.return_layover_airport.map((airport) => (
                        <button
                          key={airport}
                          onClick={() =>
                            !filterLoading &&
                            setFilters((prev) => ({
                              ...prev,
                              return_layover_airport: toggleArrayValue(
                                prev.return_layover_airport,
                                airport,
                              ),
                            }))
                          }
                          disabled={filterLoading}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                            filters.return_layover_airport.includes(airport)
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_layover_airport.includes(airport) && (
                            <FaCheck className="inline mr-1 w-2.5 h-2.5" />
                          )}
                          <FaBuilding className="inline mr-1 w-2.5 h-2.5 opacity-70" />
                          {airport}
                        </button>
                      ))}
                    </div>,
                  )}

                {/* Return Destination Airports */}
                {(filterOptions?.return_destination_airport || []).length > 0 &&
                  renderSection(
                    "Return Destination Airports",
                    "returnDestination",
                    <FaGlobe className="w-4 h-4" />,
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {filterOptions.return_destination_airport.map(
                        (airport) => (
                          <button
                            key={airport}
                            onClick={() =>
                              !filterLoading &&
                              setFilters((prev) => ({
                                ...prev,
                                return_destination_airport: toggleArrayValue(
                                  prev.return_destination_airport,
                                  airport,
                                ),
                              }))
                            }
                            disabled={filterLoading}
                            className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                              filters.return_destination_airport.includes(
                                airport,
                              )
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                            } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {filters.return_destination_airport.includes(
                              airport,
                            ) && (
                              <FaCheck className="inline mr-1 w-2.5 h-2.5" />
                            )}
                            <FaMapMarkerAlt className="inline mr-1 w-2.5 h-2.5 opacity-70" />
                            {airport}
                          </button>
                        ),
                      )}
                    </div>,
                  )}
              </>
            )}
          </>
        )}

        {/* Apply Filters Button */}
        <button
          onClick={applyFilters}
          disabled={filterLoading || isLoading}
          className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 mt-4"
        >
          {filterLoading ? (
            <>
              <FaSpinner className="animate-spin w-5 h-5" />
              <span>Applying Filters...</span>
            </>
          ) : isLoading ? (
            <>
              <FaSpinner className="animate-spin w-5 h-5" />
              <span>Loading Filters...</span>
            </>
          ) : (
            <>
              <FaSearch className="w-4 h-4" />
              <span>Apply Filters</span>
              {getFilterCount() > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {getFilterCount()}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FlightFilters;
