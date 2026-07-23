// FlightResults.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FaClock,
  FaUser,
  FaSuitcase,
  FaPlane,
  FaExclamationTriangle,
  FaSearch,
  FaInfoCircle,
} from "react-icons/fa";
import { MdFlight } from "react-icons/md";

// Skeleton Loading Component
const FlightResultSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative animate-pulse">
      {/* Refundable Badge Skeleton */}
      <div className="relative h-0">
        <div className="absolute -top-2 -right-2 z-10">
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="p-4">
        {/* Airline and Route Section */}
        <div className="flex items-center justify-between gap-5 mb-3">
          {/* Airline and Flight Number */}
          <div className="flex items-center gap-2 min-w-30">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="min-w-0">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="flex items-center justify-center px-4 py-2 flex-1">
            {/* Origin */}
            <div className="text-right min-w-20">
              <div className="h-3 w-8 bg-gray-200 rounded mx-auto"></div>
              <div className="h-7 w-12 bg-gray-200 rounded mt-1 mx-auto"></div>
              <div className="h-4 w-10 bg-gray-200 rounded mt-1 mx-auto"></div>
              <div className="h-3 w-14 bg-gray-200 rounded mt-1 mx-auto"></div>
            </div>

            {/* Flight Path */}
            <div className="flex-1 flex flex-col items-center px-4 max-w-45">
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-0.5 bg-gray-200"></div>
                <div className="shrink-0">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                <div className="h-3 w-3 bg-gray-200 rounded"></div>
                <div className="h-3 w-14 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Destination */}
            <div className="text-left min-w-20">
              <div className="h-3 w-8 bg-gray-200 rounded"></div>
              <div className="h-7 w-12 bg-gray-200 rounded mt-1"></div>
              <div className="h-4 w-10 bg-gray-200 rounded mt-1"></div>
              <div className="h-3 w-14 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>

          {/* Price and Book Button */}
          <div className="flex items-center gap-3 mt-2 min-w-35 shrink-0">
            <div className="text-right">
              <div className="h-3 w-14 bg-gray-200 rounded ml-auto"></div>
              <div className="h-7 w-16 bg-gray-200 rounded mt-1 ml-auto"></div>
            </div>
            <div className="flex flex-col items-end">
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Flight Details Skeleton */}
        <div className="mt-3 pt-3 border-dashed border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Infinite Loader Component - Shows skeletons while loading more, or a scroll hint
const InfiniteLoader = ({ isLoading, hasMore, onLoadMore }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    if (!isLoading && hasMore && currentLoaderRef) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            onLoadMore();
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(currentLoaderRef);

      return () => {
        if (currentLoaderRef) {
          observer.unobserve(currentLoaderRef);
        }
      };
    }
  }, [isLoading, hasMore, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={loaderRef} className="space-y-4">
      {isLoading ? (
        // Show skeleton items when loading more
        <>
          <FlightResultSkeleton />
          <FlightResultSkeleton />
        </>
      ) : (
        // Show scroll indicator when not loading but hasMore
        <div className="py-4 flex justify-center">
          <div className="text-sm text-gray-400">Scroll for more flights</div>
        </div>
      )}
    </div>
  );
};

// Error State Component
const FlightResultsError = ({ error, onRetry }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-red-100 p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-3xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 mb-4 max-w-md">
          {error || "We couldn't load the flight results. Please try again."}
        </p>
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
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
  // External pagination props (optional – for API-based infinite scroll)
  hasMore: externalHasMore = null,
  isLoadingMore = false,
  onLoadMore = null,
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  // Track previous flights to reset page when flights change
  const [prevFlights, setPrevFlights] = useState(flights);

  // Memoize totalFlights
  const totalFlights = useMemo(() => flights || [], [flights]);

  // Reset page to 1 when totalFlights changes (new search results)
  // This is done during render, not in an effect, to avoid cascading renders
  if (totalFlights !== prevFlights) {
    setPrevFlights(totalFlights);
    setPage(1);
  }

  // Compute visible flights based on current page
  const visibleFlights = useMemo(() => {
    return totalFlights.slice(0, page * itemsPerPage);
  }, [totalFlights, page, itemsPerPage]);

  // Determine if there are more flights to show (client-side pagination)
  const hasMoreFlights = visibleFlights.length < totalFlights.length;

  // Use external hasMore if provided (for API pagination), otherwise use internal
  const effectiveHasMore = onLoadMore ? (externalHasMore ?? false) : hasMoreFlights;

  // Load more flights when infinite scroll triggers
  const loadMoreFlights = useCallback(() => {
    // If using external pagination, call the parent handler
    if (onLoadMore) {
      if (isLoadingMore || !externalHasMore || loading) return;
      onLoadMore();
      return;
    }

    // Internal client-side pagination
    if (isLoadingMore || !hasMoreFlights || loading) return;

    const nextPage = page + 1;
    const endIndex = nextPage * itemsPerPage;

    if (endIndex <= totalFlights.length) {
      setPage(nextPage);
    }
  }, [
    page,
    itemsPerPage,
    totalFlights,
    hasMoreFlights,
    externalHasMore,
    isLoadingMore,
    loading,
    onLoadMore,
  ]);

  // Show skeleton loading for initial load
  if (loading && !totalFlights.length) {
    return (
      <div className="space-y-5">
        {[...Array(3)].map((_, index) => (
          <FlightResultSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return <FlightResultsError error={error} onRetry={onRetry} />;
  }

  if (!totalFlights || totalFlights.length === 0) {
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

  const shouldShowLoader = effectiveHasMore || isLoadingMore;
  const reachedEnd = !effectiveHasMore && visibleFlights.length === totalFlights.length && visibleFlights.length > 0;

  return (
    <div className="space-y-5">
      {visibleFlights.map((flight, index) => {
        const segments = flight.Onwards || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        // Use first segment for origin info, last segment for destination info
        const originData = firstSegment;
        const destinationData = lastSegment;

        const fare = flight.FareBreakdown?.[0];
        const totalTime = flight.TotalTravelTimes?.[0];
        const isExpanded = expandedIndex === index;
        const brandedFareInfo = flight.BrandedFareInfoes?.[0];

        if (!originData || !destinationData) return null;

        // Determine if this is a multi-segment flight
        const isMultiSegment = segments.length > 1;

        return (
          <div
            key={`${flight.Id || index}-${index}`}
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
                {/* Airline and Flight Number - Show first airline */}
                <div className="flex items-center gap-2 min-w-30">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white shrink-0">
                    <MdFlight className="text-white text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-semibold text-gray-800 truncate max-w-30">
                      {originData.CarrierName || "Airline"}
                    </h1>
                    <p className="text-xs text-gray-500">
                      {originData.Carrier}
                      {originData.FlightNumber}
                      {isMultiSegment && (
                        <span className="text-blue-500 ml-1">
                          +{segments.length - 1} more
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="flex items-center justify-center px-4 py-2 flex-1">
                  {/* Origin - Use first segment */}
                  <div className="text-right min-w-20">
                    <p className="text-xs text-gray-500 font-medium">From</p>
                    <p className="text-xl font-bold text-blue-600">
                      {originData.Origin}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(originData.DepartureTime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(originData.DepartureTime)}
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

                  {/* Destination - Use last segment */}
                  <div className="text-left min-w-20">
                    <p className="text-xs text-gray-500 font-medium">To</p>
                    <p className="text-xl font-bold text-blue-600">
                      {destinationData.Destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(destinationData.ArrivalTime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(destinationData.ArrivalTime)}
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
                    {originData.CarrierName || "Airline"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-medium shrink-0">Flight:</span>
                  <span className="truncate">
                    {originData.Carrier}
                    {originData.FlightNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <FaClock className="text-blue-400 shrink-0" />
                  <span>{totalTime?.TotalTravelDuration}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 min-w-0">
                  <FaSuitcase className="text-blue-400 shrink-0" />
                  <span
                    className="truncate"
                    title={originData.AirBaggageAllowance}
                  >
                    {truncateText(originData.AirBaggageAllowance, 25) || "N/A"}
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
                          title={originData.CarrierName}
                        >
                          {truncateText(originData.CarrierName, 30)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flight Number:</span>
                        <span className="font-medium">
                          {originData.Carrier}
                          {originData.FlightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aircraft:</span>
                        <span
                          className="font-medium truncate max-w-50"
                          title={originData.Equipment}
                        >
                          {truncateText(originData.Equipment, 25) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Operating Carrier:
                        </span>
                        <span
                          className="font-medium truncate max-w-50"
                          title={originData.OperatingCarrierName}
                        >
                          {truncateText(
                            originData.OperatingCarrierName ||
                              originData.CarrierName,
                            25,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operating Flight:</span>
                        <span className="font-medium">
                          {originData.OperatingCarrier}
                          {originData.OperatingFlightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Code:</span>
                        <span className="font-medium">
                          {originData.BookingCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Count:</span>
                        <span className="font-medium">
                          {originData.BookingCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fare Basis:</span>
                        <span
                          className="font-medium truncate max-w-50"
                          title={originData.FareBasis}
                        >
                          {truncateText(originData.FareBasis, 25) || "N/A"}
                        </span>
                      </div>

                      {/* Show all segments in expanded view */}
                      {isMultiSegment && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="font-semibold text-gray-600 text-sm mb-2">
                            All Segments ({segments.length})
                          </h5>
                          {segments.map((segment, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-2 rounded border border-gray-200 mb-2 text-xs"
                            >
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {segment.Origin} → {segment.Destination}
                                </span>
                                <span className="font-medium">
                                  {segment.Carrier}
                                  {segment.FlightNumber}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-500">
                                <span>
                                  {formatTime(segment.DepartureTime)} -{" "}
                                  {formatTime(segment.ArrivalTime)}
                                </span>
                                <span>{segment.TravelDuration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                    {originData.Currency || "BDT"}
                  </div>
                  {isMultiSegment && (
                    <div>
                      <span className="font-medium">Segments:</span>{" "}
                      {segments.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Infinite Loader - shows skeletons when loading more, or scroll hint */}
      {shouldShowLoader && (
        <InfiniteLoader
          isLoading={isLoadingMore}
          hasMore={effectiveHasMore}
          onLoadMore={loadMoreFlights}
        />
      )}

      {/* End of list message - shown when no more flights to load */}
      {reachedEnd && (
        <div className="text-center py-6 mt-2 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <FaInfoCircle className="text-blue-400 text-lg" />
            <p className="text-sm font-medium">
              No more flights available. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightResults;