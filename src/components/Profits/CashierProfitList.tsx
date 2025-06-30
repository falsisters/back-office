"use client";

import { useEffect, useState } from "react";
import { getProfitsByCashier, getAllProfitsByCashier } from "@/lib/server/Profits/getProfitsByCashier";
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
  const [allProfitData, setAllProfitData] = useState<any>(null);
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

  // Initial data loading effect - matches Sales component pattern
  useEffect(() => {
    const loadProfits = async () => {
      if (!cashierId) return;

      try {
        setIsLoading(true);
        console.log("🔄 PROFITS: Loading profits for cashier:", cashierId);
        console.log("🔄 PROFITS: dateFilterMode:", dateFilterMode);
        console.log("🔄 PROFITS: formattedSelectedMonth:", formattedSelectedMonth);
        
        // Always get ALL profit data without date filtering from backend
        // Use the new getAllProfitsByCashier which fetches data for multiple dates
        const data = await getAllProfitsByCashier(cashierId);
        
        console.log("📊 PROFITS: Raw data from backend:", data);
        console.log("📊 PROFITS: Raw items count:", data?.rawItems?.length || 0);
        
        if (data?.rawItems) {
          console.log("📊 PROFITS: All raw items:", data.rawItems.map((item: any) => ({
            productName: item.productName,
            saleDate: item.saleDate,
            quantity: item.quantity,
            profitPerUnit: item.profitPerUnit
          })));
        }
        
        setAllProfitData(data);

        // Initial filtering based on current mode
        if (data?.rawItems) {
          let filteredItems;
          if (dateFilterMode === "day") {
            const today = new Date();
            console.log("🔍 PROFITS: Filtering for today:", today.toDateString());
            filteredItems = data.rawItems.filter((item: any) => {
              if (!item.saleDate) return false;
              const itemDate = new Date(item.saleDate);
              const match = itemDate.toDateString() === today.toDateString();
              console.log(`🔍 PROFITS: Item date ${itemDate.toDateString()} vs today ${today.toDateString()}: ${match}`);
              return match;
            });
          } else {
            const [year, month] = formattedSelectedMonth.split("-").map(Number);
            console.log("🔍 PROFITS: Filtering for month:", year, month);
            filteredItems = data.rawItems.filter((item: any) => {
              if (!item.saleDate) return false;
              const itemDate = new Date(item.saleDate);
              const match = itemDate.getFullYear() === year && itemDate.getMonth() === month - 1;
              console.log(`🔍 PROFITS: Item date ${itemDate.getFullYear()}-${itemDate.getMonth() + 1} vs ${year}-${month}: ${match}`);
              return match;
            });
          }
          
          console.log("✅ PROFITS: Filtered items count:", filteredItems.length);
          console.log("✅ PROFITS: Filtered items:", filteredItems.map((item: any) => ({
            productName: item.productName,
            saleDate: item.saleDate,
            quantity: item.quantity,
            profitPerUnit: item.profitPerUnit
          })));
          
          setProfitData({
            ...data,
            rawItems: filteredItems
          });
        } else {
          console.log("⚠️ PROFITS: No rawItems in data, setting data as is");
          setProfitData(data);
        }
      } catch (error) {
        console.error("❌ PROFITS: Error loading profits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfits();
  }, [cashierId, dateFilterMode, formattedSelectedMonth]);

  // Separate filtering effect - matches Sales component pattern
  useEffect(() => {
    if (!allProfitData?.rawItems) {
      console.log("🔍 PROFITS: No allProfitData.rawItems to filter");
      return;
    }

    console.log("🔄 PROFITS: Re-filtering data...");
    console.log("🔄 PROFITS: Current date:", date);
    console.log("🔄 PROFITS: dateFilterMode:", dateFilterMode);
    console.log("🔄 PROFITS: formattedSelectedMonth:", formattedSelectedMonth);
    console.log("🔄 PROFITS: allProfitData.rawItems count:", allProfitData.rawItems.length);

    let filteredItems = [...allProfitData.rawItems];

    if (dateFilterMode === "day" && date) {
      console.log("🔍 PROFITS: Filtering by day:", date.toDateString());
      filteredItems = filteredItems.filter((item: any) => {
        if (!item.saleDate) return false;
        const itemDate = new Date(item.saleDate);
        const match = itemDate.toDateString() === date.toDateString();
        console.log(`🔍 PROFITS: Item ${item.productName} date ${itemDate.toDateString()} vs selected ${date.toDateString()}: ${match}`);
        return match;
      });
    } else if (dateFilterMode === "month") {
      const [year, month] = formattedSelectedMonth.split("-").map(Number);
      console.log("🔍 PROFITS: Filtering by month:", year, month);
      filteredItems = filteredItems.filter((item: any) => {
        if (!item.saleDate) return false;
        const itemDate = new Date(item.saleDate);
        const match = itemDate.getFullYear() === year && itemDate.getMonth() === month - 1;
        console.log(`🔍 PROFITS: Item ${item.productName} date ${itemDate.getFullYear()}-${itemDate.getMonth() + 1} vs selected ${year}-${month}: ${match}`);
        return match;
      });
    }

    console.log("✅ PROFITS: Final filtered items count:", filteredItems.length);
    console.log("✅ PROFITS: Final filtered items:", filteredItems.map((item: any) => ({
      productName: item.productName,
      saleDate: item.saleDate,
      quantity: item.quantity,
      profitPerUnit: item.profitPerUnit
    })));

    setProfitData({
      ...allProfitData,
      rawItems: filteredItems
    });
  }, [date, allProfitData, dateFilterMode, formattedSelectedMonth]);
  // Transform profit data to match ProfitTracker expected format
  const transformProfitData = (data: any) => {
    console.log("🔄 TRANSFORM: Starting transformation with data:", data);
    
    if (!data?.rawItems) {
      console.log("⚠️ TRANSFORM: No rawItems in data");
      return [];
    }

    console.log("🔄 TRANSFORM: Raw items to transform:", data.rawItems.length);

    const transformed = data.rawItems.map((item: any) => {
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
      
      return {
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

    console.log("✅ TRANSFORM: Transformed items:", transformed.length);
    console.log("✅ TRANSFORM: Final transformed data:", transformed);
    
    return transformed;
  };

  // Calculate previous day's profit data
  const getPreviousDayProfitData = () => {
    if (!allProfitData?.rawItems || dateFilterMode !== "day" || !date) {
      return [];
    }

    console.log("🔄 PREVIOUS DAY: Calculating previous day profit data");
    console.log("🔄 PREVIOUS DAY: Selected date:", date.toDateString());

    // Calculate previous day
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    
    console.log("🔄 PREVIOUS DAY: Previous day date:", previousDay.toDateString());

    // Filter items for previous day
    const previousDayItems = allProfitData.rawItems.filter((item: any) => {
      if (!item.saleDate) return false;
      const itemDate = new Date(item.saleDate);
      const match = itemDate.toDateString() === previousDay.toDateString();
      if (match) {
        console.log(`✅ PREVIOUS DAY: Found item for ${previousDay.toDateString()}:`, item.productName);
      }
      return match;
    });

    console.log("✅ PREVIOUS DAY: Items found:", previousDayItems.length);

    if (previousDayItems.length === 0) {
      console.log("⚠️ PREVIOUS DAY: No items found for previous day");
      return [];
    }

    // Transform previous day items
    const previousDayData = {
      ...allProfitData,
      rawItems: previousDayItems
    };

    const transformedPreviousDay = transformProfitData(previousDayData);
    console.log("✅ PREVIOUS DAY: Transformed previous day data:", transformedPreviousDay);
    
    return transformedPreviousDay;
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
      ) : (        <>
          {profitData && transformProfitData(profitData).length > 0 ? (
            <ProfitTracker
              salesData={transformProfitData(profitData)}
              previousDaySalesData={getPreviousDayProfitData()}
              selectedDate={
                dateFilterMode === "day" 
                  ? (date || new Date())
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
                    ? `No profit data found for this cashier on ${date?.toLocaleDateString() || "the selected date"}`
                    : `No profit data found for this cashier in ${new Date(dateFilterMode === "month" ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01` : Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Profit data will appear here once this cashier records sales transactions.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
