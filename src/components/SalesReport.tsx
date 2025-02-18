"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { PaymentMethod, type Sale } from "@/types/sales"
import { type Cashier, CashierPermissionType } from "@/types/cashiers"
import type { DateRange } from "react-day-picker"

const mockCashiers: Cashier[] = [
  {
    id: "1",
    name: "John Doe",
    accessKey: "1234",
    secureCode: "abcd1234",
    permissions: [
      { id: "1", name: CashierPermissionType.SALES_CHECK },
      { id: "2", name: CashierPermissionType.STOCKS },
    ],
  },
  {
    id: "2",
    name: "Jane Smith",
    accessKey: "5678",
    secureCode: "efgh5678",
    permissions: [
      { id: "3", name: CashierPermissionType.SALES_CHECK },
      { id: "4", name: CashierPermissionType.PRICES },
    ],
  },
]

// Mock data for sales
const mockSales: Sale[] = [
  {
    id: "1",
    cashierId: "1",
    total: 5000,
    paymentMethod: PaymentMethod.CASH,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
    items: [{ id: "1", productId: "1", qty: 2, price: 2500 }],
  },
  {
    id: "2",
    cashierId: "2",
    total: 3000,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    createdAt: new Date("2023-01-02"),
    updatedAt: new Date("2023-01-02"),
    items: [{ id: "2", productId: "2", qty: 1, price: 3000 }],
  },
]

export default function SalesReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [productFilter, setProductFilter] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "ALL">("ALL")
  const [cashierFilter, setCashierFilter] = useState<string>("ALL")

  const cashierMap = useMemo(() => {
    return mockCashiers.reduce(
      (acc, cashier) => {
        acc[cashier.id] = cashier.name
        return acc
      },
      {} as Record<string, string>,
    )
  }, [])

  const filteredSales = mockSales.filter((sale) => {
    const matchesDateRange =
      !dateRange?.from || !dateRange?.to || (sale.createdAt >= dateRange.from && sale.createdAt <= dateRange.to)
    const matchesProduct =
      !productFilter || sale.items.some((item) => item.productId.toLowerCase().includes(productFilter.toLowerCase()))
    const matchesPaymentMethod = paymentMethodFilter === "ALL" || sale.paymentMethod === paymentMethodFilter
    const matchesCashier = cashierFilter === "ALL" || sale.cashierId === cashierFilter
    return matchesDateRange && matchesProduct && matchesPaymentMethod && matchesCashier
  })

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalQuantity = filteredSales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.qty, 0),
    0,
  )

  const mockProfit = totalSales * 0.2

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <DateRangePicker date={dateRange} setDate={setDateRange} />
            <Input
              placeholder="Filter by product"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
            <Select
              value={paymentMethodFilter}
              onValueChange={(value) => setPaymentMethodFilter(value as PaymentMethod | "ALL")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                <SelectItem value={PaymentMethod.CHECK}>Check</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cashierFilter} onValueChange={(value) => setCashierFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Cashier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Cashiers</SelectItem>
                {mockCashiers.map((cashier) => (
                  <SelectItem key={cashier.id} value={cashier.id}>
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{cashierMap[sale.cashierId]}</TableCell>
                  <TableCell>{sale.items.map((item) => item.productId).join(", ")}</TableCell>
                  <TableCell>{sale.items.reduce((sum, item) => sum + item.qty, 0)}</TableCell>
                  <TableCell>₱{sale.total.toFixed(2)}</TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₱{totalSales.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalQuantity}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estimated Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₱{mockProfit.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

