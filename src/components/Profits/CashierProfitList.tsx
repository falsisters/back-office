"use client";

import { useState, useMemo } from "react";
import { useProfitDashboardSummary } from "@/hooks/useProfits";
import ProfitTracker from "@/components/Sales/ProfitTracker";
import { type SackType } from "../../../utils/types/schema.type";
import { SalesFilters } from "@/components/Sales/SalesFilter";
import { Spinner } from "@/components/ui/spinner";

interface CashierProfitListProps {
  cashierId: string;
}

export default function CashierProfitList({
  cashierId,
}: CashierProfitListProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateFilterMode, setDateFilterMode] = useState<"day" | "month">("day");
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    () => new Date().getMonth() + 1
  );

  const getTodayDateStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const dateStr =
    dateFilterMode === "day"
      ? date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
        : getTodayDateStr()
      : getTodayDateStr();

  const { data: summary, isLoading } = useProfitDashboardSummary(
    cashierId,
    dateStr
  );

  const profitData = useMemo(() => {
    if (!summary) return null;

    if (dateFilterMode === "day") {
      return {
        rawItems: summary.currentDayProfit.rawItems,
        sacks: { totalProfit: summary.currentDayProfit.sackTotal },
        asin: { totalProfit: summary.currentDayProfit.asinTotal },
        overallTotal: summary.currentDayProfit.overallTotal,
      };
    }

    const allItems = [
      ...summary.previousDaysProfit.rawItems,
      ...summary.currentDayProfit.rawItems,
    ];
    return {
      rawItems: allItems,
      sacks: {
        totalProfit:
          summary.previousDaysProfit.sackTotal +
          summary.currentDayProfit.sackTotal,
      },
      asin: {
        totalProfit:
          summary.previousDaysProfit.asinTotal +
          summary.currentDayProfit.asinTotal,
      },
      overallTotal: summary.overallProfit,
    };
  }, [summary, dateFilterMode]);

  const transformProfitData = (data: any) => {
    if (!data?.rawItems) return [];

    return data.rawItems
      .map((item: any) => {
        let sackType: SackType | undefined;

        if (item.sackType) {
          sackType = item.sackType as SackType;
        } else if (item.priceType) {
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
      .filter((item: any) => item.priceType === "sack");
  };

  const getPreviousDaysProfitData = () => {
    if (dateFilterMode === "day" && summary) {
      return transformProfitData({
        rawItems: summary.previousDaysProfit.rawItems,
      });
    }
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
                  : new Date(selectedYear, selectedMonth - 1, 1)
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
