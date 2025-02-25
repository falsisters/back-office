"use client"

import { useState, useEffect } from "react"
import { DeliveryItem } from "@/components/Deliveries/DeliveryItem"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GetAllDeliveriesByUserIdPayload } from "../../../utils/types/getAllDeliveriesByUserId.type"

interface DeliveryListProps {
  initialDeliveries: GetAllDeliveriesByUserIdPayload
}

export function DeliveryList({ initialDeliveries }: DeliveryListProps) {
  const [deliveries, setDeliveries] = useState<GetAllDeliveriesByUserIdPayload>([])
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0] // Format: YYYY-MM-DD
  })
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    setDeliveries(initialDeliveries)
  }, [initialDeliveries])

  const filteredDeliveries = deliveries.filter((delivery) => {
    const deliveryDate = new Date(delivery.createdAt).toISOString().split("T")[0]
    const dateMatch = dateFilter ? deliveryDate === dateFilter : true
    const statusMatch =
      statusFilter === "all" ? true : statusFilter === "finished" ? delivery.isFinished : !delivery.isFinished
    return dateMatch && statusMatch
  })

  return (
    <>
      <div className="mb-4 flex gap-4">
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-auto" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {deliveries.length === 0 ? (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50">
          <div className="p-8 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black"></div>
          </div>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <p>No deliveries found matching the current filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="h-full">
              <DeliveryItem delivery={delivery} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

