"use client";

import { useEffect, useState } from "react";
import {
  getProfitDashboardSummary,
} from "@/lib/server/Profits/getProfitsByCashier";
import ProfitTracker from "@/components/Sales/ProfitTracker";
import { type SackType } from "../../../utils/types/schema.type";
import { SalesFilters } from "@/components/Sales/SalesFilter";
import { Spinner } from "@/components/ui/spinner";

interface CashierProfitListProps {
  cashierId: string;
}

interface DashboardSummary {
  date: string;
  previousDaysProfit: {
    sackTotal: number;
    asinTotal: number;
    overallTotal: number;
    rawItems: any[];
  };
  currentDayProfit: {
    sackTotal: number;
    asinTotal: number;
    overallTotal: number;
    rawItems: any[];
  };
  overallProfit: number;
}

export default function CashierProfitList({
  cashierId,
}: CashierProfitListProps) {
  const [allProfitData, setAllProfitData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  // Cache for day mode data (keyed by date string)
  const [daySummaryCache, setDaySummaryCache] = useState<Record<string, DashboardSummary>>({});
  // Cache for month mode data (today's summary for current month total)
  const [monthSummary, setMonthSummary] = useState<DashboardSummary | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterMode, setDateFilterMode] = useState<"day" | "month">("day");
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    () => new Date().getMonth() + 1
  );

  const formattedSelectedMonth = `${selectedYear}-${String(
    selectedMonth
  ).padStart(2, "0")}`;

  // Get today's date string for caching
  const getTodayDateStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Helper to update profitData for day mode
  const updateDayProfitData = (summary: DashboardSummary) => {
    setProfitData({
      rawItems: summary.currentDayProfit.rawItems,
      sacks: { totalProfit: summary.currentDayProfit.sackTotal },
      asin: { totalProfit: summary.currentDayProfit.asinTotal },
      overallTotal: summary.currentDayProfit.overallTotal,
    });
    setAllProfitData({
      rawItems: [
        ...summary.previousDaysProfit.rawItems,
        ...summary.currentDayProfit.rawItems,
      ],
    });
  };

  // Helper to update profitData for month mode (uses overallProfit = monthly total)
  const updateMonthProfitData = (summary: DashboardSummary) => {
    const allItems = [
      ...summary.previousDaysProfit.rawItems,
      ...summary.currentDayProfit.rawItems,
    ];
    setProfitData({
      rawItems: allItems,
      sacks: { totalProfit: summary.previousDaysProfit.sackTotal + summary.currentDayProfit.sackTotal },
      asin: { totalProfit: summary.previousDaysProfit.asinTotal + summary.currentDayProfit.asinTotal },
      overallTotal: summary.overallProfit,
    });
  };

  // Track the current request to prevent race conditions
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Effect for DAY mode - fetches when date changes
  useEffect(() => {
    if (dateFilterMode !== "day" || !cashierId || !date) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Check cache first - no async needed
    if (daySummaryCache[dateStr]) {
      console.log("🔄 PROFITS: Using cached day data for:", dateStr);
      updateDayProfitData(daySummaryCache[dateStr]);
      setIsLoading(false);
      return;
    }

    // Generate a unique request ID for this fetch
    const requestId = `${dateStr}-${Date.now()}`;
    setCurrentRequestId(requestId);

    const loadDayProfits = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 PROFITS: Fetching day data for:", dateStr, "requestId:", requestId);
        
        const summary = await getProfitDashboardSummary(cashierId, dateStr);
        
        // Check if this request is still the current one (not stale)
        setCurrentRequestId(currentId => {
          if (currentId !== requestId) {
            console.log("⚠️ PROFITS: Stale request ignored:", requestId, "current:", currentId);
            return currentId; // Don't update state, request is stale
          }
          
          console.log("📊 PROFITS: Day summary (valid):", summary);
          
          // Cache the result
          setDaySummaryCache(prev => ({ ...prev, [dateStr]: summary }));
          
          // If this is today, also cache it as month summary
          if (dateStr === getTodayDateStr()) {
            setMonthSummary(summary);
          }
          
          updateDayProfitData(summary);
          setIsLoading(false);
          
          return currentId;
        });
      } catch (error) {
        console.error("❌ PROFITS: Error loading day profits:", error);
        setIsLoading(false);
      }
    };

    loadDayProfits();
  }, [cashierId, date, dateFilterMode]);

  // Effect for MONTH mode - uses today's data for current month total
  useEffect(() => {
    if (dateFilterMode !== "month" || !cashierId) return;

    const todayStr = getTodayDateStr();
    
    // Check if we have today's data cached (from day mode or previous month load)
    if (monthSummary && monthSummary.date === todayStr) {
      console.log("🔄 PROFITS: Using cached month data (no API call)");
      updateMonthProfitData(monthSummary);
      setIsLoading(false);
      return;
    }
    
    // Check if today's data is in day cache
    if (daySummaryCache[todayStr]) {
      console.log("🔄 PROFITS: Using today's day cache for month view");
      const summary = daySummaryCache[todayStr];
      setMonthSummary(summary);
      updateMonthProfitData(summary);
      setIsLoading(false);
      return;
    }

    // Generate a unique request ID
    const requestId = `month-${todayStr}-${Date.now()}`;
    setCurrentRequestId(requestId);

    const loadMonthProfits = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 PROFITS: Fetching month data (today's summary):", todayStr);
        
        const summary = await getProfitDashboardSummary(cashierId, todayStr);
        
        // Check if this request is still the current one
        setCurrentRequestId(currentId => {
          if (currentId !== requestId) {
            console.log("⚠️ PROFITS: Stale month request ignored:", requestId);
            return currentId;
          }
          
          console.log("📊 PROFITS: Month summary (valid):", summary);
          
          // Cache it
          setMonthSummary(summary);
          setDaySummaryCache(prev => ({ ...prev, [todayStr]: summary }));
          
          updateMonthProfitData(summary);
          setIsLoading(false);
          
          return currentId;
        });
      } catch (error) {
        console.error("❌ PROFITS: Error loading month profits:", error);
        setIsLoading(false);
      }
    };

    loadMonthProfits();
  }, [cashierId, dateFilterMode]);

  // Transform profit data to match ProfitTracker expected format
  const transformProfitData = (data: any) => {
    console.log("🔄 TRANSFORM: Starting transformation with data:", data);

    if (!data?.rawItems) {
      console.log("⚠️ TRANSFORM: No rawItems in data");
      return [];
    }

    console.log("🔄 TRANSFORM: Raw items to transform:", data.rawItems.length);

    const transformed = data.rawItems
      .map((item: any) => {
        // Proper sack type mapping based on the actual data structure
        let sackType: SackType | undefined;

        if (item.sackType) {
          // Direct mapping from the database sackType field
          sackType = item.sackType as SackType;
        } else if (item.priceType) {
          // Fallback mapping from priceType field
          switch (item.priceType) {
            case "50KG":
            case "FIFTY_KG":
              sackType = "FIFTY_KG";
              break;
            case "25KG":
            case "TWENTY_FIVE_KG":
              sackType = "TWENTY_FIVE_KG";
              break;
            case "5KG":
            case "FIVE_KG":
              sackType = "FIVE_KG";
              break;
            default:
              sackType = undefined;
          }
        }

        // Ensure numeric values from the processed decimal strings
        const quantity =
          typeof item.quantity === "number"
            ? item.quantity
            : parseFloat(item.quantity || "0");
        const profitPerUnit =
          typeof item.profitPerUnit === "number"
            ? item.profitPerUnit
            : parseFloat(item.profitPerUnit || "0");

        return {
          productKey: `${item.productName}-${sackType || "perKilo"}-${
            sackType ? "sack" : "per-kilo"
          }`,
          productName: item.productName,
          productImage:
            item.productImage || "https://placehold.co/800x800?text=Product",
          sackType: sackType,
          priceType: sackType ? ("sack" as const) : ("per-kilo" as const),
          normalQty: quantity,
          specialQty: 0,
          isAsin: item.isAsin || false,
          normalProfit: profitPerUnit,
          specialProfit: 0,
        };
      })
      .filter((item: any) => item.priceType === "sack"); // Only return sack items

    console.log("✅ TRANSFORM: Transformed items:", transformed.length);
    console.log("✅ TRANSFORM: Final transformed data:", transformed);

    return transformed;
  };

  // NEW: Get previous days profit data from dashboard summary (MTD excluding current day)
  const getPreviousDaysProfitData = () => {
    // For day mode, use the cached day summary which has pre-calculated MTD data
    if (dateFilterMode === "day" && date) {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const cachedSummary = daySummaryCache[dateStr];
      if (cachedSummary) {
        console.log(
          "🔄 PREVIOUS DAYS: Using cached day summary, items count:",
          cachedSummary.previousDaysProfit.rawItems.length
        );
        return transformProfitData({
          rawItems: cachedSummary.previousDaysProfit.rawItems,
        });
      }
    }

    // For month mode, no previous days concept applies
    return [];
  };

  return (
    <div className="space-y-6">
      <SalesFilters
        dateFilterMode={dateFilterMode}
        setDateFilterMode={setDateFilterMode}
        date={date}
        setDate={setDate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        productFilter={""}
        setProductFilter={() => {}}
        viewMode={"perProduct"}
        setViewMode={() => {}}
        paymentFilter={"ALL"}
        setPaymentFilter={() => {}}
        sackKiloFilter={"ALL"}
        setSackKiloFilter={() => {}}
        asinOtherFilter={"ALL"}
        setAsinOtherFilter={() => {}}
        hideExtraFilters={true}
        title="Profit Filters"
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <Spinner />
          <p className="text-gray-500 mt-4">Loading profit data...</p>
        </div>
      ) : (
        <>
          {profitData && transformProfitData(profitData).length > 0 ? (
            <ProfitTracker
              salesData={transformProfitData(profitData)}
              previousDaySalesData={getPreviousDaysProfitData()}
              selectedDate={
                dateFilterMode === "day"
                  ? date || new Date()
                  : new Date(selectedYear, selectedMonth - 1, 1) // First day of selected month/year
              }
              dateFilterMode={dateFilterMode}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center p-8">
                <div className="text-6xl text-gray-400 mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Cashier Profit Data
                </h3>
                <p className="text-gray-500 mb-4">
                  {dateFilterMode === "day"
                    ? `No profit data found for this cashier on ${
                        date?.toLocaleDateString() || "the selected date"
                      }`
                    : `No profit data found for this cashier in ${new Date(
                        dateFilterMode === "month"
                          ? `${selectedYear}-${String(selectedMonth).padStart(
                              2,
                              "0"
                            )}-01`
                          : Date.now()
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}`}
                </p>
                <p className="text-sm text-gray-400">
                  Profit data will appear here once this cashier records sales
                  transactions.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
