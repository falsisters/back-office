"use client";

import { useEffect, useState } from "react";
import {
  getSalesCheckByCashier,
  getTotalSalesByCashier,
  SalesCheckItem,
  TotalSalesResponse,
} from "@/lib/server/Sales/getSalesCheck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  DollarSign,
  CreditCard,
  Banknote,
  Calculator,
} from "lucide-react";
import { SalesFilters } from "./SalesFilter";
import { LoadingSales } from "./LoadingSales";
import { NoSalesFound } from "./NoSalesFound";
import { supabase } from "@/lib/supabase";

interface CashierSalesListNewProps {
  cashierId: string;
  refreshTrigger?: number;
}

export default function CashierSalesListNew({
  cashierId,
  refreshTrigger,
}: CashierSalesListNewProps) {
  const [salesCheck, setSalesCheck] = useState<SalesCheckItem[]>([]);
  const [totalSales, setTotalSales] = useState<TotalSalesResponse | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterMode, setDateFilterMode] = useState<"day" | "month">("day");
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    () => new Date().getMonth() + 1
  );

  const formatDateForAPI = (inputDate?: Date) => {
    if (!inputDate) return undefined;

    if (dateFilterMode === "day") {
      return inputDate.toISOString().split("T")[0]; // YYYY-MM-DD
    } else {
      return `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    }
  };

  const refreshSalesData = async () => {
    if (!cashierId) return;

    try {
      const apiDate = formatDateForAPI(date);
      const [salesCheckData, totalSalesData] = await Promise.all([
        getSalesCheckByCashier(cashierId, apiDate, true),
        getTotalSalesByCashier(cashierId, apiDate, true),
      ]);

      setSalesCheck(salesCheckData);
      setTotalSales(totalSalesData);
    } catch (error) {
      console.error("Error refreshing cashier sales:", error);
    }
  };

  useEffect(() => {
    const loadSales = async () => {
      if (!cashierId) return;

      try {
        setIsLoading(true);
        const apiDate = formatDateForAPI(date);

        const [salesCheckData, totalSalesData] = await Promise.all([
          getSalesCheckByCashier(cashierId, apiDate, false),
          getTotalSalesByCashier(cashierId, apiDate, false),
        ]);

        setSalesCheck(salesCheckData);
        setTotalSales(totalSalesData);
      } catch (error) {
        console.error("Error loading sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSales();
  }, [cashierId, date, dateFilterMode, selectedYear, selectedMonth]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refreshSalesData();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const channelA = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        () => {
          refreshSalesData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelA);
    };
  }, [cashierId, date, dateFilterMode, selectedYear, selectedMonth]);

  const parseProductType = (priceType: string) => {
    switch (priceType) {
      case "50KG":
        return "50KG";
      case "25KG":
        return "25KG";
      case "5KG":
        return "5KG";
      case "KG":
        return "Per Kilo";
      default:
        return priceType;
    }
  };

  return (
    <div className="space-y-6">
      <SalesFilters
        dateFilterMode={dateFilterMode}
        setDateFilterMode={setDateFilterMode}
        date={date}
        setDate={setDate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        hideExtraFilters={true}
        title="Sales Check Filters"
      />

      {isLoading ? (
        <LoadingSales />
      ) : (
        <>
          {/* Sales Check Summary */}
          {salesCheck.length > 0 && (
            <Card className="shadow-md border-t-4 border-t-primary">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Sales Summary by Product
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {salesCheck.map((product, index) => (
                    <Card key={index} className="border-l-4 border-l-secondary">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            {product.productName}
                          </CardTitle>
                          <Badge variant="outline" className="bg-secondary/10">
                            {parseProductType(
                              product.productName.split(" ").pop() || ""
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Total Quantity
                            </p>
                            <p className="text-lg font-semibold">
                              {product.totalQuantity}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Total Amount
                            </p>
                            <p className="text-lg font-semibold text-secondary">
                              ₱
                              {parseFloat(product.totalAmount).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Cash
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              ₱
                              {parseFloat(
                                product.paymentTotals.cash
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Non-Cash
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              ₱
                              {(
                                parseFloat(product.paymentTotals.check) +
                                parseFloat(product.paymentTotals.bankTransfer)
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <p>{product.items.length} individual sales</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Total Sales Details */}
          {totalSales && (
            <Card className="shadow-md border-t-4 border-t-secondary">
              <CardHeader className="pb-2 bg-gradient-to-r from-secondary/5 to-transparent">
                <CardTitle className="text-secondary flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Detailed Sales List
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-center">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {totalSales.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/20">
                        <TableCell className="font-mono text-sm">
                          {item.formattedTime}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {parseProductType(item.priceType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {parseFloat(item.quantity).toFixed(
                            item.priceType === "KG" ? 2 : 0
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          ₱{parseFloat(item.unitPrice).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ₱{parseFloat(item.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              item.paymentMethod === "CASH"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.paymentMethod.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Quantity
                          </p>
                          <p className="font-semibold">
                            {totalSales.summary.totalQuantity}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-secondary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Sales
                          </p>
                          <p className="font-semibold text-secondary">
                            ₱
                            {parseFloat(
                              totalSales.summary.totalAmount
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Cash</p>
                          <p className="font-semibold text-green-600">
                            ₱
                            {parseFloat(
                              totalSales.summary.paymentTotals.cash
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Non-Cash
                          </p>
                          <p className="font-semibold text-blue-600">
                            ₱
                            {(
                              parseFloat(
                                totalSales.summary.paymentTotals.check
                              ) +
                              parseFloat(
                                totalSales.summary.paymentTotals.bankTransfer
                              )
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {salesCheck.length === 0 && !totalSales && <NoSalesFound />}
        </>
      )}
    </div>
  );
}
