"use client";

import { useEffect, useState } from "react";
import { getAllSalesByUserId } from "@/lib/server/Sales/getAllSalesByUserId";
import type { PaymentMethodEnum } from "../../../utils/types/schema.type";
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/Sales/getAllSalesByUserId.type";
import { CashierSelector } from "../Cashier/CashierSelector";
import CashierSalesList from "./CashierSalesList";
import VoidList from "./VoidList";
import { useSocket } from "@/hooks/useSocket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function SalesList() {
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
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { on } = useSocket();

  const formattedSelectedMonth = `${selectedYear}-${String(
    selectedMonth
  ).padStart(2, "0")}`;

  // Format date for API call - always use YYYY-MM-DD format
  const formatDateForAPI = (inputDate?: Date) => {
    const targetDate = inputDate || new Date();
    return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Separate function to load sales without loading state for real-time updates
    const refreshSalesData = async () => {
      try {
        const apiDate = formatDateForAPI(date);
        const data = await getAllSalesByUserId(apiDate);
        setSales(data);
        // No client-side date filtering needed - backend already filters by date
        setFilteredSales(data);
      } catch (error) {
        console.error("Error refreshing sales:", error);
      }
    };

    const loadSales = async () => {
      try {
        setIsLoading(true);
        const apiDate = formatDateForAPI(date);
        const data = await getAllSalesByUserId(apiDate);
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
  }, [dateFilterMode, formattedSelectedMonth, date]);

  useEffect(() => {
    const cleanupCreated = on("sale:created", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    const cleanupUpdated = on("sale:updated", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    const cleanupVoided = on("sale:voided", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return () => {
      cleanupCreated?.();
      cleanupUpdated?.();
      cleanupVoided?.();
    };
  }, []);

  useEffect(() => {
    let filtered = [...sales];

    if (dateFilterMode === "day" && date) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.toDateString() === date.toDateString();
      });
    } else if (dateFilterMode === "month") {
      const [year, month] = formattedSelectedMonth.split("-").map(Number);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getFullYear() === year && saleDate.getMonth() === month - 1
        );
      });
    }

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

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Sales</h1>

      <CashierSelector
        selectedCashierId={selectedCashierId}
        onCashierSelect={setSelectedCashierId}
      />

      {selectedCashierId ? (
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="voided">Voided Sales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="mt-6">
            <CashierSalesList
              cashierId={selectedCashierId}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
          
          <TabsContent value="voided" className="mt-6">
            <VoidList />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Please select a cashier to view their sales data.
          </p>
        </div>
      )}
    </div>
  );
}
