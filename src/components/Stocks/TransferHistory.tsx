"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransfersByCashier } from "@/hooks/useStocks";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
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
import type { GetAllTransfersResponse } from "../../../utils/types/Transfers/getAllTransfers.type";
import { CashierSelector } from "../Cashier/CashierSelector";

interface TransferHistoryProps {
  selectedCashierId?: string | null;
}

export default function TransferHistory({
  selectedCashierId: propCashierId,
}: TransferHistoryProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    propCashierId || null
  );

  const dateString = useMemo(() => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [date]);

  const {
    data: transfers = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTransfersByCashier(selectedCashierId || "", dateString);

  useEffect(() => {
    const newCashierId = propCashierId === undefined ? null : propCashierId;
    if (newCashierId !== selectedCashierId) {
      setSelectedCashierId(newCashierId);
    }
  }, [propCashierId, selectedCashierId]);

  useEffect(() => {
    if (isError && error) {
      toast.error(extractNestError(error));
    }
  }, [isError, error]);

  const handleRefresh = () => {
    refetch();
  };

  const handleCashierSelect = (cashierId: string) => {
    setSelectedCashierId(cashierId);
  };

  const formatQuantity = (
    quantity: number | string | null | undefined
  ): string => {
    if (quantity === null || quantity === undefined) return "0";
    const numQuantity =
      typeof quantity === "string" ? parseFloat(quantity) || 0 : quantity;
    if (numQuantity === 0) return "0";
    if (numQuantity % 1 === 0) return numQuantity.toString();
    return numQuantity.toFixed(2);
  };

  const groupTransfersByType = (
    list: GetAllTransfersResponse
  ): Record<string, GetAllTransfersResponse> => {
    const grouped: Record<string, GetAllTransfersResponse> = {};
    list.forEach((transfer) => {
      if (!grouped[transfer.type]) {
        grouped[transfer.type] = [];
      }
      grouped[transfer.type].push(transfer);
    });
    return grouped;
  };

  const groupedTransfers = useMemo(
    () => groupTransfersByType(transfers),
    [transfers]
  );

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
            disabled={isRefetching || !selectedCashierId}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <RefreshCw
              size={18}
              className={isRefetching ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6 px-6">
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">
              Loading transfer history...
            </p>
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
        ) : transfers.length === 0 ? (
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
                        <span className="text-muted-foreground">&bull;</span>
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
  if (type === "OWN_CONSUMPTION") return "Out";
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};
