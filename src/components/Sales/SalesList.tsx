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
import { Loader2 } from "lucide-react";
import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";

export function SalesList() {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cashierId, setCashierId] = useState<string>("all");

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllSalesByUserId();
      setSales(data);
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
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleDeleteSale = (deletedSaleId: string) => {
    setSales(prevSales => prevSales.filter(sale => sale.id !== deletedSaleId));
  };

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];
    return (
      saleDate === date &&
      (cashierId === "all" || sale.cashier.id === cashierId)
    );
  });

  const uniqueCashiers = Array.from(
    new Set(filteredSales.map((sale) => sale.cashier.id))
  ).map((id) => filteredSales.find((sale) => sale.cashier.id === id)!.cashier);

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-8 rounded-lg flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <p className="mt-4 text-white">Loading sales...</p>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredSales.length === 0 ? (
        <p>No sales found for the selected date and cashier.</p>
      ) : (
        <>
          <SalesSummary sales={filteredSales} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="h-full">
                <SaleItem sale={sale} onDelete={handleDeleteSale} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}