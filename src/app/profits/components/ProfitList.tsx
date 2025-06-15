"use client";

import { useEffect, useState } from "react";
import { getAllSalesByUserId } from "@/lib/server/getAllSalesByUserId";
import ProfitTracker from "@/components/Sales/ProfitTracker";
import { type SackType } from "../../../../utils/types/schema.type";
import type { GetAllSalesByUserIdPayload } from "../../../../utils/types/getAllSalesByUserId.type";
import { SalesFilters } from "@/components/Sales/SalesFilter";
import { Spinner } from "@/components/ui/spinner";
import { CashierSelector } from "@/components/Cashier/CashierSelector";
import CashierProfitList from "@/components/Profits/CashierProfitList";

export default function ProfitList() {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [filteredSales, setFilteredSales] =
    useState<GetAllSalesByUserIdPayload>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterMode, setDateFilterMode] = useState<"day" | "month">("day");
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    () => new Date().getMonth() + 1
  );
  const [previousDaySales, setPreviousDaySales] =
    useState<GetAllSalesByUserIdPayload>([]);
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    null
  );

  const formattedSelectedMonth = `${selectedYear}-${String(
    selectedMonth
  ).padStart(2, "0")}`;

  useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSalesByUserId();
        setSales(data);

        let filtered;
        let previousDayFiltered: GetAllSalesByUserIdPayload;

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
          const [year, month] = formattedSelectedMonth.split("-").map(Number);
          filtered = data.filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return (
              saleDate.getFullYear() === year &&
              saleDate.getMonth() === month - 1
            );
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
      const [year, month] = formattedSelectedMonth.split("-").map(Number);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getFullYear() === year && saleDate.getMonth() === month - 1
        );
      });
    }

    setFilteredSales(filtered);
  }, [date, sales, dateFilterMode, formattedSelectedMonth]);

  const mappedSalesData = filteredSales.flatMap((sale) =>
    sale.SaleItem.map((item) => {
      const isSack = !!item.sackPriceId;
      const priceType: "sack" | "per-kilo" = isSack ? "sack" : "per-kilo";
      const sackType = item.sackType as SackType | undefined;
      const sackPrice =
        item.product.SackPrice.find((sp) => sp.type === sackType) ||
        item.product.SackPrice[0];

      let originalProfit = 0;

      if (isSack) {
        originalProfit = sackPrice?.profit ?? 0;
      } else {
        originalProfit = item.product.perKiloPrice?.profit ?? 0;
      }

      const normalProfit = originalProfit;
      const specialProfit = 0;

      return {
        productKey: `${item.product.name}-${
          sackType || "perKilo"
        }-${priceType}`,
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
      const priceType: "sack" | "per-kilo" = isSack ? "sack" : "per-kilo";
      const sackType = item.sackType as SackType | undefined;
      const sackPrice =
        item.product.SackPrice.find((sp) => sp.type === sackType) ||
        item.product.SackPrice[0];

      let originalProfit = 0;

      if (isSack) {
        originalProfit = sackPrice?.profit ?? 0;
      } else {
        originalProfit = item.product.perKiloPrice?.profit ?? 0;
      }

      const normalProfit = originalProfit;
      const specialProfit = 0;

      return {
        productKey: `${item.product.name}-${
          sackType || "perKilo"
        }-${priceType}`,
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

      <CashierSelector
        selectedCashierId={selectedCashierId}
        onCashierSelect={setSelectedCashierId}
      />

      {selectedCashierId && <CashierProfitList cashierId={selectedCashierId} />}
    </div>
  );
}
