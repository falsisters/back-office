"use client";

import { useEffect, useState } from "react";
import { getAllSalesByUserId } from "@/lib/server/getAllSalesByUserId";
import ProfitTracker from "@/components/Sales/ProfitTracker";
import { type SackType } from "../../../../utils/types/schema.type";
import type { GetAllSalesByUserIdPayload } from "../../../../utils/types/getAllSalesByUserId.type";
import { SalesFilters } from "@/components/Sales/SalesFilter";
import { LoadingSales } from "@/components/Sales/LoadingSales";

export default function ProfitList() {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [filteredSales, setFilteredSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterMode, setDateFilterMode] = useState<"day" | "month">("day");
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  
  const formattedSelectedMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSalesByUserId();
        setSales(data);
        
        let filtered;
        if (dateFilterMode === "day") {
          const today = new Date();
          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.toDateString() === today.toDateString();
          });
        } else {
          const [year, month] = formattedSelectedMonth.split('-').map(Number);
          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.getFullYear() === year && saleDate.getMonth() === month - 1;
          });
        }
        
        setFilteredSales(filtered);
      } catch (error) {
        console.error("Error loading sales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, [dateFilterMode, formattedSelectedMonth]);

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
      
      const isSpecial = item.isSpecialPrice;
      const sackPrice = item.product.SackPrice.find(sp => sp.type === sackType) || item.product.SackPrice[0];
      
      let basePrice = 0;
      let originalProfit = 0;

      if (isSack) {
        if (isSpecial && sackPrice?.specialPrice?.price) {
          basePrice = sackPrice.specialPrice.price;
          originalProfit = sackPrice.specialPrice.profit || 0;
        } else {
          basePrice = sackPrice?.price || 0;
          originalProfit = sackPrice?.profit || 0;
        }
      } else {
        basePrice = item.product.perKiloPrice?.price || 0;
        originalProfit = item.product.perKiloPrice?.profit || 0;
      }

      if (item.isDiscounted && item.discountedPrice) {
        const discountAmount = basePrice - item.discountedPrice;
        originalProfit -= discountAmount;
      }

      const normalProfit = !isSpecial ? originalProfit : 0;
      const specialProfit = isSpecial ? originalProfit : 0;

      return {
        productKey: `${item.product.name}-${sackType || "perKilo"}-${priceType}`,
        productName: item.product.name,
        sackType: sackType,
        priceType: priceType,
        normalQty: !isSpecial ? item.quantity : 0,
        specialQty: isSpecial ? item.quantity : 0,
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
        <LoadingSales />
      ) : (
        <>
          {filteredSales.length > 0 ? (
            <ProfitTracker salesData={mappedSalesData} />
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