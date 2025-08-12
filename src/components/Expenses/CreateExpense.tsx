"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createCashierExpense } from "@/lib/server/Expense/createCashierExpenses";
import { getCashierExpenseByDate } from "@/lib/server/Expense/getCashierExpensesByDate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import type { CreateExpenseItemType } from "../../../utils/types/Expense/createExpense.type";
import type { GetAllExpensesPayload } from "../../../utils/types/Expense/getAllExpenses.type";
import { format } from "date-fns";

export function CreateExpense({
  onExpenseCreated,
  currentDate,
  cashierId,
  cashierName,
}: {
  onExpenseCreated: (newExpense: GetAllExpensesPayload[number]) => void;
  currentDate: Date;
  cashierId: string;
  cashierName: string;
}) {
  const [open, setOpen] = useState(false);
  const [expenseItems, setExpenseItems] = useState<CreateExpenseItemType[]>([
    { name: "", amount: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const loadExistingData = useCallback(async () => {
    setIsChecking(true);
    try {
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      const data = await getCashierExpenseByDate(cashierId, {
        date: formattedDate,
      });

      if (data && data.ExpenseItems.length > 0) {
        setExpenseItems(
          data.ExpenseItems.map((item: { name: unknown; amount: unknown }) => ({
            name: item.name,
            amount: item.amount,
          }))
        );
      } else {
        setExpenseItems([{ name: "", amount: 0 }]);
      }
    } catch (err) {
      console.error("Error loading existing expense:", err);
      setExpenseItems([{ name: "", amount: 0 }]);
    } finally {
      setIsChecking(false);
    }
  }, [currentDate, cashierId]);

  useEffect(() => {
    if (open) {
      loadExistingData();
    } else {
      resetForm();
    }
  }, [open, currentDate, loadExistingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (expenseItems.some((item) => !item.name.trim() || item.amount <= 0)) {
        throw new Error(
          "All expense items must have a name and a positive amount"
        );
      }

      setIsLoading(true);
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      const data = await createCashierExpense(cashierId, {
        expenseItems,
        date: formattedDate,
      });
      onExpenseCreated(data);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setExpenseItems([{ name: "", amount: 0 }]);
    setError(null);
  };

  const addExpenseItem = () => {
    setExpenseItems([...expenseItems, { name: "", amount: 0 }]);
  };

  const removeExpenseItem = (index: number) => {
    if (expenseItems.length > 1) {
      const newItems = [...expenseItems];
      newItems.splice(index, 1);
      setExpenseItems(newItems);
    }
  };

  const updateExpenseItem = (
    index: number,
    field: keyof CreateExpenseItemType,
    value: string | number
  ) => {
    const newItems = [...expenseItems];
    if (field === "amount") {
      // Handle decimal conversion properly for amount field
      const numericValue =
        typeof value === "string" ? parseFloat(value) || 0 : value;
      newItems[index] = { ...newItems[index], [field]: numericValue };
    } else {
      // For non-amount fields (like name), ensure we pass the correct type
      newItems[index] = { ...newItems[index], [field]: value as string };
    }
    setExpenseItems(newItems);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense for {cashierName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] shadow-xl border-t-4 border-t-secondary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-secondary">
            Add Expense for {cashierName}
          </DialogTitle>
          <DialogDescription>
            Record expenses for {format(currentDate, "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
            <span className="ml-2 text-sm text-gray-500">
              Loading expense data...
            </span>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {expenseItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-end p-3 rounded-md bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={`name-${index}`}
                        className="text-sm font-medium"
                      >
                        Item Name
                      </Label>
                      <Input
                        id={`name-${index}`}
                        value={item.name}
                        onChange={(e) =>
                          updateExpenseItem(index, "name", e.target.value)
                        }
                        required
                        className="focus-visible:ring-secondary"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={`amount-${index}`}
                        className="text-sm font-medium"
                      >
                        Amount
                      </Label>
                      <div className="relative">
                        <h1 className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₱
                        </h1>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) =>
                            updateExpenseItem(
                              index,
                              "amount",
                              e.target.value // Pass string value to be converted in updateExpenseItem
                            )
                          }
                          required
                          className="pl-8 focus-visible:ring-secondary"
                          placeholder="0.00"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExpenseItem(index)}
                      disabled={isLoading || expenseItems.length <= 1}
                      className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExpenseItem}
                  disabled={isLoading}
                  className="border-secondary/30 text-secondary hover:bg-secondary/10 hover:text-secondary transition-colors"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Another Item
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-secondary hover:bg-secondary/90 text-white"
                  >
                    {isLoading ? "Saving..." : "Save Expense"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
