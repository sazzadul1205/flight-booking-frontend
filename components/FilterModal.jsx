import { useState } from "react";

const FilterModal = ({ isOpen, onClose, onApply, flights }) => {
  const [filter, setFilter] = useState({
    min_price: "",
    max_price: "",
    fare_type: [],
    airlines: [],
    onward_flight_stops: [],
    return_flight_stops: [],
  });

  const toggleFareType = (type) => {
    setFilter((prev) => ({
      ...prev,
      fare_type: prev.fare_type.includes(type)
        ? prev.fare_type.filter((t) => t !== type)
        : [...prev.fare_type, type],
    }));
  };

  const toggleAirline = (code) => {
    setFilter((prev) => ({
      ...prev,
      airlines: prev.airlines.includes(code)
        ? prev.airlines.filter((a) => a !== code)
        : [...prev.airlines, code],
    }));
  };

  const toggleStops = (type, stops) => {
    setFilter((prev) => ({
      ...prev,
      [type]: prev[type].includes(stops)
        ? prev[type].filter((s) => s !== stops)
        : [...prev[type], stops],
    }));
  };

  const handleApply = () => {
    const processedFilter = {
      ...filter,
      min_price: filter.min_price ? parseFloat(filter.min_price) : 0,
      max_price: filter.max_price ? parseFloat(filter.max_price) : 0,
      onward_flight_stops: filter.onward_flight_stops.map(Number),
      return_flight_stops: filter.return_flight_stops.map(Number),
    };
    onApply(processedFilter);
    onClose();
  };

  const handleReset = () => {
    setFilter({
      min_price: "",
      max_price: "",
      fare_type: [],
      airlines: [],
      onward_flight_stops: [],
      return_flight_stops: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Filter Flights</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Price Range</h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filter.min_price}
                onChange={(e) =>
                  setFilter({ ...filter, min_price: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Max"
                value={filter.max_price}
                onChange={(e) =>
                  setFilter({ ...filter, max_price: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Fare Type */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Fare Type</h3>
            <div className="flex gap-3">
              {["Refundable", "Non-Refundable"].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFareType(type)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filter.fare_type.includes(type)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Airlines */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Airlines</h3>
            <div className="flex flex-wrap gap-2">
              {flights &&
                Array.from(new Set(flights.map((f) => f.PlatingCarrier))).map(
                  (code) => (
                    <button
                      key={code}
                      onClick={() => toggleAirline(code)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        filter.airlines.includes(code)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {code}
                    </button>
                  ),
                )}
            </div>
          </div>

          {/* Stops */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Stops</h3>
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((stops) => (
                <button
                  key={stops}
                  onClick={() => toggleStops("onward_flight_stops", stops)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filter.onward_flight_stops.includes(stops)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {stops === 0
                    ? "Non-stop"
                    : `${stops} stop${stops > 1 ? "s" : ""}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
