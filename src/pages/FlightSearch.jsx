import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { searchFlights, getCities } from "../api/flight";

const FlightSearch = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
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
  });
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  // Handle city search with debounce
  const handleCitySearch = async (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value.toUpperCase() });
    setActiveField(name);

    if (value.length > 1) {
      try {
        const data = await getCities(value);
        setCitySuggestions(data.cities || []);
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
    setSearchParams({
      ...searchParams,
      [activeField]: city.code || city,
    });
    setCitySuggestions([]);
  };

  // Handle flight search
  const handleSearch = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!searchParams.Origin) {
      alert("Please enter Origin");
      return;
    }
    if (!searchParams.Destination) {
      alert("Please enter Destination");
      return;
    }
    if (!searchParams.DepartureDate) {
      alert("Please select Departure Date");
      return;
    }
    if (searchParams.Origin === searchParams.Destination) {
      alert("Origin and Destination cannot be the same");
      return;
    }

    setLoading(true);
    try {
      const data = await searchFlights(searchParams);
      setFlights(data.flights || []);
      console.log("Flights:", data?.raw);
    } catch (error) {
      console.error("Search error:", error);
      alert(error.response?.data?.message || "Failed to search flights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">✈️ Flight Search</h1>
          <button
            onClick={() => (window.location.href = "/config")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            ⚙️ Configure
          </button>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>

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
                  value={searchParams?.Origin?.AirportCode}
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
                        {city.AirportCode}
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
                  value={searchParams.Destination?.AirportCode}
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
                          {city.AirportCode}
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

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </form>
        </div>

        {/* Flight Results */}
        {flights.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Results ({flights.length} flights)
            </h2>
            <div className="space-y-3">
              {flights.map((flight, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  {/* Flight Route & Airline */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Airline:</span>
                      <span className="ml-1 font-medium">
                        {flight.airlineName ||
                          flight.CarrierName ||
                          flight.airlineCode ||
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
                        {flight.FareBreakdown?.[0]?.BaseFare
                          ? `BDT ${flight.FareBreakdown[0].BaseFare.toFixed(2)}`
                          : `BDT ${(flight.BaseFare || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tax:</span>
                      <span className="ml-1 font-medium">
                        {flight.FareBreakdown?.[0]?.TotalTax
                          ? `BDT ${flight.FareBreakdown[0].TotalTax.toFixed(2)}`
                          : `BDT ${(flight.TotalTax || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="text-green-600">
                      <span className="text-gray-500">Total Fare:</span>
                      <span className="ml-1 font-bold">
                        {flight.FareBreakdown?.[0]?.TotalFare
                          ? `BDT ${flight.FareBreakdown[0].TotalFare.toFixed(2)}`
                          : `BDT ${(flight.TotalPrice || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="text-blue-600">
                      <span className="text-gray-500">Discount:</span>
                      <span className="ml-1 font-bold">
                        {flight.ApiDiscount ||
                        flight.FareBreakdown?.[0]?.ApiDiscount
                          ? `-BDT ${(flight.ApiDiscount || flight.FareBreakdown?.[0]?.ApiDiscount || 0).toFixed(2)}`
                          : "BDT 0.00"}
                      </span>
                    </div>
                  </div>

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

                  {/* Tax Breakdown (if available) */}
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
        {flights.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            Search for flights to see results here
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
