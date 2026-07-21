import { useState } from "react";
import { FaClock, FaUser, FaSuitcase, FaPlane } from "react-icons/fa";
import { MdFlight } from "react-icons/md";

const FlightResults = ({ flights }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!flights || flights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No flights found matching your search criteria.
      </div>
    );
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  // Truncate text helper
  const truncateText = (text, maxLength = 30) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  console.log(flights[0]);

  return (
    <div className="space-y-5">
      {flights.map((flight, index) => {
        const onward = flight.Onwards?.[0];
        const fare = flight.FareBreakdown?.[0];
        const totalTime = flight.TotalTravelTimes?.[0];
        const isExpanded = expandedIndex === index;
        const brandedFareInfo = flight.BrandedFareInfoes?.[0];

        if (!onward) return null;

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow overflow-visible relative"
          >
            {/* Refundable Badge - Top Right Half Outside */}
            <div className="relative h-0">
              <div className="absolute -top-2 -right-2 z-10">
                {flight.IsRefundable ? (
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200 shadow-md">
                    ✓ Refundable
                  </span>
                ) : (
                  <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full border border-red-200 shadow-md">
                    ✗ Non-Refundable
                  </span>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              {/* Airline and Route Section */}
              <div className="flex items-center justify-between gap-5 mb-3">
                {/* Airline and Flight Number */}
                <div className="flex items-center gap-2 min-w-30">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white shrink-0">
                    <MdFlight className="text-white text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-semibold text-gray-800 truncate max-w-30">
                      {onward.CarrierName || "Airline"}
                    </h1>
                    <p className="text-xs text-gray-500">
                      {onward.Carrier}
                      {onward.FlightNumber}
                    </p>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="flex items-center justify-center px-4 py-2 flex-1">
                  {/* Origin */}
                  <div className="text-right min-w-20">
                    <p className="text-xs text-gray-500 font-medium">From</p>
                    <p className="text-xl font-bold text-blue-600">
                      {onward.Origin}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(onward.DepartureTime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(onward.DepartureTime)}
                    </p>
                  </div>

                  {/* Flight Path */}
                  <div className="flex-1 flex flex-col items-center px-4 max-w-45">
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 h-0.5 bg-gray-300 relative">
                        <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-gray-400"></div>
                        <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="shrink-0">
                        <FaPlane className="text-blue-500 text-sm transform rotate-45" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {totalTime?.TotalTravelDuration || "N/A"}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
                        {totalTime?.NoOfStop === 0
                          ? "Non Stop"
                          : `${totalTime?.NoOfStop} Stop${totalTime?.NoOfStop > 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="text-left min-w-20">
                    <p className="text-xs text-gray-500 font-medium">To</p>
                    <p className="text-xl font-bold text-blue-600">
                      {onward.Destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(onward.ArrivalTime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(onward.ArrivalTime)}
                    </p>
                  </div>
                </div>

                {/* Price and Book Button */}
                <div className="flex items-center gap-3 mt-2 min-w-35 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">per adult</p>
                    <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">
                      ${fare?.TotalFare?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                      disabled={!flight.IsBookable}
                    >
                      {flight.IsBookable ? "Book Now" : "Not Available"}
                    </button>
                    {!flight.IsBookable && (
                      <p className="text-xs text-red-500 mt-1 whitespace-nowrap">
                        Currently unavailable
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div className="mt-3 pt-3 border-dashed border-t border-black grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600 min-w-0">
                  <FaUser className="text-blue-400 shrink-0" />
                  <span className="truncate">
                    {onward.CarrierName || "Airline"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-medium shrink-0">Flight:</span>
                  <span className="truncate">
                    {onward.Carrier}
                    {onward.FlightNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <FaClock className="text-blue-400 shrink-0" />
                  <span>{totalTime?.TotalTravelDuration}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 min-w-0">
                  <FaSuitcase className="text-blue-400 shrink-0" />
                  <span className="truncate" title={onward.AirBaggageAllowance}>
                    {truncateText(onward.AirBaggageAllowance, 25) || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Details Section with CSS Animation */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Flight Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-2">
                      Flight Details
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Airline:</span>
                        <span
                          className="font-medium truncate max-w-50"
                          title={onward.CarrierName}
                        >
                          {truncateText(onward.CarrierName, 30)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flight Number:</span>
                        <span className="font-medium">
                          {onward.Carrier}
                          {onward.FlightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aircraft:</span>
                        <span
                          className="font-medium truncate max-w-50"
                          title={onward.Equipment}
                        >
                          {truncateText(onward.Equipment, 25) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Operating Carrier:
                        </span>
                        <span
                          className="font-medium truncate max-w-50"
                          title={onward.OperatingCarrierName}
                        >
                          {truncateText(
                            onward.OperatingCarrierName || onward.CarrierName,
                            25,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operating Flight:</span>
                        <span className="font-medium">
                          {onward.OperatingCarrier}
                          {onward.OperatingFlightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Code:</span>
                        <span className="font-medium">
                          {onward.BookingCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Count:</span>
                        <span className="font-medium">
                          {onward.BookingCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fare Basis:</span>
                        <span
                          className="font-medium truncate max-w-50"
                          title={onward.FareBasis}
                        >
                          {truncateText(onward.FareBasis, 25) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Fare Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-2">
                      Fare Breakdown
                    </h4>

                    {fare && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Fare:</span>
                          <span className="font-medium">
                            ${fare.BaseFare?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Tax:</span>
                          <span className="font-medium">
                            ${fare.TotalTax?.toLocaleString()}
                          </span>
                        </div>
                        {fare.ApiDiscount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-green-600">
                              -${fare.ApiDiscount?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {fare.Fees > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fees:</span>
                            <span className="font-medium">
                              ${fare.Fees?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {fare.TaxesBreakdown &&
                          fare.TaxesBreakdown.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-gray-600 text-xs block mb-1">
                                Tax Breakdown:
                              </span>
                              {fare.TaxesBreakdown.map((tax, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-xs pl-2"
                                >
                                  <span className="text-gray-500">
                                    {tax.Category}:
                                  </span>
                                  <span className="font-medium">
                                    ${tax.Amount}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                          <span>Total Fare:</span>
                          <span className="text-blue-600">
                            ${fare.TotalFare?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Branded Fare Details */}
                {brandedFareInfo?.BrandedFareInfoDetail && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Fare Features
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(
                        brandedFareInfo.BrandedFareInfoDetail,
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-white p-2 rounded border border-gray-200"
                        >
                          <span className="text-xs text-gray-500 block">
                            {key}
                          </span>
                          <span
                            className="font-medium text-sm truncate block"
                            title={value.Text}
                          >
                            {truncateText(value.Text, 30)}
                          </span>
                          {value.OtherText && (
                            <span
                              className="text-xs text-gray-400 truncate block"
                              title={value.OtherText}
                            >
                              {truncateText(value.OtherText, 25)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Trip Type:</span>{" "}
                    {flight.TripType || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Plating Carrier:</span>{" "}
                    {truncateText(flight.PlatingCarrierName, 20) || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Passenger Type:</span>{" "}
                    {flight.PassengerType || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Bookable:</span>{" "}
                    {flight.IsBookable ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">Fare Type:</span>{" "}
                    {flight.FareType || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Currency:</span>{" "}
                    {onward.Currency || "BDT"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FlightResults;
