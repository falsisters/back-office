"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ExpenseWithItemsType } from "../../../utils/types/Expense/getExpenseByDate.type";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ExpenseItemProps {
  expense: ExpenseWithItemsType;
  onDelete: (id: string) => Promise<void>;
}

export function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  const totalAmount = expense.ExpenseItems.reduce(
    (sum: number, item: any) => sum + Number(item.amount), // Ensure proper number conversion
    0
  );

  return (
    <>
      <TableRow className="bg-gray-50/50">
        <TableCell colSpan={3} className="font-medium text-primary">
          <div className="flex items-center">
            <Badge
              variant="outline"
              className="mr-2 bg-primary/5 text-primary border-primary/20"
            >
              {format(new Date(expense.createdAt), "MMMM d, yyyy")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {expense.ExpenseItems.length} items
            </span>
          </div>
        </TableCell>
      </TableRow>

      {expense.ExpenseItems.map((item: any) => (
        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell className="text-right">
            ₱{Number(item.amount).toFixed(2)}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
      ))}

      <TableRow className="border-t-2 border-primary/10">
        <TableCell className="font-semibold text-right">TOTAL</TableCell>
        <TableCell className="font-bold text-right text-primary">
          ₱{totalAmount.toFixed(2)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(expense.id)}
              className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
