"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DateRangeCalendarProps {
  selectedDate?: string;
  onDateChange: (date: string) => void;
  onApply: () => void;
  className?: string;
}

export default function DateRangeCalendar({
  selectedDate = "",
  onDateChange,
  onApply,
  className = "",
}: DateRangeCalendarProps) {
  // Ensure we always have a valid date in YYYY-MM-DD format
  const getCurrentDateString = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const [internalSelectedDate, setInternalSelectedDate] = useState(
    selectedDate || getCurrentDateString()
  );

  const handleDateChange = (date: string) => {
    // Validate the date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error("Invalid date format:", date);
      return;
    }

    setInternalSelectedDate(date);
    console.log("Date changed:", date);
    onDateChange(date);
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

  return (
    <div
      className={`bg-white border border-gray-300 rounded-lg p-4 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <span>📅</span>
          <span>Select Date</span>
        </h3>
        <Button
          onClick={onApply}
          className="bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          <span className="mr-1">✅</span>
          Apply Filter
        </Button>
      </div>

      {/* Single Date Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Date
        </label>
        <input
          type="date"
          value={internalSelectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: YYYY-MM-DD. This will show data for the selected day only.
        </p>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleTodayClick}
          variant="outline"
          className="border-black text-black hover:bg-gray-100"
          size="sm"
        >
          <span className="mr-1">📍</span>
          Today
        </Button>
        <Button
          onClick={handleYesterdayClick}
          className="bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          <span className="mr-1">⏮️</span>
          Yesterday
        </Button>
        <Button
          onClick={handleThisWeekClick}
          variant="outline"
          className="border-black text-black hover:bg-gray-100"
          size="sm"
        >
          <span className="mr-1">📊</span>
          This Week Start
        </Button>
        <Button
          onClick={handleThisMonthClick}
          className="bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          <span className="mr-1">📈</span>
          This Month Start
        </Button>
      </div>

      {/* Selected Date Display */}
      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <strong>Selected Date:</strong>{" "}
        <span className="font-mono">{internalSelectedDate}</span>
        <div className="text-xs text-gray-500 mt-1">
          Backend will receive: date={internalSelectedDate}
        </div>
      </div>
    </div>
  );
}
