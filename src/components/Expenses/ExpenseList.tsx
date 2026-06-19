"use client";

import { useState } from "react";
import { useExpensesByCashier, useDeleteExpense } from "@/hooks/useExpenses";
import { useCashiers } from "@/hooks/useCashiers";
import { toast } from "sonner";
import { ExpenseItem } from "./ExpenseItem";
import { CreateExpense } from "./CreateExpense";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CashierSelector } from "../Cashier/CashierSelector";

export function ExpenseList() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCashierId, setSelectedCashierId] = useState<string>("");
  const { data: cashiers = [] } = useCashiers();
  const deleteMutation = useDeleteExpense();

  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: expense, isLoading, isError, error, refetch } =
    useExpensesByCashier(selectedCashierId, formattedDate);

  const selectedCashierName =
    cashiers.find((c) => c.id === selectedCashierId)?.name || "";

  const handleCashierSelect = (cashierId: string) => {
    setSelectedCashierId(cashierId);
  };

  const handleDeleteExpense = async () => {
    if (!expense) return;

    try {
      await deleteMutation.mutateAsync(expense.id);
      toast.success("Expense deleted");
    } catch (_error) {
      // Error toast handled by mutation's onError
    }
  };

  const handleExpenseCreated = () => {
    toast.success("Expense created");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary font-medium">
          Loading expenses...
        </span>
      </div>
    );
  }

  const totalAmount =
    expense?.ExpenseItems.reduce(
      (sum: number, item: any) => sum + Number(item.amount),
      0
    ) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CashierSelector
          selectedCashierId={selectedCashierId || null}
          onCashierSelect={handleCashierSelect}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!selectedCashierId}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {!selectedCashierId ? (
        <Card className="w-full shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Please select a cashier to view their expenses.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  {selectedCashierName} - {format(date, "MMMM d, yyyy")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {expense
                    ? `${
                        expense.ExpenseItems.length
                      } items Total: ₱${totalAmount.toFixed(2)}`
                    : "No expenses recorded"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <CreateExpense
              onExpenseCreated={handleExpenseCreated}
              currentDate={date}
              cashierId={selectedCashierId}
              cashierName={selectedCashierName}
            />
          </div>

          {isError ? (
            <Card className="w-full border-red-200 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-red-500 mb-4">
                    {error instanceof Error ? error.message : "Failed to load expenses"}
                  </p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !expense ? (
            <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    No expenses found for {format(date, "MMM dd, yyyy")}. Create
                    your first expense to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full shadow-md overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-primary text-xl">
                  Expense Details
                </CardTitle>
                <CardDescription>Manage your daily expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold w-[60%]">
                        Expense Name
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <ExpenseItem
                      expense={expense}
                      onDelete={handleDeleteExpense}
                    />
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
