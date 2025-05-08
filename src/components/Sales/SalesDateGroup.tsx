// components/SalesDateGroup.tsx
"use client";

import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { SalesItemList } from "./SalesItemList";

interface SalesDateGroupProps {
  dateString: string;
  sales: GetAllSalesByUserIdPayload;
  viewMode: "perSale" | "perProduct";
  dateFilterMode: "day" | "month";
}

export function SalesDateGroup({
  dateString,
  sales,
  viewMode,
  dateFilterMode,
}: SalesDateGroupProps) {
  return (
    <Card className="shadow-md border-l-4 border-l-primary">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {dateFilterMode === "month" ? (
            <span>{dateString}</span>
          ) : (
            dateString
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <SalesItemList sales={sales} viewMode={viewMode} />
        </div>
      </CardContent>
    </Card>
  );
}