"use client"

import { useEffect, useState } from "react"
import { getAllSalesByUserId } from "@/lib/server/getAllSalesByUserId"
import SalesSummary from "./SalesSummary"
import ProfitTracker from "./ProfitTracker"
import { PaymentMethodEnum, type SackType } from "../../../utils/types/schema.type"
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, SearchIcon, FilterIcon, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
}

export default function SalesList() {
  const [sales, setSales] = useState<GetAllSalesByUserIdPayload>([])
  const [filteredSales, setFilteredSales] = useState<GetAllSalesByUserIdPayload>([])
  const [productFilter, setProductFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<typeof PaymentMethodEnum._type | "ALL">("ALL")
  const [sackKiloFilter, setSackKiloFilter] = useState<"ALL" | "SACKS" | "PER_KILO">("ALL")
  const [asinOtherFilter, setAsinOtherFilter] = useState<"ALL" | "ASIN" | "OTHER">("ALL")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true)
        const data = await getAllSalesByUserId()
        setSales(data)
        const today = new Date()
        const filteredByDate = data.filter((sale) => {
          const saleDate = new Date(sale.createdAt)
          return saleDate.toDateString() === today.toDateString()
        })
        setFilteredSales(filteredByDate)
      } catch (error) {
        console.error("Error loading sales:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSales()
  }, [])

  useEffect(() => {
    let filtered = [...sales]

    // Date filter
    if (date) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt)
        return saleDate.toDateString() === date.toDateString()
      })
    }

    // Payment filter
    if (paymentFilter !== "ALL") {
      filtered = filtered.filter((sale) => sale.paymentMethod === paymentFilter)
    }

    // Product name filter
    if (productFilter) {
      filtered = filtered
        .map((sale) => ({
          ...sale,
          SaleItem: sale.SaleItem.filter((item) =>
            item.product.name.toLowerCase().includes(productFilter.toLowerCase()),
          ),
        }))
        .filter((sale) => sale.SaleItem.length > 0)
    }

    // Sack/Kilo filter
    filtered = filtered
      .map((sale) => ({
        ...sale,
        SaleItem: sale.SaleItem.filter((item) => {
          const isSack = item.product.SackPrice.length > 0
          return (
            sackKiloFilter === "ALL" ||
            (sackKiloFilter === "SACKS" && isSack) ||
            (sackKiloFilter === "PER_KILO" && !isSack)
          )
        }),
      }))
      .filter((sale) => sale.SaleItem.length > 0)

    // Asin/Other filter
    filtered = filtered
      .map((sale) => ({
        ...sale,
        SaleItem: sale.SaleItem.filter((item) => {
          const isAsin = item.product.name.toLowerCase().includes("asin")
          return (
            asinOtherFilter === "ALL" ||
            (asinOtherFilter === "ASIN" && isAsin) ||
            (asinOtherFilter === "OTHER" && !isAsin)
          )
        }),
      }))
      .filter((sale) => sale.SaleItem.length > 0)

    setFilteredSales(filtered)
  }, [productFilter, paymentFilter, sackKiloFilter, asinOtherFilter, date, sales])

  const groupSalesByDate = () => {
    const grouped: Record<string, GetAllSalesByUserIdPayload> = {}

    filteredSales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt).toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!grouped[saleDate]) grouped[saleDate] = []
      grouped[saleDate].push(sale)
    })

    return grouped
  }

  const groupedSales = groupSalesByDate()

  const renderSalesItems = (sales: GetAllSalesByUserIdPayload) => {
    return sales.flatMap((sale) =>
      sale.SaleItem.map((item) => {
        const sackType = item.product.SackPrice[0]?.type as SackType | undefined
        const sackTypeLabel = sackType ? sackTypeLabels[sackType] : ""
        const price =
          item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
            ? item.product.SackPrice[0]?.specialPrice?.price
            : item.product.SackPrice[0]?.price || item.product.perKiloPrice?.price || 0

        const totalPrice = Math.floor(price * item.quantity)
        const paymentInfo = sale.paymentMethod !== "CASH" ? ` (${sale.paymentMethod.replace("_", " ")})` : ""
        const specialPriceInfo = item.isSpecialPrice ? " (special price)" : ""
        const gantangInfo = item.isGantang ? " (gantang)" : ""

        return (
          <div key={`${item.id}-${sale.id}`} className="py-2 border-b hover:bg-muted/20 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <span className="font-medium">
                  {item.quantity} {item.product.name}
                  {sackTypeLabel && ` ${sackTypeLabel}`}
                  {specialPriceInfo}
                  {gantangInfo}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold text-secondary">₱{totalPrice.toLocaleString()}</span>
                <span className="text-muted-foreground ml-2">{paymentInfo}</span>
              </div>
            </div>
          </div>
        )
      }),
    )
  }

  const mappedSalesData = Object.values(groupedSales).flatMap((dateSales) =>
    dateSales.flatMap((sale) =>
      sale.SaleItem.map((item) => {
        const sackType = item.product.SackPrice[0]?.type as SackType | undefined
        const isSpecial = item.isSpecialPrice

        const normalProfit = isSpecial 
          ? item.product.SackPrice[0]?.specialPrice?.profit || 0
          : item.product.SackPrice[0]?.profit || item.product.perKiloPrice?.profit || 0
        const specialProfit = isSpecial 
          ? item.product.SackPrice[0]?.specialPrice?.profit || 0
          : 0

        return {
          productKey: `${item.product.name}-${sackType || "perKilo"}-${isSpecial ? "special" : "normal"}`,
          productName: `${item.product.name} ${sackType ? sackTypeLabels[sackType] : ""}`,
          normalQty: !isSpecial ? item.quantity : 0,
          specialQty: isSpecial ? item.quantity : 0,
          isAsin: item.product.name.toLowerCase().includes("asin"),
          normalProfit: !isSpecial ? normalProfit : 0,
          specialProfit: isSpecial ? specialProfit : 0
        }
      }),
    ),
  )

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Sales</h1>
      <div className="rounded-lg border bg-card shadow-sm p-6">
        <div className="flex items-center mb-4">
          <FilterIcon className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold">Sales Filters</h3>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by product..."
              className="pl-9 focus-visible:ring-primary"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
          </div>

          <Select
            value={paymentFilter}
            onValueChange={(value) => setPaymentFilter(value as typeof PaymentMethodEnum._type | "ALL")}
          >
            <SelectTrigger className="w-[180px] focus:ring-primary">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              {Object.values(PaymentMethodEnum.Values).map((method) => (
                <SelectItem key={method} value={method}>
                  {method.replace("_", " ").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sackKiloFilter}
            onValueChange={(value) => setSackKiloFilter(value as "ALL" | "SACKS" | "PER_KILO")}
          >
            <SelectTrigger className="w-[180px] focus:ring-primary">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="SACKS">Sacks</SelectItem>
              <SelectItem value="PER_KILO">Per Kilo</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={asinOtherFilter}
            onValueChange={(value) => setAsinOtherFilter(value as "ALL" | "ASIN" | "OTHER")}
          >
            <SelectTrigger className="w-[180px] focus:ring-primary">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Products</SelectItem>
              <SelectItem value="ASIN">Asin</SelectItem>
              <SelectItem value="OTHER">Other Products</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMMM do, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading sales data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {Object.entries(groupSalesByDate()).map(([dateString, sales]) => (
            <Card key={dateString} className="shadow-md border-l-4 border-l-primary">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {dateString}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">{renderSalesItems(sales)}</div>
              </CardContent>
            </Card>
          ))}

          {filteredSales.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center flex flex-col items-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No sales found matching your filters.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredSales.length > 0 && (
            <>
              <SalesSummary sales={filteredSales} />
              <ProfitTracker salesData={mappedSalesData} />
            </>
          )}
        </>
      )}
    </div>
  )
}

