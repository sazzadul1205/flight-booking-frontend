// src/components/TravelerClassPicker.jsx
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus, FaUser, FaChild, FaBaby } from "react-icons/fa";

const TravelerClassPicker = ({
  selectedTravelers,
  onTravelerChange,
  onClose,
}) => {
  const pickerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const classTypes = ["Economy", "Business"];

  const [travelers, setTravelers] = useState({
    adults: selectedTravelers?.adults || 1,
    children: selectedTravelers?.children || 0,
    infants: selectedTravelers?.infants || 0,
    classType: selectedTravelers?.classType || "Economy",
  });

  const totalTravelers =
    travelers.adults + travelers.children + travelers.infants;

  const handleIncrement = (type) => {
    setTravelers((prev) => {
      const newValue = prev[type] + 1;
      // Max limits
      if (type === "adults" && newValue > 9) return prev;
      if (type === "children" && newValue > 8) return prev;
      if (type === "infants" && newValue > travelers.adults) return prev;
      return { ...prev, [type]: newValue };
    });
  };

  const handleDecrement = (type) => {
    setTravelers((prev) => {
      const newValue = prev[type] - 1;
      if (type === "adults" && newValue < 1) return prev;
      if (type === "children" && newValue < 0) return prev;
      if (type === "infants" && newValue < 0) return prev;
      // Infants can't be more than adults
      if (type === "infants" && newValue > prev.adults) return prev;
      return { ...prev, [type]: newValue };
    });
  };

  const handleClassSelect = (classType) => {
    setTravelers((prev) => ({ ...prev, classType }));
  };

  const handleDone = () => {
    onTravelerChange(travelers);
    onClose();
  };

  const getTravelerLabel = () => {
    if (totalTravelers === 0) return "0 Traveler";
    return `${totalTravelers} Traveler${totalTravelers > 1 ? "s" : ""}`;
  };

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-blue-100 p-5 w-80"
    >
      {/* Adults */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <FaUser />
          </div>
          <div>
            <p className="font-semibold text-blue-900 text-sm">Adults</p>
            <p className="text-[10px] text-blue-400">Age 12+</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleDecrement("adults")}
            disabled={travelers.adults <= 1}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              travelers.adults <= 1
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <FaMinus className="text-xs" />
          </button>
          <span className="w-6 text-center font-semibold text-blue-900">
            {travelers.adults}
          </span>
          <button
            type="button"
            onClick={() => handleIncrement("adults")}
            disabled={travelers.adults >= 9}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              travelers.adults >= 9
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>

      {/* Children - Grayed Out */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <FaChild />
          </div>
          <div>
            <p className="font-semibold text-gray-400 text-sm">Children</p>
            <p className="text-[10px] text-gray-400">Age 2-11</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={true}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed"
          >
            <FaMinus className="text-xs" />
          </button>
          <span className="w-6 text-center font-semibold text-gray-400">
            {travelers.children}
          </span>
          <button
            type="button"
            disabled={true}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed"
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>

      {/* Infants - Grayed Out */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <FaBaby />
          </div>
          <div>
            <p className="font-semibold text-gray-400 text-sm">Infants</p>
            <p className="text-[10px] text-gray-400">Under 2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={true}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed"
          >
            <FaMinus className="text-xs" />
          </button>
          <span className="w-6 text-center font-semibold text-gray-400">
            {travelers.infants}
          </span>
          <button
            type="button"
            disabled={true}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed"
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>

      {/* Class Selection */}
      <div className="py-3 border-b border-gray-100">
        <p className="font-semibold text-blue-900 text-sm mb-2">Class</p>
        <div className="grid grid-cols-2 gap-2">
          {classTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleClassSelect(type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                travelers.classType === type
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-blue-900">
            {getTravelerLabel()}
          </p>
          <p className="text-[10px] text-blue-400">{travelers.classType}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelerClassPicker;
