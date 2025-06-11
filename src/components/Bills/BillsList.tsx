"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getUserBillCountForDate } from "@/lib/server/getUserBillCountByDate";
import { BillCountTableRow } from "./BillCountTableRow";
import { CreateBillCounts } from "./CreateBillCount";
import type { GetBillCountForDatePayload } from "../../../utils/types/getBillCountByDate.type";

export function BillCountList() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [billCount, setBillCount] = useState<GetBillCountForDatePayload | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchBillCount = async () => {
      setLoading(true);
      try {
        if (date) {
          const formattedDate = format(date, "yyyy-MM-dd");
          const data = await getUserBillCountForDate(formattedDate);
          setBillCount(data);
        }
      } catch (error) {
        console.error("Failed to fetch bill count:", error);
        setBillCount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBillCount();
  }, [date]);

  const handleRefresh = async () => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const data = await getUserBillCountForDate(formattedDate);
      setBillCount(data);
    }
  };

  // Check if we have data and if the bills array exists and has items
  const hasData = billCount && billCount.bills && billCount.bills.length > 0;

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-primary">
          Bill Count
        </CardTitle>
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
        ) : hasData ? (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Beginning Balance
                </h3>
                <p className="text-2xl font-bold text-primary">
                  ₱
                  {billCount.showBeginningBalance
                    ? billCount.beginningBalance.toLocaleString()
                    : "Hidden"}
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Bills Total
                </h3>
                <p className="text-2xl font-bold text-secondary">
                  ₱{billCount.billsTotal.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Final Total
                </h3>
                <p className="text-2xl font-bold text-primary">
                  ₱{billCount.finalTotal.toLocaleString()}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-1/4">Bill Type</TableHead>
                  <TableHead className="w-1/4 text-center">Amount</TableHead>
                  <TableHead className="w-1/4 text-center">Value</TableHead>
                  <TableHead className="w-1/4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <BillCountTableRow
                  billCount={billCount}
                  onRefresh={handleRefresh}
                />
              </TableBody>
            </Table>

            {/* Cash Breakdown Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Cash Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-sm font-medium text-gray-600">
                      Bills Total
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      ₱{billCount.billsTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-sm font-medium text-gray-600">
                      Total Cash (from Sales)
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      ₱{billCount.totalCash.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-sm font-medium text-gray-600">
                      Total from Bills
                    </span>
                    <span className="text-lg font-semibold text-secondary">
                      ₱{billCount.billsTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-sm font-medium text-gray-600">
                      Net Cash
                    </span>
                    <span className="text-lg font-semibold text-orange-600">
                      ₱
                      {(
                        billCount.totalCash - billCount.billsTotal
                      ).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      (Cash - Bills)
                    </span>
                  </div>
                  <div className="bg-white/50 p-4 rounded border-l-4 border-l-primary">
                    <div className="text-sm font-medium text-gray-600 mb-3">
                      Final Cash Total Breakdown
                    </div>

                    {/* Step 1: Total Cash */}
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span className="text-gray-600">
                        Total Cash (from Sales)
                      </span>
                      <span className="font-medium">
                        ₱{billCount.totalCash.toLocaleString()}
                      </span>
                    </div>

                    {/* Step 2: Add Beginning Balance if shown */}
                    {billCount.showBeginningBalance && (
                      <div className="flex justify-between items-center py-1 text-sm">
                        <span className="text-gray-600">
                          + Beginning Balance
                        </span>
                        <span className="font-medium text-green-600">
                          + ₱{billCount.beginningBalance.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Subtotal after adding beginning balance */}
                    <div className="flex justify-between items-center py-1 text-sm border-t border-gray-200 mt-2 pt-2">
                      <span className="text-gray-700 font-medium">
                        Subtotal
                      </span>
                      <span className="font-semibold">
                        ₱
                        {(
                          billCount.totalCash +
                          (billCount.showBeginningBalance
                            ? billCount.beginningBalance
                            : 0)
                        ).toLocaleString()}
                      </span>
                    </div>

                    {/* Step 3: Subtract Expenses if shown */}
                    {billCount.showExpenses && (
                      <div className="flex justify-between items-center py-1 text-sm">
                        <span className="text-gray-600">- Expenses</span>
                        <span className="font-medium text-red-600">
                          - ₱{billCount.expenses.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Final Total */}
                    <div className="flex justify-between items-center py-2 border-t-2 border-primary mt-3 pt-3">
                      <span className="text-base font-semibold text-gray-800">
                        Final Cash Total
                      </span>
                      <span className="text-xl font-bold text-primary">
                        ₱
                        {(
                          billCount.totalCash +
                          (billCount.showBeginningBalance
                            ? billCount.beginningBalance
                            : 0) -
                          (billCount.showExpenses ? billCount.expenses : 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {billCount.showExpenses && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Expenses
                </h3>
                <p className="text-xl font-bold text-destructive">
                  - ₱{billCount.expenses.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No bill count found for this date.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Bill Count
            </Button>
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
  );
}
