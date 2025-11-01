"use client";

import { useEffect, useState } from "react";
import { getVoidedSalesByUser } from "@/lib/server/Sales/getVoidedSalesByUser";
import type { GetVoidedSalesByUserPayload } from "../../../utils/types/Sales/getVoidedSalesByUser.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function VoidList() {
  const [voidedSales, setVoidedSales] = useState<GetVoidedSalesByUserPayload>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVoidedSales = async () => {
      try {
        setIsLoading(true);
        const data = await getVoidedSalesByUser();
        setVoidedSales(data);
      } catch (error) {
        console.error("Error loading voided sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoidedSales();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading voided sales...</div>
      </div>
    );
  }

  if (voidedSales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No voided sales found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Voided Sales</h2>
      
      <div className="grid gap-4">
        {voidedSales.map((sale) => (
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
                      const itemPrice = item.price || 
                        item.perKiloPrice?.price || 
                        item.SackPrice?.price || 
                        0;
                      
                      const totalPrice = itemPrice * item.quantity;
                      
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
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(totalPrice)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @ {formatCurrency(itemPrice)}
                            </p>
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
  );
}
