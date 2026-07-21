import { useState, useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DatePicker = ({ selectedDate, onDateChange, onClose }) => {
  // Get today's date
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // State for calendar navigation
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.month ?? currentMonth,
  );
  const [viewYear, setViewYear] = useState(selectedDate?.year ?? currentYear);

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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const shortMonthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Previous month days
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        month: viewMonth - 1,
        year: viewYear,
        isOtherMonth: true,
        isDisabled: true,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(viewYear, viewMonth, i);
      const isPast =
        date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday =
        i === currentDay &&
        viewMonth === currentMonth &&
        viewYear === currentYear;

      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isToday,
        isPast,
        isDisabled: isPast,
        isOtherMonth: false,
      });
    }

    // Next month days
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: viewMonth + 1,
        year: viewYear,
        isOtherMonth: true,
        isDisabled: true,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDateSelect = (day, month, year) => {
    if (
      year < currentYear ||
      (year === currentYear && month < currentMonth) ||
      (year === currentYear && month === currentMonth && day < currentDay)
    ) {
      return;
    }

    const date = new Date(year, month, day);
    const dayName = date.toLocaleString("default", { weekday: "long" });
    onDateChange({
      full: `${day} ${shortMonthNames[month]}'${year.toString().slice(-2)}`,
      dayName,
      day,
      month,
      year,
    });
    onClose();
  };

  const goToPrevMonth = () => {
    if (viewMonth === currentMonth && viewYear === currentYear) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDateSelected = (day, month, year) => {
    return (
      selectedDate?.day === day &&
      selectedDate?.month === month &&
      selectedDate?.year === year
    );
  };

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 w-80"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className={`p-1 rounded-lg transition-all ${
            viewMonth === currentMonth && viewYear === currentYear
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-blue-50 text-blue-600"
          }`}
          disabled={viewMonth === currentMonth && viewYear === currentYear}
        >
          <FaChevronLeft />
        </button>
        <span className="font-semibold text-blue-900">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1 hover:bg-blue-50 rounded-lg text-blue-600 transition-all"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-semibold text-blue-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const isSelected = isDateSelected(date.day, date.month, date.year);
          const isPast = date.isPast || date.isDisabled;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateSelect(date.day, date.month, date.year)}
              disabled={isPast}
              className={`
                p-2 rounded-lg text-center text-sm transition-all relative
                ${
                  isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : isSelected
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                      : "hover:bg-blue-50 text-blue-900"
                }
                ${date.isToday && !isSelected ? "border border-blue-300" : ""}
                ${date.isOtherMonth ? "text-gray-300" : ""}
              `}
            >
              {date.day}
              {date.isToday && !isSelected && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-blue-100 flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            handleDateSelect(
              today.getDate(),
              today.getMonth(),
              today.getFullYear(),
            );
          }}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Today
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DatePicker;
