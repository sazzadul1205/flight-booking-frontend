// FlightFilters.jsx
import { useState } from "react";
import {
  FaTimes,
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
  FaSlidersH,
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
        className={`${showBorder ? "border-b border-blue-100/60" : ""} pb-4 mb-4 transition-all hover:bg-linear-to-r hover:from-blue-50/50 hover:to-indigo-50/30 rounded-xl px-3 -mx-3`}
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left group"
        >
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
            <span className="text-indigo-500 group-hover:text-indigo-600 transition-colors text-base">
              {icon}
            </span>
            {title}
            {hasFilters && (
              <span className="bg-linear-to-r from-blue-500 to-indigo-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-semibold shadow-sm shadow-blue-200">
                {filterCount}
              </span>
            )}
          </span>
          <span className="text-gray-400 group-hover:text-indigo-500 transition-all transform group-hover:scale-110">
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
    <div className="border-b border-blue-100/60 pb-4 mb-4 px-3 -mx-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-linear-to-r from-blue-200 to-indigo-200 rounded"></div>
          <div className="h-4 bg-linear-to-r from-blue-200 to-indigo-200 rounded w-24"></div>
        </div>
        <div className="w-3 h-3 bg-linear-to-r from-blue-200 to-indigo-200 rounded"></div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <div className="h-8 bg-linear-to-r from-blue-100 to-indigo-100 rounded-lg w-16"></div>
          <div className="h-8 bg-linear-to-r from-blue-100 to-indigo-100 rounded-lg w-20"></div>
          <div className="h-8 bg-linear-to-r from-blue-100 to-indigo-100 rounded-lg w-14"></div>
        </div>
      </div>
    </div>
  );

  // Check if filter options are loading (no data yet)
  const isLoading = !filterOptions || Object.keys(filterOptions).length === 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100/50 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-blue-100/60 sticky top-0 bg-white z-10 rounded-t-2xl bg-linear-to-r from-blue-50/80 via-white to-indigo-50/50">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2.5">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-md shadow-blue-200">
            <FaSlidersH className="w-4 h-4" />
          </div>
          Filters
          {!isLoading && getFilterCount() > 0 && (
            <span className="bg-linear-to-r from-blue-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm shadow-blue-200">
              {getFilterCount()}
            </span>
          )}
        </h1>
        <button
          onClick={clearAllFilters}
          disabled={filterLoading || isLoading}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-all flex items-center gap-1.5 disabled:opacity-50 hover:bg-indigo-50/50 px-3 py-1.5 rounded-lg"
        >
          <FaTimes className="text-xs" />
          Clear All
        </button>
      </div>

      {/* Filter Content */}
      <div className="p-5 space-y-1">
        {isLoading ? (
          <>
            {renderSkeletonSection()}
            {renderSkeletonSection()}
            {renderSkeletonSection()}
            {renderSkeletonSection()}
            <div className="mt-4">
              <div className="h-12 bg-linear-to-r from-blue-100 to-indigo-100 rounded-xl animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            {/* Price Range */}
            {renderSection(
              "Price Range",
              "price",
              <FaDollarSign className="w-4 h-4" />,
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 items-center gap-1">
                    <span className="text-indigo-500 font-bold">$</span> Min
                    Price
                    {filterOptions?.min_price && (
                      <span className="text-gray-400 text-[10px] font-normal ml-1">
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
                    className="w-full px-3 py-2.5 border-2 border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 transition-all hover:border-indigo-300 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 items-center gap-1">
                    <span className="text-indigo-500 font-bold">$</span> Max
                    Price
                    {filterOptions?.max_price && (
                      <span className="text-gray-400 text-[10px] font-normal ml-1">
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
                    className="w-full px-3 py-2.5 border-2 border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 transition-all hover:border-indigo-300 bg-gray-50/50"
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
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-200 flex items-center gap-1.5 ${
                        filters.fare_type.includes(type)
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-indigo-200 scale-105"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
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
                      className="text-xs text-indigo-600 hover:text-indigo-800 mb-2.5 block disabled:opacity-50 hover:bg-indigo-50/50 px-2.5 py-1.5 rounded-lg transition-all font-medium"
                    >
                      <FaTimes className="inline mr-1.5 text-[10px]" />
                      Clear selected ({selectedAirlines.length})
                    </button>
                  )}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {airlines.map((airline) => {
                      // Generate a consistent color for each airline
                      const colors = [
                        "from-blue-500 to-indigo-500",
                        "from-purple-500 to-pink-500",
                        "from-green-500 to-emerald-500",
                        "from-orange-500 to-red-500",
                        "from-cyan-500 to-blue-500",
                        "from-rose-500 to-pink-500",
                        "from-violet-500 to-purple-500",
                      ];
                      let hash = 0;
                      for (let i = 0; i < airline.Code.length; i++) {
                        hash =
                          airline.Code.charCodeAt(i) + ((hash << 5) - hash);
                      }
                      const color = colors[Math.abs(hash) % colors.length];

                      return (
                        <label
                          key={airline.ID}
                          className={`flex items-center gap-3 cursor-pointer hover:bg-linear-to-r hover:from-blue-50/50 hover:to-indigo-50/30 px-3 py-2 rounded-xl transition-all ${
                            isAirlineSelected(airline)
                              ? "bg-linear-to-r from-blue-50/80 to-indigo-50/60 border-2 border-indigo-200 shadow-sm"
                              : "border-2 border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAirlineSelected(airline)}
                            onChange={() => toggleAirline(airline)}
                            disabled={filterLoading}
                            className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                          />
                          <div
                            className={`w-8 h-8 rounded-full bg-linear-to-br ${color} flex items-center justify-center shadow-md`}
                          >
                            <span className="text-white text-[10px] font-bold">
                              {airline.Code.substring(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {airline.AriLineName}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto font-mono">
                            {airline.Code}
                          </span>
                        </label>
                      );
                    })}
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        filters.aircraft.includes(aircraft)
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.aircraft.includes(aircraft) && (
                        <FaCheck className="inline mr-1.5 w-2.5 h-2.5" />
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        filters.baggage.includes(baggage)
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={baggage}
                    >
                      {filters.baggage.includes(baggage) && (
                        <FaCheck className="inline mr-1.5 w-2.5 h-2.5" />
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
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        filters.onward_flight_stops.includes(stops)
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-indigo-200 scale-105"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_flight_stops.includes(stops) && (
                        <FaCheck className="inline mr-1.5 w-3 h-3" />
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        filters.onward_depart_time.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_depart_time.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                      <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        filters.onward_arrival_time.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_arrival_time.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                      <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        filters.onward_flying_time.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_flying_time.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                      <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        filters.onward_transit_hour.some(
                          (t) => t.name === time.name,
                        )
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_transit_hour.some(
                        (t) => t.name === time.name,
                      ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                      <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        filters.onward_layover_airport.includes(airport)
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_layover_airport.includes(airport) && (
                        <FaCheck className="inline mr-1.5 w-2.5 h-2.5" />
                      )}
                      <FaBuilding className="inline mr-1.5 w-2.5 h-2.5 opacity-70" />
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        filters.onward_destination_airport.includes(airport)
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-200"
                          : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                      } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {filters.onward_destination_airport.includes(airport) && (
                        <FaCheck className="inline mr-1.5 w-2.5 h-2.5" />
                      )}
                      <FaMapMarkerAlt className="inline mr-1.5 w-2.5 h-2.5 opacity-70" />
                      {airport}
                    </button>
                  ))}
                </div>,
              )}

            {/* Return Filters - Only for Round Trip */}
            {journeyType === 2 && (
              <>
                <div className="border-t-2 border-gradient-to-r from-blue-200 to-indigo-200 pt-3 mt-2 mb-4">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2.5">
                    <div className="bg-linear-to-r from-indigo-500 to-purple-500 p-1.5 rounded-xl shadow-md shadow-indigo-200">
                      <FaRedo className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Return Filters
                    </span>
                    <span className="flex-1 h-px bg-linear-to-r from-indigo-200 via-transparent to-transparent"></span>
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
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            filters.return_flight_stops.includes(stops)
                              ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200 scale-105"
                              : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_flight_stops.includes(stops) && (
                            <FaCheck className="inline mr-1.5 w-3 h-3" />
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
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            filters.return_depart_time.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-200"
                              : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_depart_time.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                          <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            filters.return_arrival_time.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-200"
                              : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_arrival_time.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                          <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            filters.return_flying_time.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-200"
                              : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_flying_time.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                          <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            filters.return_transit_hour.some(
                              (t) => t.name === time.name,
                            )
                              ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-200"
                              : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_transit_hour.some(
                            (t) => t.name === time.name,
                          ) && <FaCheck className="inline mr-1.5 w-3 h-3" />}
                          <FaClock className="inline mr-1.5 w-3 h-3 opacity-70" />
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
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                            filters.return_layover_airport.includes(airport)
                              ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-200"
                              : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                          } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {filters.return_layover_airport.includes(airport) && (
                            <FaCheck className="inline mr-1.5 w-2.5 h-2.5" />
                          )}
                          <FaBuilding className="inline mr-1.5 w-2.5 h-2.5 opacity-70" />
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                              filters.return_destination_airport.includes(
                                airport,
                              )
                                ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-200"
                                : "bg-white text-gray-700 border-blue-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                            } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {filters.return_destination_airport.includes(
                              airport,
                            ) && (
                              <FaCheck className="inline mr-1.5 w-2.5 h-2.5" />
                            )}
                            <FaMapMarkerAlt className="inline mr-1.5 w-2.5 h-2.5 opacity-70" />
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
          className="w-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 mt-4 relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-linear-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          {filterLoading ? (
            <>
              <FaSpinner className="animate-spin w-5 h-5 relative z-10" />
              <span className="relative z-10">Applying Filters...</span>
            </>
          ) : isLoading ? (
            <>
              <FaSpinner className="animate-spin w-5 h-5 relative z-10" />
              <span className="relative z-10">Loading Filters...</span>
            </>
          ) : (
            <>
              <FaSearch className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">Apply Filters</span>
              {getFilterCount() > 0 && (
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full relative z-10 font-bold">
                  {getFilterCount()}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        
        /* Custom scrollbar */
        .max-h-52::-webkit-scrollbar,
        .max-h-32::-webkit-scrollbar {
          width: 4px;
        }
        .max-h-52::-webkit-scrollbar-track,
        .max-h-32::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .max-h-52::-webkit-scrollbar-thumb,
        .max-h-32::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .max-h-52::-webkit-scrollbar-thumb:hover,
        .max-h-32::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default FlightFilters;
