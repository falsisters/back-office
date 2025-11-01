"use client";

import { useEffect, useState } from "react";
import { getAllSalesByUserId } from "@/lib/server/Sales/getAllSalesByUserId";
import type { PaymentMethodEnum } from "../../../utils/types/schema.type";
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/Sales/getAllSalesByUserId.type";
import { CashierSelector } from "../Cashier/CashierSelector";
import CashierSalesList from "./CashierSalesList";
import VoidList from "./VoidList";
import { supabase } from "@/lib/supabase";
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

  const formattedSelectedMonth = `${selectedYear}-${String(
    selectedMonth
  ).padStart(2, "0")}`;

  useEffect(() => {
    // Separate function to load sales without loading state for real-time updates
    const refreshSalesData = async () => {
      try {
        const data = await getAllSalesByUserId();
        setSales(data);

        let filtered;
        if (dateFilterMode === "day") {
          const currentDate = date || new Date();
          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.toDateString() === currentDate.toDateString();
          });
        } else {
          const [year, month] = formattedSelectedMonth.split("-").map(Number);
          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return (
              saleDate.getFullYear() === year &&
              saleDate.getMonth() === month - 1
            );
          });
        }

        setFilteredSales(filtered);
      } catch (error) {
        console.error("Error refreshing sales:", error);
      }
    };

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
          const [year, month] = formattedSelectedMonth.split("-").map(Number);
          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return (
              saleDate.getFullYear() === year &&
              saleDate.getMonth() === month - 1
            );
          });
        }

        setFilteredSales(filtered);
      } catch (error) {
        console.error("Error loading sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const channelA = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        () => {
          setRefreshTrigger((prev) => prev + 1);
        }
      )
      .subscribe();

    loadSales();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channelA);
    };
  }, [dateFilterMode, formattedSelectedMonth, date]);

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
