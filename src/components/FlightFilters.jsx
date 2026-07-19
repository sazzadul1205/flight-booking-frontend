// src/components/FlightFilters.jsx
import { useState } from "react";

const FlightFilters = ({
  filters,
  setFilters,
  filterOptions,
  airlines,
  selectedAirlines,
  setSelectedAirlines,
  journeyType,
  filterLoading,
  applyFilters,
}) => {
  const [airlineSearch, setAirlineSearch] = useState("");
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);

  // Filtered airlines for dropdown
  const filteredAirlines = airlines.filter((airline) => {
    const searchLower = airlineSearch.toLowerCase();
    return (
      airline.Code.toLowerCase().includes(searchLower) ||
      airline.AriLineName.toLowerCase().includes(searchLower)
    );
  });

  // Time ranges options
  const timeRanges = [
    { name: "00:00 To 05:59" },
    { name: "06:00 To 11:59" },
    { name: "12:00 To 17:59" },
    { name: "18:00 To 23:59" },
  ];

  // Stop options
  const stopOptions = [0, 1, 2, 3];

  // Helper to toggle array values
  const toggleArrayValue = (array, value) => {
    return array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value];
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

  // Airline handlers
  const handleAirlineSearch = (e) => {
    const value = e.target.value;
    setAirlineSearch(value);
    setShowAirlineDropdown(true);
  };

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

  return (
    <div className="space-y-4">
      {/* Price Range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            placeholder={filterOptions?.min_price || "Min"}
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
            placeholder={filterOptions?.max_price || "Max"}
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
          {(filterOptions?.fare_type || ["Refundable", "Non-Refundable"]).map(
            (type) => (
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
            ),
          )}
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

          {selectedAirlines.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedAirlines.map((airline) => (
                <span
                  key={airline.ID}
                  className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1"
                >
                  {airline.Code}
                  <button
                    onClick={() => !filterLoading && removeAirline(airline)}
                    disabled={filterLoading}
                    className="hover:text-red-600 ml-1 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {showAirlineDropdown &&
            filteredAirlines.length > 0 &&
            !filterLoading && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                {filteredAirlines.map((airline) => {
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
                {filteredAirlines.length === 0 && airlineSearch && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No airlines found
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Aircraft */}
      {(filterOptions?.aircraft || []).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Aircraft
          </label>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
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
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  filters.aircraft.includes(aircraft)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {aircraft}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Baggage */}
      {(filterOptions?.baggage || []).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Baggage
          </label>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
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
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  filters.baggage.includes(baggage)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {baggage}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Onward Stops */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Onward Stops
        </label>
        <div className="flex flex-wrap gap-2">
          {(filterOptions?.onward_flight_stops || stopOptions).map((stops) => (
            <button
              key={stops}
              onClick={() =>
                !filterLoading && toggleStop("onward_flight_stops", stops)
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
          {(filterOptions?.onward_depart_time || timeRanges).map((time) => (
            <button
              key={time.name}
              onClick={() =>
                !filterLoading && toggleTimeRange("onward_depart_time", time)
              }
              disabled={filterLoading}
              className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                filters.onward_depart_time.some((t) => t.name === time.name)
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
          {(filterOptions?.onward_arrival_time || timeRanges).map((time) => (
            <button
              key={time.name}
              onClick={() =>
                !filterLoading && toggleTimeRange("onward_arrival_time", time)
              }
              disabled={filterLoading}
              className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                filters.onward_arrival_time.some((t) => t.name === time.name)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {time.name}
            </button>
          ))}
        </div>
      </div>

      {/* Onward Flying Time */}
      {(filterOptions?.onward_flying_time || []).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Onward Flying Time
          </label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.onward_flying_time.map((time) => (
              <button
                key={time.name}
                onClick={() =>
                  !filterLoading && toggleTimeRange("onward_flying_time", time)
                }
                disabled={filterLoading}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                  filters.onward_flying_time.some((t) => t.name === time.name)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {time.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Onward Transit Time */}
      {(filterOptions?.onward_transit_hour || []).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Onward Transit Time (Layover)
          </label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.onward_transit_hour.map((time) => (
              <button
                key={time.name}
                onClick={() =>
                  !filterLoading && toggleTimeRange("onward_transit_hour", time)
                }
                disabled={filterLoading}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                  filters.onward_transit_hour.some((t) => t.name === time.name)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {time.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Onward Layover Airports */}
      {(filterOptions?.onward_layover_airport || []).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Onward Layover Airports
          </label>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
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
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  filters.onward_layover_airport.includes(airport)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {airport}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Onward Destination Airports */}
      {(filterOptions?.onward_destination_airport || []).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Onward Destination Airports
          </label>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
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
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  filters.onward_destination_airport.includes(airport)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {airport}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Return Filters - Only for Round Trip */}
      {journeyType === 2 && (
        <>
          <div className="border-t border-gray-200 pt-3 mt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Return Filters
            </h4>
          </div>

          {/* Return Stops */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Return Stops
            </label>
            <div className="flex flex-wrap gap-2">
              {(filterOptions?.return_flight_stops || stopOptions).map(
                (stops) => (
                  <button
                    key={stops}
                    onClick={() =>
                      !filterLoading && toggleStop("return_flight_stops", stops)
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
                ),
              )}
            </div>
          </div>

          {/* Return Departure Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Return Departure Time
            </label>
            <div className="flex flex-wrap gap-2">
              {(filterOptions?.return_depart_time || timeRanges).map((time) => (
                <button
                  key={time.name}
                  onClick={() =>
                    !filterLoading &&
                    toggleTimeRange("return_depart_time", time)
                  }
                  disabled={filterLoading}
                  className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                    filters.return_depart_time.some((t) => t.name === time.name)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {time.name}
                </button>
              ))}
            </div>
          </div>

          {/* Return Arrival Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Return Arrival Time
            </label>
            <div className="flex flex-wrap gap-2">
              {(filterOptions?.return_arrival_time || timeRanges).map(
                (time) => (
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
                ),
              )}
            </div>
          </div>

          {/* Return Flying Time */}
          {(filterOptions?.return_flying_time || []).length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Return Flying Time
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.return_flying_time.map((time) => (
                  <button
                    key={time.name}
                    onClick={() =>
                      !filterLoading &&
                      toggleTimeRange("return_flying_time", time)
                    }
                    disabled={filterLoading}
                    className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                      filters.return_flying_time.some(
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
          )}

          {/* Return Transit Time */}
          {(filterOptions?.return_transit_hour || []).length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Return Transit Time (Layover)
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.return_transit_hour.map((time) => (
                  <button
                    key={time.name}
                    onClick={() =>
                      !filterLoading &&
                      toggleTimeRange("return_transit_hour", time)
                    }
                    disabled={filterLoading}
                    className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                      filters.return_transit_hour.some(
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
          )}

          {/* Return Layover Airports */}
          {(filterOptions?.return_layover_airport || []).length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Return Layover Airports
              </label>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
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
                    className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                      filters.return_layover_airport.includes(airport)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {airport}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Return Destination Airports */}
          {(filterOptions?.return_destination_airport || []).length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Return Destination Airports
              </label>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                {filterOptions.return_destination_airport.map((airport) => (
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
                    className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                      filters.return_destination_airport.includes(airport)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {airport}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Apply Filters Button */}
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
  );
};

export default FlightFilters;
