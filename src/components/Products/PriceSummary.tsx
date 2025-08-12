"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { CreditCard, Package, ShoppingBag } from "lucide-react";
import { CurrencyCalculator } from "../../../utils/currencyCalculator";

interface PriceSummaryProps {
  products: ProductResponse[];
}

export default function PriceSummary({ products }: PriceSummaryProps) {
  // Helper function to safely parse API values (strings or numbers) to numbers
  const parseApiValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === "number") return value;
    return 0;
  };

  const calculateTotalInventoryValue = () => {
    try {
      return products.reduce((total, product) => {
        if (!product || typeof product !== "object") {
          console.warn("Invalid product in inventory calculation:", product);
          return total;
        }

        // Safe calculation for sack prices using decimal operations
        const sackPriceValue = Array.isArray(product.SackPrice)
          ? product.SackPrice.reduce((sackTotal: number, sackPrice: any) => {
              if (!sackPrice) {
                console.warn("Invalid sack price data:", sackPrice);
                return sackTotal;
              }

              const price = parseApiValue(sackPrice.price);
              const stock = parseApiValue(sackPrice.stock);

              if (price === 0 || stock === 0) {
                return sackTotal;
              }

              // Use CurrencyCalculator for precise decimal multiplication
              const value = CurrencyCalculator.multiply(price, stock);
              return CurrencyCalculator.add(sackTotal, value);
            }, 0)
          : 0;

        // Safe calculation for per kilo prices using decimal operations
        const perKiloValue = product.perKiloPrice
          ? (() => {
              const price = parseApiValue(product.perKiloPrice.price);
              const stock = parseApiValue(product.perKiloPrice.stock);

              if (price === 0 || stock === 0) {
                return 0;
              }

              return CurrencyCalculator.multiply(price, stock);
            })()
          : 0;

        return CurrencyCalculator.add(
          total,
          CurrencyCalculator.add(sackPriceValue, perKiloValue)
        );
      }, 0);
    } catch (error) {
      console.error("Error calculating inventory value:", error);
      return 0;
    }
  };

  const calculateTotalStock = () => {
    try {
      return products.reduce((total, product) => {
        if (!product || typeof product !== "object") {
          console.warn("Invalid product in stock calculation:", product);
          return total;
        }

        // Safe calculation for sack stock using decimal operations
        const sackStock = Array.isArray(product.SackPrice)
          ? product.SackPrice.reduce((sackTotal: number, sackPrice: any) => {
              if (!sackPrice) {
                console.warn("Invalid sack stock data:", sackPrice);
                return sackTotal;
              }

              const stock = parseApiValue(sackPrice.stock);
              return CurrencyCalculator.add(sackTotal, stock);
            }, 0)
          : 0;

        // Safe calculation for kilo stock using decimal operations
        const kiloStock = product.perKiloPrice
          ? parseApiValue(product.perKiloPrice.stock)
          : 0;

        return CurrencyCalculator.add(
          total,
          CurrencyCalculator.add(sackStock, kiloStock)
        );
      }, 0);
    } catch (error) {
      console.error("Error calculating total stock:", error);
      return 0;
    }
  };

  const formatCurrency = (value: number) => {
    try {
      if (typeof value !== "number" || isNaN(value)) {
        console.warn("Invalid value for currency formatting:", value);
        return "0.00";
      }
      // Use CurrencyCalculator for consistent rounding
      const roundedValue = CurrencyCalculator.round(value);
      return roundedValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "0.00";
    }
  };

  const formatNumber = (value: number) => {
    try {
      if (typeof value !== "number" || isNaN(value)) {
        console.warn("Invalid value for number formatting:", value);
        return "0";
      }
      // Round to avoid floating point precision issues
      const roundedValue = Math.round(value * 100) / 100;
      return roundedValue.toLocaleString();
    } catch (error) {
      console.error("Error formatting number:", error);
      return "0";
    }
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
              <p className="text-2xl font-bold">{products.length || 0}</p>
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
                ₱{formatCurrency(calculateTotalInventoryValue())}
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
                {formatNumber(calculateTotalStock())}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
