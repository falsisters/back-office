"use client"

import { useState, useEffect } from "react"
import { DeliveryItem } from "@/components/Deliveries/DeliveryItem"
import type { GetAllDeliveriesByUserIdPayload } from "../../../utils/types/getAllDeliveriesByUserId.type"
import { format } from "date-fns"
import { CalendarIcon, TruckIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface DeliveryListProps {
  initialDeliveries: GetAllDeliveriesByUserIdPayload
}

export function DeliveryList({ initialDeliveries }: DeliveryListProps) {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [filteredDeliveries, setFilteredDeliveries] = useState<GetAllDeliveriesByUserIdPayload>([])

  useEffect(() => {
    let filtered = [...deliveries]

    // Date filter
    if (date) {
      filtered = filtered.filter((delivery) => {
        const deliveryDate = new Date(delivery.createdAt)
        return deliveryDate.toDateString() === date.toDateString()
      })
    }

    setFilteredDeliveries(filtered)
  }, [deliveries, date])

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

  // Group deliveries by date
  const groupDeliveriesByDate = () => {
    const grouped: Record<string, GetAllDeliveriesByUserIdPayload> = {}

    filteredDeliveries.forEach((delivery) => {
      const deliveryDate = new Date(delivery.createdAt).toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!grouped[deliveryDate]) grouped[deliveryDate] = []
      grouped[deliveryDate].push(delivery)
    })

    return grouped
  }

  const groupedDeliveries = groupDeliveriesByDate()

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Deliveries</h1>
      
      <div className="rounded-lg border bg-card shadow-sm p-6">
        <div className="flex items-center justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
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

      {Object.entries(groupedDeliveries).length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center h-64">
              <TruckIcon className="w-12 h-12 text-primary/40 mb-4" />
              <p className="text-muted-foreground font-medium">No deliveries found</p>
              {date && (
                <p className="text-sm text-muted-foreground mt-2">for {format(date, "MMM dd, yyyy")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {Object.entries(groupedDeliveries).map(([dateString, deliveries]) => (
            <Card key={dateString} className="shadow-md border-l-4 border-l-primary">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {dateString}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveries.map((delivery) => (
                    <DeliveryItem key={delivery.id} delivery={delivery} onDelete={handleDeleteDelivery} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="text-sm text-muted-foreground text-center pt-2">
            Showing {filteredDeliveries.length} {filteredDeliveries.length === 1 ? "delivery" : "deliveries"}
            {date && <> for {format(date, "MMMM d, yyyy")}</>}
          </div>
        </>
      )}
    </div>
  )
}