"use client";

import React, { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableRow, TableFooter, TableHead, TableHeader } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign } from 'lucide-react';
import { SackType } from "../../../utils/types/schema.type";

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
};

interface ProfitItem {
  productKey: string;
  productName: string;
  sackType?: SackType;
  priceType: 'sack' | 'per-kilo';
  normalQty: number;
  specialQty: number;
  isAsin: boolean;
  normalProfit: number;
  specialProfit?: number;
}

interface ProfitTrackerProps {
  salesData: ProfitItem[];
}

export default function ProfitTracker({ salesData }: ProfitTrackerProps) {
  // Group sales data with proper type separation
  const productGroups = salesData.reduce((acc, item) => {
    const key = `${item.productName}-${item.sackType || ''}-${item.priceType}`;
    
    if (!acc[key]) {
      acc[key] = {
        ...item,
        productName: item.productName,
        sackType: item.sackType,
        priceType: item.priceType,
        normalQty: item.normalQty,
        specialQty: item.specialQty,
        normalProfit: item.normalProfit,
        specialProfit: item.specialProfit,
        isAsin: item.isAsin
      };
    } else {
      acc[key].normalQty += item.normalQty;
      acc[key].specialQty += item.specialQty;
    }
    return acc;
  }, {} as Record<string, ProfitItem>);

  const formatProductName = (item: ProfitItem) => {
    let name = item.productName;
    if (item.priceType === 'sack' && item.sackType) {
      name += ` ${sackTypeLabels[item.sackType]}`;
    }
    if (item.priceType === 'per-kilo') {
      name += ' (Per Kilo)';
    }
    return name;
  };

  const groupedProducts = Object.values(productGroups);
  const asinProducts = groupedProducts.filter(p => p.isAsin);
  const otherProducts = groupedProducts.filter(p => !p.isAsin);

  const calculateTotalProfits = useCallback((products: ProfitItem[]) => {
    return products.reduce((total, item) => {
      const normalProfit = item.normalProfit * item.normalQty;
      const specialProfit = (item.specialProfit || 0) * item.specialQty;
      return total + normalProfit + specialProfit;
    }, 0);
  }, []);

  const asinTotalProfit = useMemo(() => calculateTotalProfits(asinProducts), [asinProducts, calculateTotalProfits]);
  const otherTotalProfit = useMemo(() => calculateTotalProfits(otherProducts), [otherProducts, calculateTotalProfits]);
  const grandTotalProfit = asinTotalProfit + otherTotalProfit;

  const renderProductTable = (products: ProfitItem[], title: string) => (
    <Card className="shadow-md border-t-4 border-t-primary">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead className="font-semibold">Product</TableHead>
              <TableHead className="font-semibold">Quantity</TableHead>
              <TableHead className="font-semibold">Profit Per Unit</TableHead>
              <TableHead className="font-semibold text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => {
              const displayName = formatProductName(item);
              return (
                <React.Fragment key={item.productKey}>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={4} className="font-medium text-primary">
                      {displayName}
                      <Badge variant="outline" className="ml-2">
                        {item.priceType === 'sack' 
                          ? `${sackTypeLabels[item.sackType!]} Sack`
                          : "Per Kilo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {item.normalQty > 0 && (
                    <TableRow className="hover:bg-muted/20">
                      <TableCell className="pl-8">Regular Price</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {item.normalQty}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₱{item.normalProfit}
                      </TableCell>
                      <TableCell className="text-right font-medium text-secondary">
                        ₱{item.normalProfit * item.normalQty}
                      </TableCell>
                    </TableRow>
                  )}
                  {item.specialQty > 0 && (
                    <TableRow className="hover:bg-muted/20">
                      <TableCell className="pl-8">Special Price</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                          {item.specialQty}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₱{item.specialProfit || 0}
                      </TableCell>
                      <TableCell className="text-right font-medium text-secondary">
                        ₱{(item.specialProfit || 0) * item.specialQty}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-bold">Total Profit</TableCell>
              <TableCell className="text-right font-bold text-secondary">
                ₱{title === 'ASIN PROFITS' ? asinTotalProfit : otherTotalProfit}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <Card className="shadow-md border-t-4 border-t-primary">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Profit Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderProductTable(asinProducts, 'ASIN PROFITS')}
          {renderProductTable(otherProducts, 'OTHER PRODUCTS PROFITS')}
        </div>
        <Card className="shadow-md border-t-4 border-t-secondary">
          <CardHeader className="pb-2 bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="text-secondary">Grand Total Profit</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-right text-secondary">
            ₱{grandTotalProfit}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}