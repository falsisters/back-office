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
  const [localStartDate, setLocalStartDate] = useState(
    startDate || new Date().toISOString().split("T")[0]
  );
  const [localEndDate, setLocalEndDate] = useState(
    endDate || new Date().toISOString().split("T")[0]
  );

  const handleStartDateChange = (date: string) => {
    setLocalStartDate(date);
    onDateRangeChange(date, localEndDate);
  };

  const handleEndDateChange = (date: string) => {
    setLocalEndDate(date);
    onDateRangeChange(localStartDate, date);
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split("T")[0];
    setLocalStartDate(today);
    setLocalEndDate(today);
    onDateRangeChange(today, today);
  };

  const handleYesterdayClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    setLocalStartDate(yesterdayStr);
    setLocalEndDate(yesterdayStr);
    onDateRangeChange(yesterdayStr, yesterdayStr);
  };

  const handleThisWeekClick = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const lastDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 6)
    );

    const startStr = firstDayOfWeek.toISOString().split("T")[0];
    const endStr = lastDayOfWeek.toISOString().split("T")[0];

    setLocalStartDate(startStr);
    setLocalEndDate(endStr);
    onDateRangeChange(startStr, endStr);
  };

  const handleThisMonthClick = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    const startStr = firstDayOfMonth.toISOString().split("T")[0];
    const endStr = lastDayOfMonth.toISOString().split("T")[0];

    setLocalStartDate(startStr);
    setLocalEndDate(endStr);
    onDateRangeChange(startStr, endStr);
  };

  return (
    <div
      className={`bg-white border border-gray-300 rounded-lg p-4 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Select Date Range</h3>
        <button
          onClick={onApply}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Apply Filter
        </button>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleTodayClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          Today
        </button>
        <button
          onClick={handleYesterdayClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          Yesterday
        </button>
        <button
          onClick={handleThisWeekClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          This Week
        </button>
        <button
          onClick={handleThisMonthClick}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          This Month
        </button>
      </div>

      {/* Date Range Display */}
      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <strong>Selected Range:</strong>{" "}
        {localStartDate === localEndDate
          ? new Date(localStartDate).toLocaleDateString()
          : `${new Date(localStartDate).toLocaleDateString()} - ${new Date(
              localEndDate
            ).toLocaleDateString()}`}
      </div>
    </div>
  );
}
