"use client";

import { useState } from "react";

interface DateRangeCalendarProps {
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onApply: () => void;
  className?: string;
}

export default function DateRangeCalendar({
  startDate = "",
  endDate = "",
  onDateRangeChange,
  onApply,
  className = "",
}: DateRangeCalendarProps) {
  // Ensure we always have a valid date in YYYY-MM-DD format
  const getCurrentDateString = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(
    startDate || getCurrentDateString()
  );

  // Helper function to get next day in YYYY-MM-DD format
  const getNextDay = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00.000Z"); // Ensure UTC parsing
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (date: string) => {
    // Validate the date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error("Invalid date format:", date);
      return;
    }

    setSelectedDate(date);
    const nextDay = getNextDay(date);
    console.log("Date range changed:", { start: date, end: nextDay });
    onDateRangeChange(date, nextDay);
  };

  const handleTodayClick = () => {
    const today = getCurrentDateString();
    handleDateChange(today);
  };

  const handleYesterdayClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    handleDateChange(yesterdayStr);
  };

  const handleThisWeekClick = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    const startStr = firstDayOfWeek.toISOString().split("T")[0];
    handleDateChange(startStr);
  };

  const handleThisMonthClick = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startStr = firstDayOfMonth.toISOString().split("T")[0];
    handleDateChange(startStr);
  };

  const nextDayDate = getNextDay(selectedDate);

  return (
    <div
      className={`bg-white border border-gray-300 rounded-lg p-4 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <span>📅</span>
          <span>Select Date</span>
        </h3>
        <button
          onClick={onApply}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center space-x-1"
        >
          <span>✅</span>
          <span>Apply Filter</span>
        </button>
      </div>

      {/* Single Date Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: YYYY-MM-DD. This will show data for the selected day until the
          next day.
        </p>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleTodayClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center space-x-1"
        >
          <span>📍</span>
          <span>Today</span>
        </button>
        <button
          onClick={handleYesterdayClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center space-x-1"
        >
          <span>⏮️</span>
          <span>Yesterday</span>
        </button>
        <button
          onClick={handleThisWeekClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center space-x-1"
        >
          <span>📊</span>
          <span>This Week Start</span>
        </button>
        <button
          onClick={handleThisMonthClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center space-x-1"
        >
          <span>📈</span>
          <span>This Month Start</span>
        </button>
      </div>

      {/* Date Range Display */}
      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <strong>Date Range:</strong>{" "}
        <span className="font-mono">
          {selectedDate} to {nextDayDate}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          Backend will receive: startDate={selectedDate}, endDate={nextDayDate}
        </div>
      </div>
    </div>
  );
}
