"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransfersByCashier } from "@/lib/server/Transfers/getTransfersByCashier";
import { getTransfersByCashierWithDate } from "@/lib/server/Transfers/getTransfersByCashierWithDate";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetAllTransfersResponse } from "../../../utils/types/Transfers/getAllTransfers.type";
import { CashierSelector } from "../Cashier/CashierSelector";

interface TransferHistoryProps {
  selectedCashierId?: string | null;
}

export default function TransferHistory({
  selectedCashierId: propCashierId,
}: TransferHistoryProps) {
  const [transfers, setTransfers] = useState<GetAllTransfersResponse>([]);
  const [filteredTransfers, setFilteredTransfers] =
    useState<GetAllTransfersResponse>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    propCashierId || null
  );

  // Helper function to safely parse and format quantity
  const formatQuantity = (
    quantity: number | string | null | undefined
  ): string => {
    if (quantity === null || quantity === undefined) return "0";
    const numQuantity =
      typeof quantity === "string" ? parseFloat(quantity) || 0 : quantity;

    // For transfers, if quantity is 0, it usually means it's a per-kilo transfer
    // Display with appropriate decimal places
    if (numQuantity === 0) return "0";
    if (numQuantity % 1 === 0) return numQuantity.toString();
    return numQuantity.toFixed(2);
  };

  const fetchTransfers = useCallback(async () => {
    if (!selectedCashierId) {
      setTransfers([]);
      setFilteredTransfers([]);
      return;
    }

    console.log("Fetching transfers for cashier:", selectedCashierId);
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching all transfers without date filter");
      const result = await getTransfersByCashier(selectedCashierId);

      console.log("Transfer fetch result:", result);

      if (result.data) {
        console.log("Setting transfers data:", result.data);
        setTransfers(result.data);
        
        if (date) {
          // Format selected date as YYYY-MM-DD in local time to match Manila timezone
          const selectedYear = date.getFullYear();
          const selectedMonth = String(date.getMonth() + 1).padStart(2, '0');
          const selectedDay = String(date.getDate()).padStart(2, '0');
          const selectedDateString = `${selectedYear}-${selectedMonth}-${selectedDay}`;
          
          const filtered = result.data.filter(transfer => {
            // Extract date part from Manila time transfer date
            const transferDate = transfer.createdAt.split('T')[0];
            return transferDate === selectedDateString;
          });
          console.log(`Filtered transfers for date ${selectedDateString}:`, filtered.length);
          setFilteredTransfers(filtered);
        } else {
          setFilteredTransfers(result.data);
        }
        setError(null);
      } else if (result.error) {
        console.error("Transfer fetch error:", result.error);
        setError(result.error);
        setTransfers([]);
        setFilteredTransfers([]);
      } else {
        console.error("Unexpected result format:", result);
        setError("Unexpected response format");
        setTransfers([]);
        setFilteredTransfers([]);
      }
    } catch (err) {
      console.error("Transfer fetch exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch transfers";
      setError(errorMessage);
      setTransfers([]);
      setFilteredTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCashierId, date]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  useEffect(() => {
    // Fix: Properly handle undefined prop
    const newCashierId = propCashierId === undefined ? null : propCashierId;
    if (newCashierId !== selectedCashierId) {
      setSelectedCashierId(newCashierId);
    }
  }, [propCashierId, selectedCashierId]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTransfers().finally(() => setIsRefreshing(false));
  }, [fetchTransfers]);

  const handleCashierSelect = (cashierId: string) => {
    setSelectedCashierId(cashierId);
  };

  const groupTransfersByType = (transfers: GetAllTransfersResponse) => {
    const grouped: Record<string, GetAllTransfersResponse> = {};

    transfers.forEach((transfer) => {
      if (!grouped[transfer.type]) {
        grouped[transfer.type] = [];
      }
      grouped[transfer.type].push(transfer);
    });

    return grouped;
  };

  const groupedTransfers = groupTransfersByType(filteredTransfers);

  return (
    <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-3xl font-bold text-primary">
          Transfer Records
        </CardTitle>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                size="auto"
                className={cn(
                  "w-full sm:w-auto justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={!selectedCashierId}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="default"
            onClick={handleRefresh}
            disabled={isRefreshing || !selectedCashierId}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6 px-6">
        {/* Show cashier selector only if not passed as prop */}
        {!propCashierId && (
          <CashierSelector
            selectedCashierId={selectedCashierId}
            onCashierSelect={handleCashierSelect}
          />
        )}

        {selectedCashierId && (
          <div className="text-sm text-muted-foreground">
            Track inventory movements and adjustments for selected cashier
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">
              Loading transfer history...
            </p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-6 rounded-md border border-destructive/20 text-center">
            <p className="text-base text-destructive font-medium">{error}</p>
            <Button
              variant="outline"
              size="default"
              onClick={handleRefresh}
              className="mt-4 border-primary/30 text-primary hover:bg-primary/10"
            >
              Try Again
            </Button>
          </div>
        ) : !selectedCashierId ? (
          <div className="text-center py-12 border border-dashed rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-2">
              Select a cashier to view transfer history
            </p>
            <p className="text-sm text-muted-foreground">
              Choose a cashier from the dropdown above to view their transfer
              records
            </p>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-12 border rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-2 text-lg">
              No transfers found
            </p>
            <p className="text-muted-foreground">
              No transfer history available for selected cashier and date
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTransfers).map(([type, typeTransfers]) => (
              <div key={type} className="space-y-4">
                <h3 className="text-xl font-semibold">
                  {formatTransferType(type)}
                </h3>
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  {typeTransfers.map((transfer) => (
                    <div key={transfer.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transfer.name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-primary font-semibold">
                          {formatQuantity(transfer.quantity)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          parseISO(transfer.createdAt),
                          "MMM dd, yyyy - h:mm a"
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const formatTransferType = (type: string) => {
  // Handle the old OWN_CONSUMPTION type that might still exist in the database
  if (type === "OWN_CONSUMPTION") {
    return "Out";
  }
  
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};
