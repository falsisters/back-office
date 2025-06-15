"use client";

import { useEffect, useState } from "react";
import { getAllCashiersByUserId } from "@/lib/server/Cashier/getAllCashiersByUserId";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/Cashier/getAllCashiersByUserId.type";

interface CashierSelectorProps {
  selectedCashierId: string | null;
  onCashierSelect: (cashierId: string) => void;
}

export function CashierSelector({
  selectedCashierId,
  onCashierSelect,
}: CashierSelectorProps) {
  const [cashiers, setCashiers] = useState<GetAllCashiersByUserIdPayload>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCashiers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCashiersByUserId();
        setCashiers(data);

        // Auto-select first cashier if none selected
        if (!selectedCashierId && data.length > 0) {
          onCashierSelect(data[0].id);
        }
      } catch (error) {
        console.error("Error loading cashiers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCashiers();
  }, [selectedCashierId, onCashierSelect]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Spinner />
            <span className="ml-2">Loading cashiers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Cashier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedCashierId || ""} onValueChange={onCashierSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a cashier..." />
          </SelectTrigger>
          <SelectContent>
            {cashiers.map((cashier) => (
              <SelectItem key={cashier.id} value={cashier.id}>
                {cashier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
