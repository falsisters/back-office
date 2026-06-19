"use client";

import type { Cashier } from "../../../utils/types/schema.type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCashiers, useDeleteCashier } from "@/hooks/useCashiers";
import { CashierTableRow } from "./CashierTable";
import { CreateCashier } from "./CreateCashier";

export function CashierList() {
  const { data: cashiers = [], isLoading, isError, error } = useCashiers();
  const deleteCashier = useDeleteCashier();

  const handleDeleteCashier = (id: string) => {
    return deleteCashier.mutateAsync(id);
  };

  const handleCashierUpdated = (_updatedCashier: Cashier) => {
    // Query invalidation happens in the mutation's onSuccess
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary font-medium">
          Loading cashiers...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateCashier />

      {isError ? (
        <Card className="w-full border-red-200 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">
                {error instanceof Error ? error.message : "Failed to load cashiers"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : cashiers.length === 0 ? (
        <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No cashiers found. Create your first cashier to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full shadow-md overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-primary text-xl">Cashiers</CardTitle>
            <CardDescription>
              Manage your cashiers and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Secure Code</TableHead>
                  <TableHead className="font-semibold">Permissions</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashiers.map((cashier) => (
                  <CashierTableRow
                    key={cashier.id}
                    cashier={cashier}
                    onDeleteCashier={handleDeleteCashier}
                    onUpdateCashier={handleCashierUpdated}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
