"use client";

import { useEffect, useState } from "react";
import { getAllSalesByUserId } from "@/lib/server/getAllSalesByUserId";
import ProfitTracker from "@/components/Sales/ProfitTracker";
import { type SackType } from "../../../../utils/types/schema.type";
import type { GetAllSalesByUserIdPayload } from "../../../../utils/types/getAllSalesByUserId.type";
import { SalesFilters } from "@/components/Sales/SalesFilter";
import { Spinner } from "@/components/ui/spinner";

export default function ProfitList() {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [filteredSales, setFilteredSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterMode, setDateFilterMode] = useState<"day" | "month">("day");
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [previousDaySales, setPreviousDaySales] = useState<GetAllSalesByUserIdPayload>([]);
  
  const formattedSelectedMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSalesByUserId();
        setSales(data);
        
        let filtered;
        let previousDayFiltered: { id: string; cashierId: string; totalAmount: number; paymentMethod: "CASH" | "BANK_TRANSFER" | "CHECK"; createdAt: Date; updatedAt: Date; cashier: { id: string; createdAt: Date; updatedAt: Date; name: string; accessKey: string; secureCode: string; permissions: ("SALES" | "DELIVERIES" | "STOCKS" | "EDIT_PRICE" | "KAHON" | "PROFITS" | "ATTACHMENTS" | "SALES_HISTORY")[]; userId: string; inventoryId?: string | null | undefined; kahonId?: string | null | undefined; }; SaleItem: { id: string; createdAt: Date; updatedAt: Date; quantity: number; isDiscounted: boolean; productId: string; saleId: string; isGantang: boolean; isSpecialPrice: boolean; product: { id: string; createdAt: Date; updatedAt: Date; name: string; userId: string; picture: string; SackPrice: { type: "FIFTY_KG" | "TWENTY_FIVE_KG" | "FIVE_KG"; price: number; profit: number; specialPrice?: { price: number; profit: number; } | undefined; }[]; perKiloPrice?: { price: number; profit: number; } | undefined; }; discountedPrice?: number | null | undefined; sackPriceId?: string | null | undefined; sackType?: "FIFTY_KG" | "TWENTY_FIVE_KG" | "FIVE_KG" | null | undefined; perKiloPriceId?: string | null | undefined; }[]; }[];

        if (dateFilterMode === "day") {
          const selectedDate = date || new Date();
          const previousDate = new Date(selectedDate);
          previousDate.setDate(previousDate.getDate() - 1);

          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.toDateString() === selectedDate.toDateString();
          });

          previousDayFiltered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.toDateString() === previousDate.toDateString();
          });
        } else {
          const [year, month] = formattedSelectedMonth.split('-').map(Number);
          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.getFullYear() === year && saleDate.getMonth() === month - 1;
          });
          previousDayFiltered = []; // No previous data needed for monthly view
        }
        
        setFilteredSales(filtered);
        setPreviousDaySales(previousDayFiltered || []);
      } catch (error) {
        console.error("Error loading sales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, [dateFilterMode, date, formattedSelectedMonth]);

  useEffect(() => {
    let filtered = [...sales];

    if (dateFilterMode === "day" && date) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.toDateString() === date.toDateString();
      });
    } else if (dateFilterMode === "month") {
      const [year, month] = formattedSelectedMonth.split('-').map(Number);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.getFullYear() === year && saleDate.getMonth() === month - 1;
      });
    }

    setFilteredSales(filtered);
  }, [date, sales, dateFilterMode, formattedSelectedMonth]);

  const mappedSalesData = filteredSales.flatMap((sale) =>
    sale.SaleItem.map((item) => {
      const isSack = !!item.sackPriceId;
      const priceType: 'sack' | 'per-kilo' = isSack ? "sack" : "per-kilo";
      const sackType = item.sackType as SackType | undefined;
      const sackPrice = item.product.SackPrice.find(sp => sp.type === sackType) || item.product.SackPrice[0];
      
      let originalProfit = 0;

      if (isSack) {
        originalProfit = sackPrice?.profit || 0;
      } else {
        originalProfit = item.product.perKiloPrice?.profit || 0;
      }

      const normalProfit = originalProfit;
      const specialProfit = 0;

      return {
        productKey: `${item.product.name}-${sackType || "perKilo"}-${priceType}`,
        productName: item.product.name,
        productImage: item.product.picture,
        sackType: sackType,
        priceType: priceType,
        normalQty: item.quantity,
        specialQty: 0,
        isAsin: item.product.name.toLowerCase().includes("asin"),
        normalProfit: normalProfit,
        specialProfit: specialProfit,
      };
    })
  );

  const previousDayMappedSalesData = previousDaySales.flatMap((sale) =>
    sale.SaleItem.map((item) => {
      const isSack = !!item.sackPriceId;
      const priceType: 'sack' | 'per-kilo' = isSack ? "sack" : "per-kilo";
      const sackType = item.sackType as SackType | undefined;
      const sackPrice = item.product.SackPrice.find(sp => sp.type === sackType) || item.product.SackPrice[0];
      
      let originalProfit = 0;

      if (isSack) {
        originalProfit = sackPrice?.profit || 0;
      } else {
        originalProfit = item.product.perKiloPrice?.profit || 0;
      }

      const normalProfit = originalProfit;
      const specialProfit = 0;

      return {
        productKey: `${item.product.name}-${sackType || "perKilo"}-${priceType}`,
        productName: item.product.name,
        productImage: item.product.picture,
        sackType: sackType,
        priceType: priceType,
        normalQty: item.quantity,
        specialQty: 0,
        isAsin: item.product.name.toLowerCase().includes("asin"),
        normalProfit: normalProfit,
        specialProfit: specialProfit,
      };
    })
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Profit Tracker</h1>
      
      <SalesFilters
        dateFilterMode={dateFilterMode}
        setDateFilterMode={setDateFilterMode}
        date={date}
        setDate={setDate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        productFilter={""} // Not used in ProfitList
        setProductFilter={() => {}} // Not used in ProfitList
        viewMode={"perProduct"} // Not used in ProfitList
        setViewMode={() => {}} // Not used in ProfitList
        paymentFilter={"ALL"} // Not used in ProfitList
        setPaymentFilter={() => {}} // Not used in ProfitList
        sackKiloFilter={"ALL"} // Not used in ProfitList
        setSackKiloFilter={() => {}} // Not used in ProfitList
        asinOtherFilter={"ALL"} // Not used in ProfitList
        setAsinOtherFilter={() => {}} // Not used in ProfitList
        hideExtraFilters={true} // Add this prop to SalesFilters to hide unused filters
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <Spinner/>
          <p className="text-gray-500 mt-4">Loading profit data...</p>
        </div>
      ) : (
        <>
          {filteredSales.length > 0 || previousDaySales.length > 0 ? (
            <ProfitTracker 
              salesData={mappedSalesData} 
              previousDaySalesData={previousDayMappedSalesData}
              selectedDate={date || new Date()}
              dateFilterMode={dateFilterMode}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 text-lg">No profit data available for the selected period.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}