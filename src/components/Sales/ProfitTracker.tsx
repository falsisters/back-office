"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitItem {
  productKey: string;
  productName: string;
  normalQty: number;
  specialQty: number;
  isAsin: boolean;
}

interface ProfitTrackerProps {
  salesData: ProfitItem[];
}

export default function ProfitTracker({ salesData }: ProfitTrackerProps) {
  const [profits, setProfits] = useState<Record<string, { normal: number; special: number }>>({});

  const groupedData = salesData.reduce((acc, item) => {
    if (!acc[item.productKey]) {
      acc[item.productKey] = {
        ...item,
        normalQty: item.normalQty,
        specialQty: item.specialQty
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
      const normalProfit = (profits[item.productKey]?.normal || 0) * item.normalQty;
      const specialProfit = (profits[item.productKey]?.special || 0) * item.specialQty;
      return total + normalProfit + specialProfit;
    }, 0);
  }, [profits]);

  const asinTotalProfit = useMemo(() => calculateTotalProfits(asinProducts), [asinProducts, calculateTotalProfits]);
  const otherTotalProfit = useMemo(() => calculateTotalProfits(otherProducts), [otherProducts, calculateTotalProfits]);
  const grandTotalProfit = asinTotalProfit + otherTotalProfit;

  const renderProductTable = (products: ProfitItem[], title: string) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {products.map((item, index) => (
              <React.Fragment key={`${item.productKey}-fragment-${index}`}>
                <TableRow key={`${item.productKey}-header-${index}`}>
                  <TableCell colSpan={3} className="font-medium bg-muted">
                    {item.productName}
                  </TableCell>
                </TableRow>
                {item.normalQty > 0 && (
                  <TableRow key={`${item.productKey}-normal-${index}`}>
                    <TableCell className="pl-8">{item.normalQty} (Regular)</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="Profit"
                        onChange={(e) =>
                          setProfits((prev) => ({
                            ...prev,
                            [item.productKey]: {
                              ...prev[item.productKey],
                              normal: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ₱{(profits[item.productKey]?.normal || 0) * item.normalQty}
                    </TableCell>
                  </TableRow>
                )}
                {item.specialQty > 0 && (
                  <TableRow key={`${item.productKey}-special-${index}`}>
                    <TableCell className="pl-8">{item.specialQty} (Special)</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="Profit"
                        onChange={(e) =>
                          setProfits((prev) => ({
                            ...prev,
                            [item.productKey]: {
                              ...prev[item.productKey],
                              special: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ₱{(profits[item.productKey]?.special || 0) * item.specialQty}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-bold">Total Profit</TableCell>
              <TableCell className="text-right font-bold">
                ₱{title === 'ASIN PROFITS' ? asinTotalProfit : otherTotalProfit}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderProductTable(asinProducts, 'ASIN PROFITS')}
          {renderProductTable(otherProducts, 'OTHER PRODUCTS PROFITS')}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Grand Total Profit</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-right">
            ₱{grandTotalProfit}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}