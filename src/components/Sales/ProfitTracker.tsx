"use client"

import { useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableRow, TableFooter, TableHead, TableHeader } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign } from "lucide-react"
import type { SackType } from "../../../utils/types/schema.type"

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
}

interface ProfitItem {
  productKey: string
  productName: string
  sackType?: SackType
  priceType: "sack" | "per-kilo"
  normalQty: number
  specialQty: number
  isAsin: boolean
  normalProfit: number
  specialProfit?: number
}

interface ProfitTrackerProps {
  salesData: ProfitItem[]
  previousDaySalesData: ProfitItem[]
  selectedDate: Date
  dateFilterMode: "day" | "month" // Add this prop
}

export default function ProfitTracker({ salesData, previousDaySalesData, selectedDate, dateFilterMode }: ProfitTrackerProps) {
  const filteredSalesData = salesData.filter((item) => item.priceType === "sack")

  // Group sales data with proper type separation
  const productGroups = filteredSalesData.reduce(
    (acc, item) => {
      const key = `${item.productName}-${item.sackType || ""}`

      if (!acc[key]) {
        acc[key] = {
          ...item,
          productName: item.productName,
          sackType: item.sackType,
          priceType: "sack",
          normalQty: item.normalQty,
          specialQty: item.specialQty,
          normalProfit: item.normalProfit,
          specialProfit: item.specialProfit,
          isAsin: item.isAsin,
        }
      } else {
        acc[key].normalQty += item.normalQty
        acc[key].specialQty += item.specialQty
      }
      return acc
    },
    {} as Record<string, ProfitItem>,
  )

  const groupedProducts = Object.values(productGroups)
  const asinProducts = groupedProducts.filter((p) => p.isAsin)
  const otherProducts = groupedProducts.filter((p) => !p.isAsin)

  const calculateTotalProfits = useCallback((products: ProfitItem[]) => {
    return products.reduce((total, item) => {
      const normalProfit = item.normalProfit * item.normalQty
      const specialProfit = (item.specialProfit || 0) * item.specialQty
      return total + normalProfit + specialProfit
    }, 0)
  }, [])

  const asinTotalProfit = useMemo(() => calculateTotalProfits(asinProducts), [asinProducts, calculateTotalProfits])
  const otherTotalProfit = useMemo(() => calculateTotalProfits(otherProducts), [otherProducts, calculateTotalProfits])
  const grandTotalProfit = asinTotalProfit + otherTotalProfit

  // Previous day's data
  const previousDayProducts = previousDaySalesData.filter((item) => item.priceType === "sack")
  const previousDayProductGroups = previousDayProducts.reduce(
    (acc, item) => {
      const key = `${item.productName}-${item.sackType || ""}`

      if (!acc[key]) {
        acc[key] = {
          ...item,
          productName: item.productName,
          sackType: item.sackType,
          priceType: "sack",
          normalQty: item.normalQty,
          specialQty: item.specialQty,
          normalProfit: item.normalProfit,
          specialProfit: item.specialProfit,
          isAsin: item.isAsin,
        }
      } else {
        acc[key].normalQty += item.normalQty
        acc[key].specialQty += item.specialQty
      }
      return acc
    },
    {} as Record<string, ProfitItem>,
  )
  const previousDayGroupedProducts = Object.values(previousDayProductGroups)
  const previousDayAsinProducts = previousDayGroupedProducts.filter((p) => p.isAsin)
  const previousDayOtherProducts = previousDayGroupedProducts.filter((p) => !p.isAsin)

  const previousDayAsinTotalProfit = useMemo(() => calculateTotalProfits(previousDayAsinProducts), [previousDayAsinProducts, calculateTotalProfits])
  const previousDayOtherTotalProfit = useMemo(() => calculateTotalProfits(previousDayOtherProducts), [previousDayOtherProducts, calculateTotalProfits])
  const previousDayGrandTotal = previousDayAsinTotalProfit + previousDayOtherTotalProfit

  const overallGrandTotal = grandTotalProfit + previousDayGrandTotal

  // Create separate rows for regular and special prices
  const createProductRows = (products: ProfitItem[]) => {
    const rows: Array<{
      key: string
      product: string
      priceType: string
      sackType: string
      quantity: number
      profit: number
      total: number
    }> = []

    products.forEach((item) => {
      if (item.normalQty > 0) {
        rows.push({
          key: `${item.productKey}-normal`,
          product: item.productName,
          priceType: "Regular Price",
          sackType: sackTypeLabels[item.sackType!],
          quantity: item.normalQty,
          profit: item.normalProfit,
          total: item.normalProfit * item.normalQty,
        })
      }

      if (item.specialQty > 0) {
        rows.push({
          key: `${item.productKey}-special`,
          product: item.productName,
          priceType: "Special Price",
          sackType: sackTypeLabels[item.sackType!],
          quantity: item.specialQty,
          profit: item.specialProfit || 0,
          total: (item.specialProfit || 0) * item.specialQty,
        })
      }
    })

    return rows
  }

  const renderProductTable = (products: ProfitItem[], title: string) => {
    const productRows = createProductRows(products)

    return (
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
                <TableHead className="font-semibold">Price Type</TableHead>
                <TableHead className="font-semibold">Sack Type</TableHead>
                <TableHead className="font-semibold text-center">Quantity</TableHead>
                <TableHead className="font-semibold text-center">Profit/Unit</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productRows.map((row) => (
                <TableRow key={row.key} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{row.product}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.priceType === "Regular Price"
                          ? "bg-primary/5 text-primary border-primary/20"
                          : "bg-secondary/10 text-secondary border-secondary/20"
                      }
                    >
                      {row.priceType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.sackType}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        row.priceType === "Regular Price"
                          ? "bg-primary/5 text-primary border-primary/20"
                          : "bg-secondary/10 text-secondary border-secondary/20"
                      }
                    >
                      {row.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">₱{row.profit}</TableCell>
                  <TableCell className="text-right font-medium text-secondary">₱{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="font-bold">
                  Total Profit
                </TableCell>
                <TableCell className="text-right font-bold text-secondary">
                  ₱{title === "ASIN PROFITS" ? asinTotalProfit : otherTotalProfit}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-t-4 border-t-primary">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Profit Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-6">
          {/* Current Day's Tables */}
          {renderProductTable(otherProducts, "RICE AND OTHER PRODUCTS PROFITS")}
          {renderProductTable(asinProducts, "ASIN PROFITS")}
        </div>

        {/* Updated Overall Total Card */}
        <Card className="shadow-md border-t-4 border-t-secondary">
          <CardHeader className="pb-2 bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="text-secondary">
              {dateFilterMode === "day" ? "Overall Total Profit (2 Days)" : "Total Month Profit"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dateFilterMode === "day" ? (
                <>
                  <div className="flex justify-between text-lg">
                    <span>Previous Day ({new Date(selectedDate.getTime() - 86400000).toLocaleDateString()}):</span>
                    <span className="font-semibold">₱{previousDayGrandTotal}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Current Day ({selectedDate.toLocaleDateString()}):</span>
                    <span className="font-semibold">₱{grandTotalProfit}</span>
                  </div>
                  <div className="flex justify-between text-2xl border-t pt-2">
                    <span className="font-bold">Overall Total:</span>
                    <span className="font-bold text-secondary">₱{overallGrandTotal}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-2xl border-t pt-2">
                  <span className="font-bold mt-2">Total:</span>
                  <span className="font-bold text-secondary mt-2">₱{grandTotalProfit}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
