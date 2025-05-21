"use client";

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
import { PaymentMethodEnum } from "../../../utils/types/schema.type";

type DateFilterMode = "day" | "month";
type ViewMode = "perSale" | "perProduct";
type PaymentFilter = typeof PaymentMethodEnum._type | "ALL";
type SackKiloFilter = "ALL" | "SACKS" | "PER_KILO";
type AsinOtherFilter = "ALL" | "ASIN" | "OTHER";

interface SalesFiltersProps {
  dateFilterMode: DateFilterMode;
  setDateFilterMode: (mode: DateFilterMode) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  productFilter?: string;
  setProductFilter?: (filter: string) => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  paymentFilter?: PaymentFilter;
  setPaymentFilter?: (filter: PaymentFilter) => void;
  sackKiloFilter?: SackKiloFilter;
  setSackKiloFilter?: (filter: SackKiloFilter) => void;
  asinOtherFilter?: AsinOtherFilter;
  setAsinOtherFilter?: (filter: AsinOtherFilter) => void;
  hideExtraFilters?: boolean;
  title?: string;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function SalesFilters({
  dateFilterMode,
  setDateFilterMode,
  date,
  setDate,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  productFilter = "",
  setProductFilter = () => {},
  viewMode = "perSale",
  setViewMode = () => {},
  paymentFilter = "ALL",
  setPaymentFilter = () => {},
  sackKiloFilter = "ALL",
  setSackKiloFilter = () => {},
  asinOtherFilter = "ALL",
  setAsinOtherFilter = () => {},
  hideExtraFilters = false,
  title = "Sales Filters",
}: SalesFiltersProps) {
  const getMonthAndYearTitle = () => {
    return `${months[selectedMonth - 1]} ${selectedYear}`;
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm p-6">
      <div className="flex items-center mb-4">
        <FilterIcon className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">View by:</span>
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
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "MMMM do, yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              className="w-[180px] justify-start text-left font-normal"
            >
              <CalendarIcon2 className="mr-2 h-4 w-4" />
              {getMonthAndYearTitle()}
            </Button>
            
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-[120px] focus:ring-primary">
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
              <SelectTrigger className="w-[140px] focus:ring-primary">
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
        )}
      </div>

      {!hideExtraFilters && (
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by product..."
              className="pl-9 focus-visible:ring-primary"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
          </div>
          
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
          >
            <SelectTrigger className="w-[180px] focus:ring-primary">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perSale">View by Sale</SelectItem>
              <SelectItem value="perProduct">View by Product</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={paymentFilter}
            onValueChange={(value) => setPaymentFilter(value as PaymentFilter)}
          >
            <SelectTrigger className="w-[180px] focus:ring-primary">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              {Object.values(PaymentMethodEnum.Values).map((method) => (
                <SelectItem key={method} value={method}>
                  {method.replace("_", " ").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sackKiloFilter}
            onValueChange={(value) => setSackKiloFilter(value as SackKiloFilter)}
          >
            <SelectTrigger className="w-[180px] focus:ring-primary">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="SACKS">Sacks</SelectItem>
              <SelectItem value="PER_KILO">Per Kilo</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={asinOtherFilter}
            onValueChange={(value) => setAsinOtherFilter(value as AsinOtherFilter)}
          >
            <SelectTrigger className="w-[180px] focus:ring-primary">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Products</SelectItem>
              <SelectItem value="ASIN">Asin</SelectItem>
              <SelectItem value="OTHER">Rice & Other Products</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}