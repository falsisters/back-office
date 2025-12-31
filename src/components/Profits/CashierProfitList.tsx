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

  // Initial data loading effect - uses single optimized dashboard summary endpoint
  useEffect(() => {
    const loadProfits = async () => {
      if (!cashierId) return;

      try {
        setIsLoading(true);
        console.log("🔄 PROFITS: Loading profits for cashier:", cashierId);
        console.log("🔄 PROFITS: dateFilterMode:", dateFilterMode);

        // Determine the date to use for the dashboard summary
        let dateStr: string;

        if (dateFilterMode === "day" && date) {
          // Day mode: use the selected date
          dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        } else {
          // Month mode: use today's date if it's in the selected month, 
          // otherwise use the last day of the selected month
          const now = new Date();
          const nowYear = now.getFullYear();
          const nowMonth = now.getMonth() + 1;

          if (selectedYear === nowYear && selectedMonth === nowMonth) {
            // Current month - use today
            dateStr = `${nowYear}-${String(nowMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          } else {
            // Past month - use the last day of that month
            const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
          }
        }

        console.log("🔄 PROFITS: Fetching dashboard summary for date:", dateStr);
        
        // Single API call - dashboard summary contains all the data we need
        const summary = await getProfitDashboardSummary(cashierId, dateStr);
        console.log("📊 PROFITS: Dashboard summary:", summary);
        
        setDashboardSummary(summary);

        if (dateFilterMode === "day") {
          // Day mode: show only current day data
          setProfitData({
            rawItems: summary.currentDayProfit.rawItems,
            sacks: { totalProfit: summary.currentDayProfit.sackTotal },
            asin: { totalProfit: summary.currentDayProfit.asinTotal },
            overallTotal: summary.currentDayProfit.overallTotal,
          });
        } else {
          // Month mode: show all items (previous + current day)
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
        }
        
        // Also set allProfitData for reference
        setAllProfitData({
          rawItems: [
            ...summary.previousDaysProfit.rawItems,
            ...summary.currentDayProfit.rawItems,
          ],
        });
      } catch (error) {
        console.error("❌ PROFITS: Error loading profits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfits();
  }, [cashierId, dateFilterMode, selectedYear, selectedMonth, date]);

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
