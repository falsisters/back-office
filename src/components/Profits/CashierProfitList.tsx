"use client";

import { useEffect, useState } from "react";
import {
  getProfitsByCashier,
  getAllProfitsByCashier,
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
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
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

  // Initial data loading effect - matches Sales component pattern
  useEffect(() => {
    const loadProfits = async () => {
      if (!cashierId) return;

      try {
        setIsLoading(true);
        console.log("🔄 PROFITS: Loading profits for cashier:", cashierId);
        console.log("🔄 PROFITS: dateFilterMode:", dateFilterMode);
        console.log(
          "🔄 PROFITS: formattedSelectedMonth:",
          formattedSelectedMonth
        );

        if (dateFilterMode === "day" && date) {
          // NEW: Use the optimized dashboard summary endpoint for "day" mode
          // Use local date components to avoid UTC conversion issues
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          console.log("🔄 PROFITS: Fetching dashboard summary for date:", dateStr);
          
          const summary = await getProfitDashboardSummary(cashierId, dateStr);
          console.log("📊 PROFITS: Dashboard summary:", summary);
          
          setDashboardSummary(summary);
          
          // Set current day data as the main profit data for display
          setProfitData({
            rawItems: summary.currentDayProfit.rawItems,
            sacks: { totalProfit: summary.currentDayProfit.sackTotal },
            asin: { totalProfit: summary.currentDayProfit.asinTotal },
            overallTotal: summary.currentDayProfit.overallTotal,
          });
          
          // Also set allProfitData for month mode switching
          setAllProfitData({
            rawItems: [
              ...summary.previousDaysProfit.rawItems,
              ...summary.currentDayProfit.rawItems,
            ],
          });
        } else {
          // For month mode, use the existing getAllProfitsByCashier
          const data = await getAllProfitsByCashier(cashierId);

          console.log("📊 PROFITS: Raw data from backend:", data);
          console.log(
            "📊 PROFITS: Raw items count:",
            data?.rawItems?.length || 0
          );

          setAllProfitData(data);
          setDashboardSummary(null);

          // Filter for the selected month
          if (data?.rawItems) {
            const [year, month] = formattedSelectedMonth.split("-").map(Number);
            console.log("🔍 PROFITS: Filtering for month:", year, month);
            const filteredItems = data.rawItems.filter((item: any) => {
              if (!item.saleDate) return false;
              
              // Convert UTC timestamp to Manila time for proper month comparison
              // Manila is UTC+8
              const utcDate = new Date(item.saleDate);
              const manilaTime = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
              
              const itemYear = manilaTime.getUTCFullYear();
              const itemMonth = manilaTime.getUTCMonth() + 1; // 1-indexed
              
              const match = itemYear === year && itemMonth === month;
              return match;
            });

            console.log(
              "✅ PROFITS: Filtered items count:",
              filteredItems.length
            );

            setProfitData({
              ...data,
              rawItems: filteredItems,
            });
          } else {
            setProfitData(data);
          }
        }
      } catch (error) {
        console.error("❌ PROFITS: Error loading profits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfits();
  }, [cashierId, dateFilterMode, formattedSelectedMonth, date]);

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
    // For day mode, use the dashboard summary which has pre-calculated MTD data
    if (dateFilterMode === "day" && dashboardSummary) {
      console.log(
        "🔄 PREVIOUS DAYS: Using dashboard summary, items count:",
        dashboardSummary.previousDaysProfit.rawItems.length
      );
      return transformProfitData({
        rawItems: dashboardSummary.previousDaysProfit.rawItems,
      });
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
