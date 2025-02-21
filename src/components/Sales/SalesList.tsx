"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllSalesByUserId } from "@/lib/server/getAllSalesByUserId";
import { SaleItem } from "./SaleItem";
import { SalesSummary } from "./SalesSummary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";

export function SalesList() {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cashierId, setCashierId] = useState<string>("all");

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSales = await getAllSalesByUserId();

      const filteredSales = fetchedSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];
        return (
          saleDate === date &&
          (cashierId === "all" || sale.cashier.id === cashierId)
        );
      });

      setSales(filteredSales);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while fetching sales data."
      );
    } finally {
      setLoading(false);
    }
  }, [date, cashierId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const uniqueCashiers = Array.from(
    new Set(sales.map((sale) => sale.cashier.id))
  ).map((id) => sales.find((sale) => sale.cashier.id === id)!.cashier);

  return (
    <>
      <div className="mb-4 flex gap-4">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-auto"
        />
        <Select value={cashierId} onValueChange={setCashierId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Cashier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cashiers</SelectItem>
            {uniqueCashiers.map((cashier) => (
              <SelectItem key={cashier.id} value={cashier.id}>
                {cashier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50">
          <div className="p-8 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black"></div>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : sales.length === 0 ? (
        <p>No sales found for the selected date and cashier.</p>
      ) : (
        <>
          <SalesSummary sales={sales} />
          <div className="space-y-4">
            {sales.map((sale) => (
              <SaleItem key={sale.id} sale={sale} onDelete={fetchSales} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
