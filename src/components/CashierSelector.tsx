"use client";

import { useState, useEffect } from "react";
import { getCashiers } from "@/lib/server/getCashiers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface Cashier {
  id: string;
  name: string;
  accessKey: string;
}

interface CashierSelectorProps {
  selectedCashierId?: string;
  onCashierSelect: (cashierId: string, cashierName: string) => void;
  label?: string;
  placeholder?: string;
}

export function CashierSelector({
  selectedCashierId,
  onCashierSelect,
  label = "Select Cashier",
  placeholder = "Choose a cashier...",
}: CashierSelectorProps) {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        setLoading(true);
        const data = await getCashiers();
        setCashiers(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load cashiers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCashiers();
  }, []);

  const selectedCashier = cashiers.find((c) => c.id === selectedCashierId);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="p-2 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        {label}
        {selectedCashier && (
          <Badge variant="outline" className="ml-2">
            {selectedCashier.name}
          </Badge>
        )}
      </Label>
      <Select
        value={selectedCashierId}
        onValueChange={(value) => {
          const cashier = cashiers.find((c) => c.id === value);
          if (cashier) {
            onCashierSelect(value, cashier.name);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {cashiers.map((cashier) => (
            <SelectItem key={cashier.id} value={cashier.id}>
              <div className="flex items-center gap-2">
                <span>{cashier.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {cashier.accessKey}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
