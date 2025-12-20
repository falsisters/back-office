"use client";

import { useEffect, useState } from "react";
import { getSalesByCashier } from "@/lib/server/Sales/getSalesByCashier";
import SalesSummary from "./SalesSummary";
import type { PaymentMethodEnum } from "../../../utils/types/schema.type";
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/Sales/getAllSalesByUserId.type";
import { SalesFilters } from "./SalesFilter";
import { SalesDateGroup } from "./SalesDateGroup";
import { NoSalesFound } from "./NoSalesFound";
import { LoadingSales } from "./LoadingSales";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CashierSalesListProps {
  cashierId: string;
  refreshTrigger?: number;
}

export default function CashierSalesList({
  cashierId,
  refreshTrigger,
}: CashierSalesListProps) {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [filteredSales, setFilteredSales] =
    useState<GetAllSalesByUserIdPayload>([]);
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
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    () => new Date().getMonth() + 1
  );

  const formattedSelectedMonth = `${selectedYear}-${String(
    selectedMonth
  ).padStart(2, "0")}`;

  // Format date for API call (matches profit component pattern)
  const formatDateForAPI = (inputDate?: Date) => {
    if (!inputDate) return undefined;

    if (dateFilterMode === "day") {
      // Use local date components to avoid UTC conversion issues
      return `${inputDate.getFullYear()}-${String(inputDate.getMonth() + 1).padStart(2, '0')}-${String(inputDate.getDate()).padStart(2, '0')}`;
    } else {
      return `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    }
  };

  // Separate function to refresh data without loading state
  const refreshSalesData = async () => {
    if (!cashierId) return;

    try {
      const apiDate = formatDateForAPI(date);
      // Bypass cache for real-time updates
      const data = await getSalesByCashier(cashierId, apiDate, true);
      setSales(data);
      // No client-side filtering needed - backend already filters by date
      setFilteredSales(data);
    } catch (error) {
      console.error("Error refreshing cashier sales:", error);
    }
  };

  useEffect(() => {
    const loadSales = async () => {
      if (!cashierId) return;

      try {
        setIsLoading(true);
        const apiDate = formatDateForAPI(date);
        // Fetch sales for the specific date from backend
        const data = await getSalesByCashier(cashierId, apiDate, false);
        setSales(data);
        // No client-side date filtering needed - backend already filters by date
        setFilteredSales(data);
      } catch (error) {
        console.error("Error loading sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSales();
  }, [cashierId, date, dateFilterMode, selectedYear, selectedMonth]);

  // Effect to handle refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refreshSalesData();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    // Date filtering is now handled by backend
    // Only apply local filters: payment, product, sackKilo, asinOther
    let filtered = [...sales];

    if (paymentFilter !== "ALL") {
      filtered = filtered.filter(
        (sale) => sale.paymentMethod === paymentFilter
      );
    }

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

    filtered = filtered
      .map((sale: (typeof sales)[number]) => ({
        ...sale,
        SaleItem: sale.SaleItem.filter((item) => {
          const isSack = !!item.sackPriceId;
          const isPerKilo = !!item.perKiloPriceId;
          return (
            sackKiloFilter === "ALL" ||
            (sackKiloFilter === "SACKS" && isSack) ||
            (sackKiloFilter === "PER_KILO" && isPerKilo)
          );
        }),
      }))
      .filter((sale: (typeof sales)[number]) => sale.SaleItem.length > 0);

    filtered = filtered
      .map((sale: (typeof sales)[number]) => ({
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
      .filter((sale: (typeof sales)[number]) => sale.SaleItem.length > 0);

    setFilteredSales(filtered);
  }, [
    productFilter,
    paymentFilter,
    sackKiloFilter,
    asinOtherFilter,
    sales,
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

          {filteredSales.length > 0 && <SalesSummary sales={filteredSales} />}
        </>
      )}
    </div>
  );
}
