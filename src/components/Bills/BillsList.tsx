"use client";

import { useState } from "react";
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
import { useBillCountsByCashier } from "@/hooks/useBillCounts";
import { BillCountTableRow } from "./BillCountTableRow";
import { CreateBillCounts } from "./CreateBillCount";
import { CashierSelector } from "../CashierSelector";

export function BillCountList() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedCashierId, setSelectedCashierId] = useState<string>("");
  const [selectedCashierName, setSelectedCashierName] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;

  const {
    data: billCount,
    isLoading: loading,
    refetch,
  } = useBillCountsByCashier(selectedCashierId, formattedDate);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleCashierSelect = (cashierId: string, cashierName: string) => {
    setSelectedCashierId(cashierId);
    setSelectedCashierName(cashierName);
  };

  const getDisplayDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return null;
    return selectedDate;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-xl font-bold text-primary">
          Bill Count Management
        </CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CashierSelector
            selectedCashierId={selectedCashierId}
            onCashierSelect={handleCashierSelect}
            label="Select Cashier"
            placeholder="Choose a cashier to manage..."
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={!selectedCashierId}
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
                disabled={!selectedCashierId}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedCashierId ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Please select a cashier to view their bill count.
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : billCount != null && billCount.bills.length > 0 ? (
          (() => {
            const bc = billCount!;
            return (
          <div className="space-y-6 mt-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-medium text-primary mb-2">
                Bill Count for {selectedCashierName} -{" "}
                {getDisplayDate(date) &&
                  format(getDisplayDate(date)!, "MMMM d, yyyy")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Cash
                </h3>
                <p className="text-2xl font-bold text-primary">
                  ₱{bc.totalCash.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Expenses
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  ₱{bc.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Net Cash
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  ₱{bc.netCash.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Bills Total
                </h3>
                <p className="text-2xl font-bold text-secondary">
                  ₱{bc.billsTotal.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Coins Total
                </h3>
                <p className="text-2xl font-bold text-amber-600">
                  ₱{(bc.coinsTotal ?? 0).toLocaleString()}
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
                  billCount={bc}
                  cashierId={selectedCashierId}
                  onRefresh={handleRefresh}
                />
              </TableBody>
            </Table>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Summary Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Cash Overview
                  </h4>
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-sm font-medium text-gray-600">
                      Total Cash (from Sales)
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      ₱{bc.totalCash.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-sm font-medium text-gray-600">
                      Total Cash from Bills
                    </span>
                    <span className="text-lg font-semibold text-secondary">
                      ₱{bc.billsTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-sm font-medium text-gray-600">
                      Net Cash (Cash - Expenses)
                    </span>
                    <span className="text-lg font-semibold text-orange-600">
                      ₱{bc.netCash.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Summary Calculation
                  </h4>
                  <div className="bg-white/50 p-4 rounded border-l-4 border-l-primary">
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span className="text-gray-600">
                        Total Cash from Bills
                      </span>
                      <span className="font-medium">
                        ₱{bc.billsTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 text-sm border-t border-gray-200 mt-2 pt-2">
                      <span className="text-gray-700 font-medium">
                        Step 1 Result
                      </span>
                      <span className="font-semibold">
                        ₱{bc.billsTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t border-gray-300 my-3"></div>

                    <div className="flex justify-between items-center py-1 text-sm">
                      <span className="text-gray-600">Step 1 Result</span>
                      <span className="font-medium">
                        ₱{bc.billsTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 text-sm">
                      <span className="text-gray-600">+ Expenses</span>
                      <span className="font-medium text-green-600">
                        + ₱{bc.totalExpenses.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 text-sm">
                      <span className="text-gray-600">- Beginning Balance</span>
                      <span className="font-medium text-green-600">
                        - ₱{bc.beginningBalance.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t-2 border-primary mt-3 pt-3">
                      <span className="text-base font-semibold text-gray-800">
                        Final Summary
                      </span>
                      <span className="text-xl font-bold text-primary">
                        ₱
                        {(() => {
                          const step1HasBalanceSubtracted = bc.showBeginningBalance && 
                            (bc.summaryStep1 === bc.billsTotal - bc.beginningBalance);
                          
                          const finalValue = step1HasBalanceSubtracted
                            ? bc.summaryFinal
                            : bc.summaryFinal - bc.beginningBalance;
                          
                          console.log("🧮 FINAL CALCULATION DEBUG:", {
                            showBeginningBalance: bc.showBeginningBalance,
                            billsTotal: bc.billsTotal,
                            beginningBalance: bc.beginningBalance,
                            summaryStep1: bc.summaryStep1,
                            summaryFinal: bc.summaryFinal,
                            expectedStep1: bc.billsTotal - bc.beginningBalance,
                            step1HasBalanceSubtracted,
                            finalValue,
                            calculation: step1HasBalanceSubtracted ? "Use summaryFinal as-is" : "Subtract beginning balance"
                          });
                          
                          return Number(finalValue).toLocaleString();
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            );
          })()
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No bill count found for {selectedCashierName} on{" "}
              {getDisplayDate(date) &&
                format(getDisplayDate(date)!, "MMM dd, yyyy")}
              .
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
        cashierId={selectedCashierId}
        cashierName={selectedCashierName}
      />
    </Card>
  );
}
