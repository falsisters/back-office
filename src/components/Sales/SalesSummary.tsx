"use client"

import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Package, ShoppingBag, CreditCard, Banknote, DollarSign } from "lucide-react"

interface CategoryTotals {
  sales: number
  quantity: number
  check: number
  bankTransfer: number
}

export default function SalesSummary({ sales }: { sales: GetAllSalesByUserIdPayload }) {
  const totals = {
    // Sack price items
    asinSack: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
    otherSack: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
    // Per kilo price items
    asinKilo: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
    otherKilo: { sales: 0, quantity: 0, check: 0, bankTransfer: 0 },
  }

  sales.forEach((sale) => {
    sale.SaleItem.forEach((item) => {
      const isAsin = item.product.name.toLowerCase().includes("asin")
      let category: keyof typeof totals

      if (item.sackPriceId && !item.perKiloPriceId) {
        // Commented out special price implementation
        // const sackPrice =
        //   item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
        //     ? item.product.SackPrice[0]?.specialPrice?.price
        //     : item.product.SackPrice[0]?.price || 0
        const sackPrice = item.product.SackPrice[0]?.price || 0;

        const displayPrice = item.isDiscounted && item.discountedPrice ? item.discountedPrice : sackPrice

        const itemTotal = displayPrice * item.quantity

        category = isAsin ? "asinSack" : "otherSack"

        totals[category].sales += itemTotal
        totals[category].quantity += item.quantity

        if (sale.paymentMethod === "CHECK") {
          totals[category].check += itemTotal
        } else if (sale.paymentMethod === "BANK_TRANSFER") {
          totals[category].bankTransfer += itemTotal
        }
      } else if (item.perKiloPriceId && !item.sackPriceId) {
        const kiloPrice = item.product.perKiloPrice?.price || 0

        const displayPrice = item.isDiscounted && item.discountedPrice ? item.discountedPrice : kiloPrice

        const itemTotal = displayPrice * item.quantity

        category = isAsin ? "asinKilo" : "otherKilo"

        totals[category].sales += itemTotal
        totals[category].quantity += item.quantity

        if (sale.paymentMethod === "CHECK") {
          totals[category].check += itemTotal
        } else if (sale.paymentMethod === "BANK_TRANSFER") {
          totals[category].bankTransfer += itemTotal
        }
      }
    })
  })

  const calculateCash = (category: CategoryTotals) => category.sales - category.check - category.bankTransfer

  // Calculate totals for sack items, per kilo items, and grand total
  const sackTotal = {
    sales: totals.asinSack.sales + totals.otherSack.sales,
    quantity: totals.asinSack.quantity + totals.otherSack.quantity,
    check: totals.asinSack.check + totals.otherSack.check,
    bankTransfer: totals.asinSack.bankTransfer + totals.otherSack.bankTransfer,
    cash: calculateCash(totals.asinSack) + calculateCash(totals.otherSack),
  }

  const kiloTotal = {
    sales: totals.asinKilo.sales + totals.otherKilo.sales,
    quantity: totals.asinKilo.quantity + totals.otherKilo.quantity,
    check: totals.asinKilo.check + totals.otherKilo.check,
    bankTransfer: totals.asinKilo.bankTransfer + totals.otherKilo.bankTransfer,
    cash: calculateCash(totals.asinKilo) + calculateCash(totals.otherKilo),
  }

  const grandTotal = {
    sales: sackTotal.sales + kiloTotal.sales,
    quantity: sackTotal.quantity + kiloTotal.quantity,
    check: sackTotal.check + kiloTotal.check,
    bankTransfer: sackTotal.bankTransfer + kiloTotal.bankTransfer,
    cash: sackTotal.cash + kiloTotal.cash,
  }

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
          {/* Sack Price Items Section */}
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                SACK PRICE ITEMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Asin Products
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{totals.asinSack.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">
                        ₱{Math.floor(totals.asinSack.sales).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <Separator className="bg-muted" />
              <div>
                <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Rice and Other Products
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{totals.otherSack.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">
                        ₱{Math.floor(totals.otherSack.sales).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <Separator className="bg-muted" />
              <div>
                <h3 className="font-bold mb-2 text-secondary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Sack Items Subtotal
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{sackTotal.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">
                        ₱{Math.floor(sackTotal.sales).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Per Kilo Price Items Section */}
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                PER KILO PRICE ITEMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  All Products
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">
                        {totals.asinKilo.quantity + totals.otherKilo.quantity}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">
                        ₱{Math.floor(totals.asinKilo.sales + totals.otherKilo.sales).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <Separator className="bg-muted" />
              <div>
                <h3 className="font-bold mb-2 text-secondary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Per Kilo Items Subtotal
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantity:</TableCell>
                      <TableCell className="text-right font-semibold">{kiloTotal.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Sales:</TableCell>
                      <TableCell className="text-right font-semibold text-secondary">
                        ₱{Math.floor(kiloTotal.sales).toLocaleString()}
                      </TableCell>
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
                  <TableCell className="text-right font-semibold text-secondary">
                    ₱{Math.floor(grandTotal.sales).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Check Deductions:
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    - ₱{Math.floor(grandTotal.check).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    Bank Transfer Deductions:
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    - ₱{Math.floor(grandTotal.bankTransfer).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-t-secondary/20">
                  <TableCell className="font-bold text-primary flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-secondary" />
                    Net Cash Total:
                  </TableCell>
                  <TableCell className="text-right font-bold text-secondary text-xl">
                    ₱{Math.floor(grandTotal.cash).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
