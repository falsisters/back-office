"use client"

import { useState } from "react"
import { DeliveryItem } from "@/components/Deliveries/DeliveryItem"
import { Input } from "@/components/ui/input"
import type { GetAllDeliveriesByUserIdPayload } from "../../../utils/types/getAllDeliveriesByUserId.type"
import { format } from "date-fns"
import { CalendarIcon, TruckIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DeliveryListProps {
  initialDeliveries: GetAllDeliveriesByUserIdPayload
}

export function DeliveryList({ initialDeliveries }: DeliveryListProps) {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!dateFilter) return true
    const deliveryDate = format(new Date(delivery.createdAt), "yyyy-MM-dd")
    return deliveryDate === dateFilter
  })

  const handleDeleteDelivery = (deletedDeliveryId: string) => {
    // Store the current state before deletion for potential recovery
    const previousDeliveries = [...deliveries]

    // Optimistically update the UI
    setDeliveries((prev) => prev.filter((d) => d.id !== deletedDeliveryId))

    // Return a function that can revert the deletion if needed
    return () => {
      setDeliveries(previousDeliveries)
    }
  }

  return (
    <Card className="shadow-md border-t-4 border-t-primary">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">Delivery Management</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[200px] pl-9 focus-visible:ring-primary border-primary/20"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {!filteredDeliveries.length ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed bg-muted/20">
            <TruckIcon className="w-12 h-12 text-primary/40 mb-4" />
            <p className="text-muted-foreground font-medium">No deliveries found</p>
            {!!dateFilter && (
              <p className="text-sm text-muted-foreground mt-2">for {format(new Date(dateFilter), "MMM dd, yyyy")}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeliveries.map((delivery) => (
              <DeliveryItem key={delivery.id} delivery={delivery} onDelete={handleDeleteDelivery} />
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground text-center pt-2">
          {filteredDeliveries.length > 0 ? (
            <>
              Showing {filteredDeliveries.length} {filteredDeliveries.length === 1 ? "delivery" : "deliveries"}
              {dateFilter && <> for {format(new Date(dateFilter), "MMMM d, yyyy")}</>}
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

