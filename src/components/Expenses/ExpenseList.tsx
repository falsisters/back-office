"use client"

import { useEffect, useState } from "react"
import { getExpenseByDate } from "@/lib/server/getExpensesByDate"
import { deleteExpense } from "@/lib/server/deleteExpense"
import type { GetAllExpensesPayload } from "../../../utils/types/getAllExpenses.type"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ExpenseItem } from "./ExpenseItem"
import { CreateExpense } from "./CreateExpense"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Receipt } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ExpenseList() {
  const [expense, setExpense] = useState<GetAllExpensesPayload[number] | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchExpenseByDate(date)
  }, [date])

  const fetchExpenseByDate = async (selectedDate: Date) => {
    try {
      setIsLoading(true)
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const data = await getExpenseByDate({ date: formattedDate })
      setExpense(data || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteExpense = async () => {
    if (!expense) return

    try {
      await deleteExpense(expense.id)
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      })
      setExpense(null)
    } catch (error) {
      console.error("Error deleting: ", error)
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExpenseCreated = (newExpense: GetAllExpensesPayload[number]) => {
    setExpense(newExpense)
    toast({
      title: "Expense created",
      description: "New expense has been successfully added.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary font-medium">Loading expenses...</span>
      </div>
    )
  }

  const totalAmount = expense?.ExpenseItems.reduce((sum, item) => sum + item.amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">{format(date, "MMMM d, yyyy")}</h2>
            <p className="text-sm text-muted-foreground">
              {expense
                ? `${expense.ExpenseItems.length} items • Total: ₱${totalAmount.toFixed(2)}`
                : "No expenses recorded"}
            </p>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="border-primary/30 text-primary">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Change Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2">
        <CreateExpense onExpenseCreated={handleExpenseCreated} currentDate={date} />
      </div>

      {error ? (
        <Card className="w-full border-red-200 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={() => fetchExpenseByDate(date)}
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
                No expenses found for {format(date, "MMM dd, yyyy")}. Create your first expense to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full shadow-md overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-primary text-xl">Expense Details</CardTitle>
            <CardDescription>Manage your daily expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold w-[60%]">Expense Name</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
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
    </div>
  )
}
