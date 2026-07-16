import { useState } from "react";

const TravelDropdown = () => {
  const [isTravelOpen, setIsTravelOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    kids: 0,
    infants: 0,
  });
  const [selectedClass, setSelectedClass] = useState("premium-economy");

  const totalTravelers =
    travelers.adults + travelers.children + travelers.kids + travelers.infants;

  const updateTraveler = (type, change) => {
    setTravelers((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + change),
    }));
  };

  const classLabels = {
    economy: "Economy",
    "premium-economy": "Premium Economy",
    business: "Business",
    "first-class": "First Class",
  };

  // Close other dropdown when opening one
  const handleTravelToggle = () => {
    setIsTravelOpen(!isTravelOpen);
    if (!isTravelOpen) setIsClassOpen(false);
  };

  const handleClassToggle = () => {
    setIsClassOpen(!isClassOpen);
    if (!isClassOpen) setIsTravelOpen(false);
  };

  return (
    <div className="flex items-center gap-5 font-sans">
      {/* Traveler Dropdown */}
      <div className="relative">
        {/* Trigger Button */}
        <div className="" onClick={handleTravelToggle}>
          <div className="flex items-center justify-between bg-blue-200 text-[#1882FF] px-5 py-1 cursor-pointer">
            <div className="flex items-center gap-2 ">
              <p className=" font-semibold text-sm ">
                {totalTravelers}{" "}
                <span>{totalTravelers === 1 ? "Traveller" : "Travellers"}</span>
              </p>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isTravelOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Traveler Dropdown Content */}
        {isTravelOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-5 z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium text-sm">Adults</p>
                  <p className="text-gray-400 text-xs">12 years & above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("adults", -1);
                    }}
                  >
                    −
                  </button>
                  <span className="text-gray-800 font-semibold w-5 text-center">
                    {travelers.adults}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("adults", 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium text-sm">Children</p>
                  <p className="text-gray-400 text-xs">From 5 to under 12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("children", -1);
                    }}
                  >
                    −
                  </button>
                  <span className="text-gray-800 font-semibold w-5 text-center">
                    {travelers.children}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("children", 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium text-sm">Kids</p>
                  <p className="text-gray-400 text-xs">From 2 to under 5</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("kids", -1);
                    }}
                  >
                    −
                  </button>
                  <span className="text-gray-800 font-semibold w-5 text-center">
                    {travelers.kids}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("kids", 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium text-sm">Infants</p>
                  <p className="text-gray-400 text-xs">Under 2 years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("infants", -1);
                    }}
                  >
                    −
                  </button>
                  <span className="text-gray-800 font-semibold w-5 text-center">
                    {travelers.infants}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-lg font-light hover:border-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTraveler("infants", 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition duration-150 text-sm shadow-sm"
              onClick={() => setIsTravelOpen(false)}
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Class Select Dropdown */}
      <div className="relative">
        {/* Trigger Button */}
        <div
          className="flex items-center justify-between bg-blue-200 text-[#1882FF] px-5 py-1 cursor-pointer"
          onClick={handleClassToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className=" font-semibold text-sm">
                {classLabels[selectedClass]}
              </span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isClassOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Class Dropdown Content */}
        {isClassOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50">
            <div className="space-y-1">
              {[
                { value: "economy", label: "Economy" },
                { value: "premium-economy", label: "Premium Economy" },
                { value: "business", label: "Business" },
                { value: "first-class", label: "First Class" },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${
                    selectedClass === option.value
                      ? "bg-indigo-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedClass(option.value);
                    setIsClassOpen(false);
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedClass === option.value
                        ? "border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedClass === option.value && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                  <span className="text-gray-800 text-sm font-medium">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelDropdown;
