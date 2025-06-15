"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTransfers } from "@/lib/server/Transfers/getAllTransfers";
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

export default function TransferHistory() {
  const [transfers, setTransfers] = useState<GetAllTransfersResponse>([]);
  const [filteredTransfers, setFilteredTransfers] =
    useState<GetAllTransfersResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllTransfers();
      if (result.data) {
        setTransfers(result.data);
        setFilteredTransfers(result.data);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch transfers");
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  useEffect(() => {
    if (!date) {
      setFilteredTransfers(transfers);
    } else {
      const filtered = transfers.filter((transfer) => {
        const transferDate = new Date(transfer.createdAt);
        return (
          transferDate.getDate() === date.getDate() &&
          transferDate.getMonth() === date.getMonth() &&
          transferDate.getFullYear() === date.getFullYear()
        );
      });
      setFilteredTransfers(filtered);
    }
  }, [date, transfers]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTransfers().finally(() => setIsRefreshing(false));
  }, [fetchTransfers]);

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
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
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
            disabled={isRefreshing}
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
        <div className="text-sm text-muted-foreground">
          Track inventory movements and adjustments
        </div>

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
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-12 border rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-2 text-lg">
              No transfers found
            </p>
            <p className="text-muted-foreground">
              No transfer history available for selected date
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
                          {transfer.quantity}
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
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};
