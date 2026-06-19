"use client";

import { useState, useMemo } from "react";
import { DeliveryItem } from "@/components/Deliveries/DeliveryItem";
import { CashierSelector } from "@/components/Cashier/CashierSelector";
import { useDeliveriesByCashier } from "@/hooks/useDeliveries";
import type { GetAllDeliveriesByCashierIdPayload } from "../../../utils/types/Deliveries/getAllDeliveriesByCashierId.type";
import { format } from "date-fns";
import { CalendarIcon, TruckIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function DeliveryList() {
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    null
  );
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: deliveries = [], isLoading } =
    useDeliveriesByCashier(selectedCashierId ?? "");

  const filteredDeliveries = useMemo(() => {
    if (!date) return deliveries;

    return deliveries.filter((delivery) => {
      const deliveryDate = new Date(delivery.createdAt);
      return deliveryDate.toDateString() === date.toDateString();
    });
  }, [deliveries, date]);

  const handleCashierSelect = (cashierId: string) => {
    setSelectedCashierId(cashierId);
  };

  const groupDeliveriesByDate = () => {
    const grouped: Record<string, GetAllDeliveriesByCashierIdPayload> = {};

    filteredDeliveries.forEach((delivery) => {
      const deliveryDate = new Date(delivery.createdAt).toLocaleDateString(
        "en-PH",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      if (!grouped[deliveryDate]) grouped[deliveryDate] = [];
      grouped[deliveryDate].push(delivery);
    });

    return grouped;
  };

  const groupedDeliveries = groupDeliveriesByDate();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Deliveries</h1>

      <CashierSelector
        selectedCashierId={selectedCashierId}
        onCashierSelect={handleCashierSelect}
      />

      {selectedCashierId && (
        <>
          <div className="rounded-lg border bg-card shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading deliveries...
                  </div>
                ) : (
                  `Showing deliveries for selected cashier`
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="auto"
                    className="w-full sm:w-auto justify-start text-left font-normal"
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    {date ? (
                      format(date, "MMMM do, yyyy")
                    ) : (
                      "Pick a date"
                    )}
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
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground font-medium">
                    Loading deliveries...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : Object.entries(groupedDeliveries).length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center h-64">
                  <TruckIcon className="w-12 h-12 text-primary/40 mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No deliveries found
                  </p>
                  {date && (
                    <p className="text-sm text-muted-foreground mt-2">
                      for {format(date, "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {Object.entries(groupedDeliveries).map(
                ([dateString, deliveries]) => (
                  <Card
                    key={dateString}
                    className="shadow-md border-l-4 border-l-primary"
                  >
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                      <CardTitle className="text-lg text-primary flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {dateString}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deliveries.map((delivery) => (
                          <DeliveryItem
                            key={delivery.id}
                            delivery={delivery}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              <div className="text-sm text-muted-foreground text-center pt-2">
                Showing {filteredDeliveries.length}{" "}
                {filteredDeliveries.length === 1 ? "delivery" : "deliveries"}
                {date && <> for {format(date, "MMMM d, yyyy")}</>}
              </div>
            </>
          )}
        </>
      )}

      {!selectedCashierId && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center h-64">
              <TruckIcon className="w-12 h-12 text-primary/40 mb-4" />
              <p className="text-muted-foreground font-medium">
                Please select a cashier to view deliveries
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
