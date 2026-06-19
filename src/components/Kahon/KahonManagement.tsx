"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCashiers } from "@/hooks/useCashiers";
import { useKahonSheets, useInventorySheets } from "@/hooks/useKahon";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import { useEffect } from "react";
import DateRangeCalendar from "./DateRangeCalendar";
import type { DateRangeQueryType } from "../../../utils/types/kahon.type";
import KahonAgGrid from "./KahonAgGrid";
import InventoryAgGrid from "./InventoryAgGrid";

export default function KahonManagement() {
  const [selectedCashier, setSelectedCashier] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"kahon" | "inventory">("kahon");
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState<DateRangeQueryType>(() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    return { startDate: today, endDate: tomorrowStr };
  });

  const {
    data: cashiers = [],
    isLoading: cashiersLoading,
    isError: cashiersError,
    error: cashiersErrorObj,
  } = useCashiers();

  const {
    data: kahonData = [],
    isLoading: kahonLoading,
    isError: kahonError,
    error: kahonErrorObj,
    refetch: refetchKahon,
  } = useKahonSheets(dateRange);

  const {
    data: inventoryData = [],
    isLoading: inventoryLoading,
    isError: inventoryError,
    error: inventoryErrorObj,
  } = useInventorySheets(dateRange);

  useEffect(() => {
    if (cashiersError && cashiersErrorObj) {
      toast.error(extractNestError(cashiersErrorObj));
    }
  }, [cashiersError, cashiersErrorObj]);

  useEffect(() => {
    if (kahonError && kahonErrorObj) {
      toast.error(extractNestError(kahonErrorObj));
    }
  }, [kahonError, kahonErrorObj]);

  useEffect(() => {
    if (inventoryError && inventoryErrorObj) {
      toast.error(extractNestError(inventoryErrorObj));
    }
  }, [inventoryError, inventoryErrorObj]);

  const cashierKahonSheets = useMemo(() => {
    if (!selectedCashier) return [];
    return kahonData.filter(
      (sheet: any) => sheet.cashierId === selectedCashier
    );
  }, [kahonData, selectedCashier]);

  const cashierInventorySheets = useMemo(() => {
    if (!selectedCashier) return [];
    return inventoryData.filter(
      (sheet: any) => sheet.cashierId === selectedCashier
    );
  }, [inventoryData, selectedCashier]);

  const selectedCashierData = useMemo(() => {
    if (!Array.isArray(cashiers)) return undefined;
    return cashiers.find((c: any) => c.id === selectedCashier);
  }, [cashiers, selectedCashier]);

  const currentKahonSheet = useMemo(() => {
    return (
      cashierKahonSheets.find((s: any) => s.cashierId === selectedCashier)
        ?.sheet ?? undefined
    );
  }, [cashierKahonSheets, selectedCashier]);

  const currentInventorySheet = useMemo(() => {
    return (
      cashierInventorySheets.find((s: any) => s.cashierId === selectedCashier)
        ?.sheet ?? undefined
    );
  }, [cashierInventorySheets, selectedCashier]);

  const handleDateRangeChange = useCallback(
    (startDate: string, endDate: string) => {
      setDateRange({ startDate, endDate });
    },
    []
  );

  const handleApplyDateFilter = useCallback(() => {
    setShowCalendar(false);
  }, []);

  const loadSheets = useCallback(() => {
    refetchKahon();
    // inventory refetch triggers automatically via query key change
  }, [refetchKahon]);

  if (cashiersLoading && !selectedCashier) {
    return <div className="p-4">Loading cashiers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Kahon Management</h1>

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
              cashiers.map((cashier: any) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.name}
                </option>
              ))}
          </select>
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
                <Button
                  onClick={() => setShowCalendar(!showCalendar)}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100"
                  size="sm"
                >
                  <span className="mr-1">🗓️</span>
                  {showCalendar ? "Hide Calendar" : "Select Date"}
                </Button>
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

            {kahonLoading || inventoryLoading ? (
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
