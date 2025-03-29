"use client"

import { useState } from "react"
import { DeliveryItem } from "@/components/Deliveries/DeliveryItem"
import { Input } from "@/components/ui/input"
import type { GetAllDeliveriesByUserIdPayload } from "../../../utils/types/getAllDeliveriesByUserId.type"
import { format } from "date-fns"
import { CalendarIcon, TruckIcon } from "lucide-react"

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Delivery Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[200px] pl-9"
            />
          </div>
        </div>
      </div>

      {!filteredDeliveries.length ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed">
          <TruckIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No deliveries found</p>
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

      <div className="text-sm text-muted-foreground text-center">
        Showing deliveries
        {dateFilter && <> for {format(new Date(dateFilter), "MMMM d, yyyy")}</>}
        {filteredDeliveries.length !== deliveries.length && <></>}
      </div>
    </div>
  )
}

