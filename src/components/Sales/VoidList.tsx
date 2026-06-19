"use client";

import { useState } from "react";
import { useVoidedSales } from "@/hooks/useSales";
import type { GetVoidedSalesByUserPayload } from "../../../utils/types/Sales/getVoidedSalesByUser.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, SearchIcon, FilterIcon, Calendar as CalendarIcon2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type DateFilterMode = "day" | "month";

export default function VoidList() {
  const { data: voidedSales = [], isLoading } = useVoidedSales();
  
  // Filter states
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("day");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter voided sales based on date and search query
  const filteredSales = voidedSales.filter((sale) => {
    // Date filtering
    if (dateFilterMode === "day" && date) {
      const voidedDate = sale.voidedAt ? new Date(sale.voidedAt) : null;
      if (!voidedDate) return false;
      
      const isSameDay = 
        voidedDate.getDate() === date.getDate() &&
        voidedDate.getMonth() === date.getMonth() &&
        voidedDate.getFullYear() === date.getFullYear();
      
      if (!isSameDay) return false;
    } else if (dateFilterMode === "month") {
      const voidedDate = sale.voidedAt ? new Date(sale.voidedAt) : null;
      if (!voidedDate) return false;
      
      const isSameMonth = 
        voidedDate.getMonth() === selectedMonth - 1 &&
        voidedDate.getFullYear() === selectedYear;
      
      if (!isSameMonth) return false;
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCashier = sale.cashier?.name?.toLowerCase().includes(query);
      const matchesProduct = sale.SaleItem.some(item => 
        item.product.name.toLowerCase().includes(query)
      );
      const matchesId = sale.id.toLowerCase().includes(query);
      
      if (!matchesCashier && !matchesProduct && !matchesId) return false;
    }

    return true;
  });

  const formatCurrency = (amount: number) => {
    return `₱${Math.ceil(amount).toLocaleString()}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMonthAndYearTitle = () => {
    return `${months[selectedMonth - 1]} ${selectedYear}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading voided sales...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Voided Sales</h2>

      {/* Filters */}
      <div className="rounded-lg border bg-card shadow-sm p-6">
        <div className="flex items-center mb-4">
          <FilterIcon className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium whitespace-nowrap">View by:</span>
            <Select
              value={dateFilterMode}
              onValueChange={(value) => setDateFilterMode(value as DateFilterMode)}
            >
              <SelectTrigger className="w-[120px] focus:ring-primary">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilterMode === "day" ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size="auto"
                  className="w-full sm:w-auto justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  {date ? (
                    format(date, "MMMM do, yyyy")
                  ) : (
                    "Pick a date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <Button
                variant={"outline"}
                size="auto"
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon2 className="mr-2 h-4 w-4 flex-shrink-0" />
                {getMonthAndYearTitle()}
              </Button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger className="flex-1 sm:w-[120px] focus:ring-primary">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger className="flex-1 sm:w-[140px] focus:ring-primary">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by cashier, product, or sale ID..."
            className="pl-9 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {filteredSales.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {voidedSales.length === 0 
              ? "No voided sales found." 
              : "No voided sales match the selected filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredSales.length} voided sale{filteredSales.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-4">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="border-destructive/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Sale #{sale.id.slice(-8)}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Cashier: {sale.cashier?.name || "Unknown"}</span>
                        <Badge variant="destructive">VOIDED</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {sale.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Date Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created: </span>
                        <span>{formatDate(sale.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Voided: </span>
                        <span className="text-destructive font-medium">
                          {formatDate(sale.voidedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Sale Items */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Items:</h4>
                      <div className="space-y-2">
                        {sale.SaleItem.map((item) => {
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>Qty: {item.quantity}</span>
                                  {item.sackType && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.sackType.replace(/_/g, " ")}
                                    </Badge>
                                  )}
                                  {item.perKiloPriceId && (
                                    <Badge variant="outline" className="text-xs">
                                      Per Kilo
                                    </Badge>
                                  )}
                                  {item.isGantang && (
                                    <Badge variant="outline" className="text-xs">
                                      Gantang
                                    </Badge>
                                  )}
                                  {item.isSpecialPrice && (
                                    <Badge variant="outline" className="text-xs">
                                      Special Price
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total Items:</span>
                        <span>{sale.SaleItem.length}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-lg mt-2">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(sale.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
