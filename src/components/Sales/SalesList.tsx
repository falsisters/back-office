// components/SalesList.tsx
"use client";

import { useEffect, useState } from "react";
import { getAllSalesByUserId } from "@/lib/server/getAllSalesByUserId";
import SalesSummary from "./SalesSummary";
import ProfitTracker from "./ProfitTracker";
import { PaymentMethodEnum, type SackType } from "../../../utils/types/schema.type";
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { SalesFilters } from "./SalesFilter";
import { SalesDateGroup } from "./SalesDateGroup";
import { NoSalesFound } from "./NoSalesFound";
import { LoadingSales } from "./LoadingSales";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SalesList() {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [filteredSales, setFilteredSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [productFilter, setProductFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<
    typeof PaymentMethodEnum._type | "ALL"
  >("ALL");
  const [sackKiloFilter, setSackKiloFilter] = useState<
    "ALL" | "SACKS" | "PER_KILO"
  >("ALL");
  const [asinOtherFilter, setAsinOtherFilter] = useState<
    "ALL" | "ASIN" | "OTHER"
  >("ALL");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"perSale" | "perProduct">("perSale");
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

    // Date filter based on mode
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

    // Payment filter
    if (paymentFilter !== "ALL") {
      filtered = filtered.filter(
        (sale) => sale.paymentMethod === paymentFilter
      );
    }

    // Product name filter
    if (productFilter) {
      filtered = filtered
        .map((sale) => ({
          ...sale,
          SaleItem: sale.SaleItem.filter((item) =>
            item.product.name
              .toLowerCase()
              .includes(productFilter.toLowerCase())
          ),
        }))
        .filter((sale) => sale.SaleItem.length > 0);
    }

    // Sack/Kilo filter
    filtered = filtered
      .map((sale) => ({
        ...sale,
        SaleItem: sale.SaleItem.filter((item) => {
          const isSack = item.product.SackPrice.length > 0;
          return (
            sackKiloFilter === "ALL" ||
            (sackKiloFilter === "SACKS" && isSack) ||
            (sackKiloFilter === "PER_KILO" && !isSack)
          );
        }),
      }))
      .filter((sale) => sale.SaleItem.length > 0);

    // Asin/Other filter
    filtered = filtered
      .map((sale) => ({
        ...sale,
        SaleItem: sale.SaleItem.filter((item) => {
          const isAsin = item.product.name.toLowerCase().includes("asin");
          return (
            asinOtherFilter === "ALL" ||
            (asinOtherFilter === "ASIN" && isAsin) ||
            (asinOtherFilter === "OTHER" && !isAsin)
          );
        }),
      }))
      .filter((sale) => sale.SaleItem.length > 0);

    setFilteredSales(filtered);
  }, [
    productFilter,
    paymentFilter,
    sackKiloFilter,
    asinOtherFilter,
    date,
    sales,
    dateFilterMode,
    formattedSelectedMonth,
  ]);

  const groupSalesByDate = () => {
    const grouped: Record<string, GetAllSalesByUserIdPayload> = {};

    filteredSales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      let dateKey;
      
      if (dateFilterMode === "day") {
        dateKey = saleDate.toLocaleDateString("en-PH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        dateKey = `${months[selectedMonth - 1]} ${selectedYear}`;
      }

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(sale);
    });

    return grouped;
  };

  const groupedSales = groupSalesByDate();

  const mappedSalesData = Object.values(groupedSales).flatMap((dateSales) =>
    dateSales.flatMap((sale) =>
      sale.SaleItem.map((item) => {
        const sackType = item.product.SackPrice[0]?.type as SackType | undefined;
        const isSpecial = item.isSpecialPrice;

        const normalProfit = isSpecial
          ? item.product.SackPrice[0]?.specialPrice?.profit || 0
          : item.product.SackPrice[0]?.profit ||
            item.product.perKiloPrice?.profit ||
            0;
        const specialProfit = isSpecial
          ? item.product.SackPrice[0]?.specialPrice?.profit || 0
          : 0;

        return {
          productKey: `${item.product.name}-${sackType || "perKilo"}-${
            isSpecial ? "special" : "normal"
          }`,
          productName: `${item.product.name} ${
            sackType ? sackTypeLabels[sackType] : ""
          }`,
          normalQty: !isSpecial ? item.quantity : 0,
          specialQty: isSpecial ? item.quantity : 0,
          isAsin: item.product.name.toLowerCase().includes("asin"),
          normalProfit: !isSpecial ? normalProfit : 0,
          specialProfit: isSpecial ? specialProfit : 0,
        };
      })
    )
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Sales</h1>
      
      <SalesFilters
        dateFilterMode={dateFilterMode}
        setDateFilterMode={setDateFilterMode}
        date={date}
        setDate={setDate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        sackKiloFilter={sackKiloFilter}
        setSackKiloFilter={setSackKiloFilter}
        asinOtherFilter={asinOtherFilter}
        setAsinOtherFilter={setAsinOtherFilter}
      />

      {isLoading ? (
        <LoadingSales />
      ) : (
        <>
          {Object.entries(groupSalesByDate()).map(([dateString, sales]) => (
            <SalesDateGroup
              key={dateString}
              dateString={dateString}
              sales={sales}
              viewMode={viewMode}
              dateFilterMode={dateFilterMode}
            />
          ))}

          {filteredSales.length === 0 && <NoSalesFound />}

          {filteredSales.length > 0 && (
            <>
              <SalesSummary sales={filteredSales} />
              <ProfitTracker salesData={mappedSalesData} />
            </>
          )}
        </>
      )}
    </div>
  );
}

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
};