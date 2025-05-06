"use client";

import React, { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableRow, TableFooter, TableHead, TableHeader } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign } from 'lucide-react';

interface ProfitItem {
  productKey: string;
  productName: string;
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

  const groupedData = salesData.reduce((acc, item) => {
    if (!acc[item.productKey]) {
      acc[item.productKey] = {
        ...item,
        normalQty: item.normalQty,
        specialQty: item.specialQty,
        normalProfit: item.normalProfit,
        specialProfit: item.specialProfit
      };
    } else {
      acc[item.productKey].normalQty += item.normalQty;
      acc[item.productKey].specialQty += item.specialQty;
    }
    return acc;
  }, {} as Record<string, ProfitItem>);

  const asinProducts = Object.values(groupedData).filter(p => p.isAsin);
  const otherProducts = Object.values(groupedData).filter(p => !p.isAsin);

  // Memoize the total profits calculation function
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
            {products.map((item, index) => (
              <React.Fragment key={`${item.productKey}-fragment-${index}`}>
                <TableRow key={`${item.productKey}-header-${index}`} className="bg-muted/30">
                  <TableCell colSpan={4} className="font-medium text-primary">
                    {item.productName}
                  </TableCell>
                </TableRow>
                {item.normalQty > 0 && (
                  <TableRow key={`${item.productKey}-normal-${index}`} className="hover:bg-muted/20">
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
                  <TableRow key={`${item.productKey}-special-${index}`} className="hover:bg-muted/20">
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
            ))}
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
