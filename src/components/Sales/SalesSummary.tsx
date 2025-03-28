"use client"

import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

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
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">OVERALL SALES SUMMARY</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Asin Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>ASIN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Sacks</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Quantity:</TableCell>
                      <TableCell className="text-right">{totals.asinSack.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Sales:</TableCell>
                      <TableCell className="text-right">₱{Math.floor(totals.asinSack.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <h3 className="font-bold mb-2">Per Kilo</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Quantity:</TableCell>
                      <TableCell className="text-right">{totals.asinKilo.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Sales:</TableCell>
                      <TableCell className="text-right">₱{Math.floor(totals.asinKilo.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Other Products Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>OTHER PRODUCTS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Sacks</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Quantity:</TableCell>
                      <TableCell className="text-right">{totals.otherSack.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Sales:</TableCell>
                      <TableCell className="text-right">₱{Math.floor(totals.otherSack.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <h3 className="font-bold mb-2">Per Kilo</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Quantity:</TableCell>
                      <TableCell className="text-right">{totals.otherKilo.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Sales:</TableCell>
                      <TableCell className="text-right">₱{Math.floor(totals.otherKilo.sales)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grand Total */}
        <Card className="bg-muted">
          <CardHeader className="pb-2">
            <CardTitle>GRAND TOTAL</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Total Quantity:</TableCell>
                  <TableCell className="text-right">{grandTotal.quantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Sales:</TableCell>
                  <TableCell className="text-right">₱{Math.floor(grandTotal.sales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Check Deductions:</TableCell>
                  <TableCell className="text-right">- ₱{Math.floor(grandTotal.check)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Bank Transfer Deductions:</TableCell>
                  <TableCell className="text-right">- ₱{Math.floor(grandTotal.bankTransfer)}</TableCell>
                </TableRow>
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">Net Cash Total:</TableCell>
                  <TableCell className="text-right font-bold">₱{Math.floor(grandTotal.cash)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}