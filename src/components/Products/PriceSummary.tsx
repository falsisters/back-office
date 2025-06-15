"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { CreditCard, Package, ShoppingBag } from "lucide-react";

interface PriceSummaryProps {
  products: ProductResponse[];
}

export default function PriceSummary({ products }: PriceSummaryProps) {
  const calculateTotalInventoryValue = () => {
    return products.reduce((total, product) => {
      // Safe calculation for sack prices
      const sackPriceValue = Array.isArray(product.SackPrice)
        ? product.SackPrice.reduce(
            (sackTotal, sackPrice) =>
              sackTotal + sackPrice.price * sackPrice.stock,
            0
          )
        : 0;

      // Safe calculation for per kilo prices (now nullable)
      const perKiloValue = product.perKiloPrice
        ? product.perKiloPrice.price * product.perKiloPrice.stock
        : 0;

      return total + sackPriceValue + perKiloValue;
    }, 0);
  };

  const calculateTotalStock = () => {
    return products.reduce((total, product) => {
      // Safe calculation for sack stock
      const sackStock = Array.isArray(product.SackPrice)
        ? product.SackPrice.reduce(
            (sackTotal, sackPrice) => sackTotal + sackPrice.stock,
            0
          )
        : 0;

      // Safe calculation for kilo stock (now nullable)
      const kiloStock = product.perKiloPrice ? product.perKiloPrice.stock : 0;

      return total + sackStock + kiloStock;
    }, 0);
  };

  return (
    <Card className="bg-card shadow-md border-t-2 border-t-secondary">
      <CardHeader className="pb-2 bg-gradient-to-r from-secondary/5 to-transparent">
        <CardTitle className="text-lg font-semibold text-secondary">
          Inventory Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:shadow-md transition-shadow">
            <div className="p-2 rounded-full bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Products
              </p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:shadow-md transition-shadow">
            <div className="p-2 rounded-full bg-secondary/10">
              <CreditCard className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Inventory Value
              </p>
              <p className="text-2xl font-bold">
                ₱
                {calculateTotalInventoryValue().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:shadow-md transition-shadow">
            <div className="p-2 rounded-full bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Stock
              </p>
              <p className="text-2xl font-bold">
                {calculateTotalStock().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
