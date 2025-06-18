"use client";

import { useEffect, useState } from "react";
import { getProfitsByCashier } from "@/lib/server/Profits/getProfitsByCashier";
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
  const [profitData, setProfitData] = useState<any>(null);
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

  useEffect(() => {
    const loadProfits = async () => {
      if (!cashierId) return;

      try {
        setIsLoading(true);
        const dateParam =
          dateFilterMode === "day"
            ? date?.toISOString().split("T")[0]
            : `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;

        const data = await getProfitsByCashier(cashierId, dateParam);
        setProfitData(data);
      } catch (error) {
        console.error("Error loading profits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfits();
  }, [cashierId, dateFilterMode, date, selectedYear, selectedMonth]);
  // Transform profit data to match ProfitTracker expected format
  const transformProfitData = (data: any) => {
    if (!data?.rawItems) return [];

    return data.rawItems.map((item: any) => {
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
      }      return {
        productKey: `${item.productName}-${sackType || "perKilo"}-${sackType ? "sack" : "per-kilo"}`,
        productName: item.productName,
        productImage: item.productImage || "https://placehold.co/800x800?text=Product",
        sackType: sackType,
        priceType: sackType ? ("sack" as const) : ("per-kilo" as const),
        normalQty: item.quantity || 0,
        specialQty: 0,
        isAsin: item.isAsin || false,
        normalProfit: item.profitPerUnit ?? 0,
        specialProfit: 0,
      };
    }).filter((item: any) => item.priceType === "sack"); // Only return sack items
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
          {profitData ? (
            <ProfitTracker
              salesData={transformProfitData(profitData)}
              previousDaySalesData={[]}
              selectedDate={date || new Date()}
              dateFilterMode={dateFilterMode}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 text-lg">
                No profit data available for the selected period.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
