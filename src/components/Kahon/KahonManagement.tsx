"use client";

import { useState, useEffect } from "react";
import { getAllCashiersByUserId } from "@/lib/server/Cashier/getAllCashiersByUserId";
import { getKahonSheetsByDateRange } from "@/lib/server/Kahon/getKahonSheets";
import { getInventorySheetsByDateRange } from "@/lib/server/Kahon/getInventorySheets";
import DateRangeCalendar from "./DateRangeCalendar";
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/Cashier/getAllCashiersByUserId.type";
import type {
  CashierSheetResponse,
  CashierInventorySheetResponse,
  DateRangeQueryType,
} from "../../../utils/types/kahon.type";
import KahonAgGrid from "./KahonAgGrid";
import InventoryAgGrid from "./InventoryAgGrid";

export default function KahonManagement() {
  const [cashiers, setCashiers] = useState<GetAllCashiersByUserIdPayload>([]);
  const [selectedCashier, setSelectedCashier] = useState<string>("");
  const [kahonSheets, setKahonSheets] = useState<CashierSheetResponse[]>([]);
  const [inventorySheets, setInventorySheets] = useState<
    CashierInventorySheetResponse[]
  >([]);
  const [activeTab, setActiveTab] = useState<"kahon" | "inventory">("kahon");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeQueryType>(() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return {
      startDate: today,
      endDate: tomorrowStr,
    };
  });
  const [showCalendar, setShowCalendar] = useState(false);

  // Load cashiers on mount
  useEffect(() => {
    const loadCashiers = async () => {
      try {
        const data = await getAllCashiersByUserId();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCashiers(data);
        } else {
          console.error("Expected array but got:", data);
          setCashiers([]);
          setError("Invalid data format received");
        }
      } catch (err) {
        console.error("Error loading cashiers:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load cashiers"
        );
        setCashiers([]); // Ensure cashiers is always an array
      } finally {
        setLoading(false);
      }
    };
    loadCashiers();
  }, []);

  // Load sheets when cashier is selected
  useEffect(() => {
    if (selectedCashier) {
      loadSheets();
    }
  }, [selectedCashier, dateRange]);

  const loadSheets = async () => {
    if (!selectedCashier) return;

    console.log("Loading sheets with date range:", dateRange);
    setLoading(true);
    try {
      const [kahonData, inventoryData] = await Promise.all([
        getKahonSheetsByDateRange(dateRange),
        getInventorySheetsByDateRange(dateRange),
      ]);

      console.log("Received kahon data:", kahonData);
      console.log("Received inventory data:", inventoryData);

      // Ensure data is arrays and filter sheets for selected cashier
      const kahonArray = Array.isArray(kahonData) ? kahonData : [];
      const inventoryArray = Array.isArray(inventoryData) ? inventoryData : [];

      const cashierKahonSheets = kahonArray.filter(
        (sheet) => sheet.cashierId === selectedCashier
      );
      const cashierInventorySheets = inventoryArray.filter(
        (sheet) => sheet.cashierId === selectedCashier
      );

      console.log("Filtered kahon sheets:", cashierKahonSheets);
      console.log("Filtered inventory sheets:", cashierInventorySheets);

      setKahonSheets(cashierKahonSheets);
      setInventorySheets(cashierInventorySheets);
    } catch (err) {
      console.error("Error loading sheets:", err);
      setError(err instanceof Error ? err.message : "Failed to load sheets");
      setKahonSheets([]);
      setInventorySheets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log("Date range changed in KahonManagement:", {
      startDate,
      endDate,
    });
    setDateRange({ startDate, endDate });
  };

  const handleApplyDateFilter = () => {
    if (selectedCashier) {
      loadSheets();
    }
    setShowCalendar(false);
  };

  // Safe array operations with defensive checks
  const selectedCashierData = Array.isArray(cashiers)
    ? cashiers.find((c) => c.id === selectedCashier)
    : undefined;

  const currentKahonSheet = Array.isArray(kahonSheets)
    ? kahonSheets.find((s) => s.cashierId === selectedCashier)?.sheet
    : undefined;

  const currentInventorySheet = Array.isArray(inventorySheets)
    ? inventorySheets.find((s) => s.cashierId === selectedCashier)?.sheet
    : undefined;

  if (loading && !selectedCashier) {
    return <div className="p-4">Loading cashiers...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Kahon Management</h1>

        {/* Cashier Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Cashier:
          </label>
          <select
            value={selectedCashier}
            onChange={(e) => setSelectedCashier(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Cashier --</option>
            {Array.isArray(cashiers) &&
              cashiers.map((cashier) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.name}
                </option>
              ))}
          </select>
          {!Array.isArray(cashiers) && (
            <p className="text-sm text-red-600 mt-1">
              No cashiers available or invalid data format
            </p>
          )}
        </div>

        {selectedCashier && selectedCashierData && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Managing sheets for: {selectedCashierData.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Using AG-Grid Community Edition with formula support and cell
                coloring
              </p>
            </div>

            {/* Date Range Filter */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <span>📅</span>
                    <span>Selected Date:</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(dateRange.startDate).toLocaleDateString()}
                    <span className="text-xs text-gray-500 ml-2">
                      (shows data until{" "}
                      {new Date(dateRange.endDate).toLocaleDateString()})
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm flex items-center space-x-1"
                >
                  <span>🗓️</span>
                  <span>{showCalendar ? "Hide Calendar" : "Select Date"}</span>
                </button>
              </div>

              {showCalendar && (
                <DateRangeCalendar
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onDateRangeChange={handleDateRangeChange}
                  onApply={handleApplyDateFilter}
                  className="mt-2"
                />
              )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("kahon")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "kahon"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Kahon Sheet
                </button>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "inventory"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Inventory Sheet
                </button>
              </nav>
            </div>

            {/* Sheet Content */}
            {loading ? (
              <div className="p-4">Loading sheets...</div>
            ) : (
              <>
                {activeTab === "kahon" && (
                  <KahonAgGrid
                    cashierId={selectedCashier}
                    sheetData={currentKahonSheet}
                    onRefresh={loadSheets}
                  />
                )}
                {activeTab === "inventory" && (
                  <InventoryAgGrid
                    cashierId={selectedCashier}
                    sheetData={currentInventorySheet}
                    onRefresh={loadSheets}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
