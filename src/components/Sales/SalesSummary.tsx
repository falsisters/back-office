"use client"

import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Package, ShoppingBag, CreditCard, Banknote, DollarSign } from 'lucide-react'

interface CategoryTotals {
  sales: number;
  quantity: number;
  check: number;
  bankTransfer: number;
}

export default function SalesSummary({ sales }: { sales: GetAllSalesByUserIdPayload }) {
  const totals = {
    asinSack: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
    asinKilo: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
    otherSack: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
    otherKilo: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
  };

  sales.forEach((sale) => {
    sale.SaleItem.forEach((item) => {
      const price = item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
        ? item.product.SackPrice[0]?.specialPrice?.price
        : item.product.SackPrice[0]?.price || item.product.perKiloPrice?.price || 0;

      const itemTotal = price * item.quantity;
      const isAsin = item.product.name.toLowerCase().includes("asin");
      const isSack = item.product.SackPrice.length > 0;

      let category: keyof typeof totals;
      if (isAsin) {
        category = isSack ? "asinSack" : "asinKilo";
      } else {
        category = isSack ? "otherSack" : "otherKilo";
      }

      totals[category].sales += itemTotal;
      totals[category].quantity += item.quantity;

      if (sale.paymentMethod === "CHECK") {
        totals[category].check += itemTotal;
      } else if (sale.paymentMethod === "BANK_TRANSFER") {
        totals[category].bankTransfer += itemTotal;
      }
    });
  });

  const calculateCash = (category: CategoryTotals) => category.sales - category.check - category.bankTransfer;

  const grandTotal = {
    sales: Object.values(totals).reduce((sum, cat) => sum + cat.sales, 0),
    quantity: Object.values(totals).reduce((sum, cat) => sum + cat.quantity, 0),
    check: Object.values(totals).reduce((sum, cat) => sum + cat.check, 0),
    bankTransfer: Object.values(totals).reduce((sum, cat) => sum + cat.bankTransfer, 0),
    cash: Object.values(totals).reduce((sum, cat) => sum + calculateCash(cat), 0)
  };

  return (
    <Card className="shadow-md border-t-4 border-t-primary">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          OVERALL SALES SUMMARY
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Asin Section */}
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                ASIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Sacks
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{totals.asinSack.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">₱{Math.floor(totals.asinSack.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <Separator className="bg-muted" />
              <div>
                <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Per Kilo
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{totals.asinKilo.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">₱{Math.floor(totals.asinKilo.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Other Products Section */}
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                OTHER PRODUCTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Sacks
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{totals.otherSack.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">₱{Math.floor(totals.otherSack.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <Separator className="bg-muted" />
              <div>
                <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Per Kilo
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{totals.otherKilo.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">₱{Math.floor(totals.otherKilo.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grand Total */}
        <Card className="shadow-md border-t-4 border-t-secondary">
          <CardHeader className="pb-2 bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="text-secondary flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              GRAND TOTAL
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    Total Quantity:
                  </TableCell>
                  <TableCell className="text-right font-semibold">{grandTotal.quantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-secondary" />
                    Total Sales:
                  </TableCell>
                  <TableCell className="text-right font-semibold text-secondary">₱{Math.floor(grandTotal.sales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Check Deductions:
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">- ₱{Math.floor(grandTotal.check)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    Bank Transfer Deductions:
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">- ₱{Math.floor(grandTotal.bankTransfer)}</TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-t-secondary/20">
                  <TableCell className="font-bold text-primary flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-secondary" />
                    Net Cash Total:
                  </TableCell>
                  <TableCell className="text-right font-bold text-secondary text-xl">₱{Math.floor(grandTotal.cash)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
