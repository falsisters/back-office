"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getUserBillCountForDate } from "@/lib/server/getUserBillCountByDate"
import { BillCountTableRow } from "./BillCountTableRow"
import { CreateBillCounts } from "./CreateBillCount"
import type { GetBillCountForDatePayload } from "../../../utils/types/getBillCountByDate.type"

export function BillCountList() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [billCount, setBillCount] = useState<GetBillCountForDatePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchBillCount = async () => {
      setLoading(true)
      try {
        if (date) {
          const formattedDate = format(date, "yyyy-MM-dd")
          const data = await getUserBillCountForDate(formattedDate)
          setBillCount(data)
        }
      } catch (error) {
        console.error("Failed to fetch bill count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBillCount()
  }, [date])

  const handleRefresh = async () => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd")
      const data = await getUserBillCountForDate(formattedDate)
      setBillCount(data)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-primary">Bill Count</CardTitle>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button 
            variant="default" 
            onClick={() => setShowCreateModal(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : billCount ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Beginning Balance</h3>
                <p className="text-2xl font-bold text-primary">
                  ₱{billCount.showBeginningBalance ? billCount.beginningBalance.toLocaleString() : "Hidden"}
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bills Total</h3>
                <p className="text-2xl font-bold text-secondary">₱{billCount.billsTotal.toLocaleString()}</p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Final Total</h3>
                <p className="text-2xl font-bold text-primary">₱{billCount.finalTotal.toLocaleString()}</p>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[150px]">Bill Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <BillCountTableRow billCount={billCount} onRefresh={handleRefresh} />
              </TableBody>
            </Table>

            {billCount.showExpenses && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-2">Expenses</h3>
                <p className="text-xl font-bold text-destructive">- ₱{billCount.expenses.toLocaleString()}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No bill count found for this date.</p>
            <Button onClick={() => setShowCreateModal(true)}>Create Bill Count</Button>
          </div>
        )}
      </CardContent>

      <CreateBillCounts
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleRefresh}
        selectedDate={date}
      />
    </Card>
  )
}
