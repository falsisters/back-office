"use client";

import { useEffect, useState } from "react";
import { getProfitsByCashier } from "@/lib/server/getProfitsByCashier";
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

    return data.rawItems.map((item: any) => ({
      productKey: `${item.productName}-${item.priceType || "perKilo"}-sack`,
      productName: item.productName,
      productImage: "https://placehold.co/800x800?text=Product",
      sackType:
        item.priceType === "50KG"
          ? "FIFTY_KG"
          : item.priceType === "25KG"
          ? "TWENTY_FIVE_KG"
          : item.priceType === "5KG"
          ? "FIVE_KG"
          : undefined,
      priceType: "sack" as const,
      normalQty: item.quantity,
      specialQty: 0,
      isAsin: item.isAsin,
      normalProfit: item.profitPerUnit,
      specialProfit: 0,
    }));
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
