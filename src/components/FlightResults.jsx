// FlightResults.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import {
  FaClock,
  FaUser,
  FaSuitcase,
  FaPlane,
  FaExclamationTriangle,
  FaSearch,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaShieldAlt,
} from "react-icons/fa";
import { MdFlight } from "react-icons/md";

// Skeleton Loading Component
const FlightResultSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden relative animate-pulse">
      <div className="relative h-0">
        <div className="absolute -top-2 -right-2 z-10">
          <div className="h-6 w-24 bg-linear-to-r from-blue-200 to-indigo-200 rounded-full"></div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-5 mb-3">
          <div className="flex items-center gap-3 min-w-30">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-200 to-indigo-200"></div>
            <div className="min-w-0">
              <div className="h-5 w-24 bg-linear-to-r from-blue-200 to-indigo-200 rounded"></div>
              <div className="h-3 w-16 bg-linear-to-r from-blue-100 to-indigo-100 rounded mt-1"></div>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-2 flex-1">
            <div className="text-right min-w-20">
              <div className="h-3 w-8 bg-linear-to-r from-blue-100 to-indigo-100 rounded mx-auto"></div>
              <div className="h-7 w-12 bg-linear-to-r from-blue-200 to-indigo-200 rounded mt-1 mx-auto"></div>
              <div className="h-4 w-10 bg-linear-to-r from-blue-100 to-indigo-100 rounded mt-1 mx-auto"></div>
              <div className="h-3 w-14 bg-linear-to-r from-blue-50 to-indigo-50 rounded mt-1 mx-auto"></div>
            </div>

            <div className="flex-1 flex flex-col items-center px-4 max-w-45">
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-0.5 bg-linear-to-r from-blue-200 to-indigo-200"></div>
                <div className="shrink-0">
                  <div className="w-4 h-4 bg-linear-to-br from-blue-300 to-indigo-300 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-3 w-12 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
                <div className="h-3 w-3 bg-linear-to-r from-blue-200 to-indigo-200 rounded"></div>
                <div className="h-3 w-14 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
              </div>
            </div>

            <div className="text-left min-w-20">
              <div className="h-3 w-8 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
              <div className="h-7 w-12 bg-linear-to-r from-blue-200 to-indigo-200 rounded mt-1"></div>
              <div className="h-4 w-10 bg-linear-to-r from-blue-100 to-indigo-100 rounded mt-1"></div>
              <div className="h-3 w-14 bg-linear-to-r from-blue-50 to-indigo-50 rounded mt-1"></div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 min-w-35 shrink-0">
            <div className="text-right">
              <div className="h-3 w-14 bg-linear-to-r from-blue-100 to-indigo-100 rounded ml-auto"></div>
              <div className="h-7 w-16 bg-linear-to-r from-blue-200 to-indigo-200 rounded mt-1 ml-auto"></div>
            </div>
            <div className="flex flex-col items-end">
              <div className="h-10 w-24 bg-linear-to-r from-blue-300 to-indigo-300 rounded-lg"></div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-dashed border-t border-blue-100 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-linear-to-r from-blue-200 to-indigo-200 rounded"></div>
            <div className="h-4 w-20 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-12 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
            <div className="h-4 w-16 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-linear-to-r from-blue-200 to-indigo-200 rounded"></div>
            <div className="h-4 w-16 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-linear-to-r from-blue-200 to-indigo-200 rounded"></div>
            <div className="h-4 w-20 bg-linear-to-r from-blue-100 to-indigo-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Infinite Loader Component - FIXED
const InfiniteLoader = ({ isLoading, hasMore, onLoadMore }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    const currentLoaderRef = loaderRef.current;

    if (!currentLoaderRef || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          console.log("🔄 InfiniteLoader triggered - loading more...");
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Trigger slightly before reaching the bottom
      },
    );

    observer.observe(currentLoaderRef);

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
      observer.disconnect();
    };
  }, [isLoading, hasMore, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={loaderRef} className="py-6 flex justify-center">
      {isLoading ? (
        <div className="flex items-center gap-3 text-indigo-600">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm font-medium">Loading more flights...</span>
        </div>
      ) : (
        <div className="text-sm text-gray-400 animate-pulse flex items-center gap-2">
          <span>⬇️ Scroll for more flights</span>
        </div>
      )}
    </div>
  );
};

// Error State Component
const FlightResultsError = ({ error, onRetry }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-10 text-center">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-linear-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <FaExclamationTriangle className="text-red-500 text-4xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {error || "We couldn't load the flight results. Please try again."}
        </p>
        <button
          onClick={onRetry}
          className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <FaSearch className="text-sm" />
          Try Again
        </button>
      </div>
    </div>
  );
};

const FlightResults = ({
  flights,
  loading,
  error,
  onRetry,
  hasMore: externalHasMore = false,
  isLoadingMore = false,
  onLoadMore = null,
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const totalFlights = useMemo(() => flights || [], [flights]);

  if (loading && !totalFlights.length) {
    return (
      <div className="space-y-5">
        {[...Array(3)].map((_, index) => (
          <FlightResultSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <FlightResultsError error={error} onRetry={onRetry} />;
  }

  if (!totalFlights || totalFlights.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg border border-blue-100/50 p-10">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4">
            <FaPlane className="text-blue-400 text-2xl" />
          </div>
          <p className="text-lg font-medium text-gray-600">No flights found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search criteria
          </p>
        </div>
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

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const reachedEnd =
    !externalHasMore && totalFlights.length > 0 && !isLoadingMore;

  // Get airline color based on name
  const getAirlineColor = (name) => {
    const colors = [
      "from-blue-500 to-indigo-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-cyan-500 to-blue-500",
      "from-rose-500 to-pink-500",
      "from-violet-500 to-purple-500",
      "from-teal-500 to-cyan-500",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-5">
      {totalFlights.map((flight, index) => {
        const segments = flight.Onwards || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        const originData = firstSegment;
        const destinationData = lastSegment;

        const fare = flight.FareBreakdown?.[0];
        const totalTime = flight.TotalTravelTimes?.[0];
        const isExpanded = expandedIndex === index;
        const brandedFareInfo = flight.BrandedFareInfoes?.[0];

        if (!originData || !destinationData) return null;

        const isMultiSegment = segments.length > 1;
        const airlineColor = getAirlineColor(originData.CarrierName);

        return (
          <div
            key={`${flight.Id || index}-${index}`}
            className="bg-white rounded-2xl shadow-lg border border-blue-100/50 hover:shadow-2xl transition-all duration-300 overflow-visible relative group"
          >
            {/* Refundable Badge */}
            <div className="relative h-0">
              <div className="absolute -top-2 -right-2 z-10">
                {flight.IsRefundable ? (
                  <span className="inline-flex items-center gap-1 bg-linear-to-r from-green-400 to-emerald-400 text-white text-xs px-3 py-1.5 rounded-full border border-green-300 shadow-lg">
                    <FaShieldAlt className="text-[10px]" />
                    Refundable
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-linear-to-r from-red-400 to-rose-400 text-white text-xs px-3 py-1.5 rounded-full border border-red-300 shadow-lg">
                    Non-Refundable
                  </span>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div
              className="p-5 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              {/* Airline and Route Section */}
              <div className="flex items-center justify-between gap-5 mb-3">
                {/* Airline and Flight Number */}
                <div className="flex items-center gap-3 min-w-30">
                  <div
                    className={`w-12 h-12 rounded-full bg-linear-to-br ${airlineColor} flex items-center justify-center shadow-lg border-2 border-white shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <MdFlight className="text-white text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-semibold text-gray-800 truncate max-w-40">
                      {originData.CarrierName || "Airline"}
                    </h1>
                    <p className="text-xs text-gray-500">
                      {originData.Carrier}
                      {originData.FlightNumber}
                      {isMultiSegment && (
                        <span className="text-blue-500 ml-1 font-medium">
                          +{segments.length - 1} more
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="flex items-center justify-center px-4 py-2 flex-1">
                  {/* Origin */}
                  <div className="text-right min-w-20">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      From
                    </p>
                    <p className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {originData.Origin}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatTime(originData.DepartureTime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(originData.DepartureTime)}
                    </p>
                  </div>

                  {/* Flight Path */}
                  <div className="flex-1 flex flex-col items-center px-4 max-w-45">
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 h-0.5 bg-linear-to-r from-blue-300 to-indigo-300 relative">
                        <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-blue-400"></div>
                        <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-indigo-500"></div>
                      </div>
                      <div className="shrink-0">
                        <FaPlane className="text-indigo-500 text-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                        {totalTime?.TotalTravelDuration || "N/A"}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs font-medium text-indigo-600 whitespace-nowrap">
                        {totalTime?.NoOfStop === 0
                          ? "✈️ Non Stop"
                          : `${totalTime?.NoOfStop} Stop${totalTime?.NoOfStop > 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="text-left min-w-20">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      To
                    </p>
                    <p className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {destinationData.Destination}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatTime(destinationData.ArrivalTime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(destinationData.ArrivalTime)}
                    </p>
                  </div>
                </div>

                {/* Price and Book Button */}
                <div className="flex items-center gap-4 mt-2 min-w-35 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium">
                      per adult
                    </p>
                    <p className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${fare?.TotalFare?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105"
                      onClick={(e) => e.stopPropagation()}
                      disabled={!flight.IsBookable}
                    >
                      {flight.IsBookable ? "Book Now ✈️" : "Not Available"}
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
              <div className="mt-3 pt-3 border-dashed border-t border-blue-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <FaUser className="text-indigo-400 shrink-0" />
                  <span className="truncate font-medium">
                    {originData.CarrierName || "Airline"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium shrink-0">Flight:</span>
                  <span className="font-semibold text-gray-800 truncate">
                    {originData.Carrier}
                    {originData.FlightNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaClock className="text-indigo-400 shrink-0" />
                  <span className="font-medium">
                    {totalTime?.TotalTravelDuration}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <FaSuitcase className="text-indigo-400 shrink-0" />
                  <span
                    className="truncate font-medium"
                    title={originData.AirBaggageAllowance}
                  >
                    {truncateText(originData.AirBaggageAllowance, 25) || "N/A"}
                  </span>
                </div>
              </div>

              {/* Expand/Collapse Indicator */}
              <div className="flex justify-center mt-2 text-indigo-400">
                {isExpanded ? (
                  <FaChevronUp className="text-sm animate-bounce" />
                ) : (
                  <FaChevronDown className="text-sm" />
                )}
              </div>
            </div>

            {/* Expanded Details Section with Animation */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t-2 border-gradient-to-r from-blue-100 to-indigo-100 bg-linear-to-br p-5 rounded-b-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Flight Details */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                      <FaPlane className="text-indigo-500" />
                      Flight Details
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Airline:</span>
                        <span
                          className="font-semibold text-gray-800 truncate max-w-50"
                          title={originData.CarrierName}
                        >
                          {truncateText(originData.CarrierName, 30)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-blue-50">
                        <span className="text-gray-600">Flight Number:</span>
                        <span className="font-semibold text-gray-800">
                          {originData.Carrier}
                          {originData.FlightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-blue-50">
                        <span className="text-gray-600">Aircraft:</span>
                        <span
                          className="font-semibold text-gray-800 truncate max-w-50"
                          title={originData.Equipment}
                        >
                          {truncateText(originData.Equipment, 25) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-blue-50">
                        <span className="text-gray-600">
                          Operating Carrier:
                        </span>
                        <span
                          className="font-semibold text-gray-800 truncate max-w-50"
                          title={originData.OperatingCarrierName}
                        >
                          {truncateText(
                            originData.OperatingCarrierName ||
                              originData.CarrierName,
                            25,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-blue-50">
                        <span className="text-gray-600">Booking Code:</span>
                        <span className="font-semibold text-gray-800">
                          {originData.BookingCode}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-blue-50">
                        <span className="text-gray-600">Fare Basis:</span>
                        <span
                          className="font-semibold text-gray-800 truncate max-w-50"
                          title={originData.FareBasis}
                        >
                          {truncateText(originData.FareBasis, 25) || "N/A"}
                        </span>
                      </div>

                      {/* All segments */}
                      {isMultiSegment && (
                        <div className="mt-3 pt-3 border-t-2 border-blue-200">
                          <h5 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                            <FaPlane className="text-indigo-400 text-xs" />
                            All Segments ({segments.length})
                          </h5>
                          {segments.map((segment, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded-xl border border-blue-100 mb-2 text-sm shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">
                                  {segment.Origin} → {segment.Destination}
                                </span>
                                <span className="font-medium text-indigo-600">
                                  {segment.Carrier}
                                  {segment.FlightNumber}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-500 text-xs mt-1">
                                <span>
                                  {formatTime(segment.DepartureTime)} -{" "}
                                  {formatTime(segment.ArrivalTime)}
                                </span>
                                <span className="font-medium">
                                  {segment.TravelDuration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Fare Details */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      Fare Breakdown
                    </h4>

                    {fare && (
                      <div className="space-y-2 text-sm bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Base Fare:</span>
                          <span className="font-semibold text-gray-800">
                            ${fare.BaseFare?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-t border-blue-50">
                          <span className="text-gray-600">Total Tax:</span>
                          <span className="font-semibold text-gray-800">
                            ${fare.TotalTax?.toLocaleString()}
                          </span>
                        </div>
                        {fare.ApiDiscount > 0 && (
                          <div className="flex justify-between py-1 border-t border-blue-50">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-semibold text-green-600">
                              -${fare.ApiDiscount?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {fare.Fees > 0 && (
                          <div className="flex justify-between py-1 border-t border-blue-50">
                            <span className="text-gray-600">Fees:</span>
                            <span className="font-semibold text-gray-800">
                              ${fare.Fees?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {fare.TaxesBreakdown &&
                          fare.TaxesBreakdown.length > 0 && (
                            <div className="mt-2 pt-2 border-t-2 border-blue-100">
                              <span className="text-gray-600 text-xs block mb-1 font-medium">
                                Tax Breakdown:
                              </span>
                              {fare.TaxesBreakdown.map((tax, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-xs py-0.5 pl-2"
                                >
                                  <span className="text-gray-500">
                                    {tax.Category}:
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    ${tax.Amount}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        <div className="flex justify-between pt-3 border-t-2 border-blue-200 font-bold">
                          <span className="text-gray-800">Total Fare:</span>
                          <span className="text-xl bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            ${fare.TotalFare?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Branded Fare Details */}
                {brandedFareInfo?.BrandedFareInfoDetail && (
                  <div className="mt-4 pt-3 border-t-2 border-blue-200">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaShieldAlt className="text-indigo-500" />
                      Fare Features
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(
                        brandedFareInfo.BrandedFareInfoDetail,
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-xs font-medium text-indigo-500 uppercase tracking-wider block">
                            {key}
                          </span>
                          <span
                            className="font-semibold text-gray-800 text-sm truncate block mt-1"
                            title={value.Text}
                          >
                            {truncateText(value.Text, 30)}
                          </span>
                          {value.OtherText && (
                            <span
                              className="text-xs text-gray-400 truncate block mt-0.5"
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
                <div className="mt-4 pt-3 border-t-2 border-blue-200 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium text-gray-600">
                      Trip Type:
                    </span>{" "}
                    {flight.TripType || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Plating Carrier:
                    </span>{" "}
                    {truncateText(flight.PlatingCarrierName, 20) || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Passenger Type:
                    </span>{" "}
                    {flight.PassengerType || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Bookable:</span>{" "}
                    <span
                      className={
                        flight.IsBookable
                          ? "text-green-600 font-semibold"
                          : "text-red-500"
                      }
                    >
                      {flight.IsBookable ? "Yes ✅" : "No ❌"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Fare Type:
                    </span>{" "}
                    {flight.FareType || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Currency:</span>{" "}
                    {originData.Currency || "BDT"}
                  </div>
                  {isMultiSegment && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Segments:
                      </span>{" "}
                      {segments.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Infinite Loader - Always show if hasMore is true */}
      {externalHasMore && (
        <InfiniteLoader
          isLoading={isLoadingMore}
          hasMore={externalHasMore}
          onLoadMore={onLoadMore}
        />
      )}

      {/* End of list message */}
      {reachedEnd && totalFlights.length > 0 && (
        <div className="text-center py-8 mt-4 border-t-2 border-blue-100">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <FaInfoCircle className="text-indigo-400 text-xl" />
            <p className="text-sm font-medium">
              🎉 You've seen all available flights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightResults;
