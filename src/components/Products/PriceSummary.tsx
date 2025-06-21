"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { CreditCard, Package, ShoppingBag } from "lucide-react";

interface PriceSummaryProps {
  products: ProductResponse[];
}

export default function PriceSummary({ products }: PriceSummaryProps) {
  const calculateTotalInventoryValue = () => {
    try {
      return products.reduce((total, product) => {
        if (!product || typeof product !== 'object') {
          console.warn('Invalid product in inventory calculation:', product);
          return total;
        }

        // Safe calculation for sack prices
        const sackPriceValue = Array.isArray(product.SackPrice)
          ? product.SackPrice.reduce(
              (sackTotal: number, sackPrice: any) => {
                if (!sackPrice || typeof sackPrice.price !== 'number' || typeof sackPrice.stock !== 'number') {
                  console.warn('Invalid sack price data:', sackPrice);
                  return sackTotal;
                }
                return sackTotal + (sackPrice.price * sackPrice.stock);
              },
              0
            )
          : 0;

        // Safe calculation for per kilo prices (now nullable)
        const perKiloValue = product.perKiloPrice && 
          typeof product.perKiloPrice.price === 'number' && 
          typeof product.perKiloPrice.stock === 'number'
          ? product.perKiloPrice.price * product.perKiloPrice.stock
          : 0;

        return total + sackPriceValue + perKiloValue;
      }, 0);
    } catch (error) {
      console.error('Error calculating inventory value:', error);
      return 0;
    }
  };

  const calculateTotalStock = () => {
    try {
      return products.reduce((total, product) => {
        if (!product || typeof product !== 'object') {
          console.warn('Invalid product in stock calculation:', product);
          return total;
        }

        // Safe calculation for sack stock
        const sackStock = Array.isArray(product.SackPrice)
          ? product.SackPrice.reduce(
              (sackTotal: number, sackPrice: any) => {
                if (!sackPrice || typeof sackPrice.stock !== 'number') {
                  console.warn('Invalid sack stock data:', sackPrice);
                  return sackTotal;
                }
                return sackTotal + sackPrice.stock;
              },
              0
            )
          : 0;

        // Safe calculation for kilo stock (now nullable)
        const kiloStock = product.perKiloPrice && typeof product.perKiloPrice.stock === 'number'
          ? product.perKiloPrice.stock 
          : 0;

        return total + sackStock + kiloStock;
      }, 0);
    } catch (error) {
      console.error('Error calculating total stock:', error);
      return 0;
    }
  };

  const formatCurrency = (value: number) => {
    try {
      if (typeof value !== 'number' || isNaN(value)) {
        console.warn('Invalid value for currency formatting:', value);
        return '0.00';
      }
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '0.00';
    }
  };

  const formatNumber = (value: number) => {
    try {
      if (typeof value !== 'number' || isNaN(value)) {
        console.warn('Invalid value for number formatting:', value);
        return '0';
      }
      return value.toLocaleString();
    } catch (error) {
      console.error('Error formatting number:', error);
      return '0';
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
              </p>              <p className="text-2xl font-bold">{products.length || 0}</p>
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
