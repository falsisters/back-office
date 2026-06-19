"use client";

import { useCashiers } from "@/hooks/useCashiers";
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
import { useEffect } from "react";

interface CashierSelectorProps {
  selectedCashierId: string | null;
  onCashierSelect: (cashierId: string) => void;
}

export function CashierSelector({
  selectedCashierId,
  onCashierSelect,
}: CashierSelectorProps) {
  const { data: cashiers = [], isLoading } = useCashiers();

  useEffect(() => {
    if (!selectedCashierId && cashiers.length > 0) {
      onCashierSelect(cashiers[0].id);
    }
  }, [cashiers, selectedCashierId, onCashierSelect]);

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
