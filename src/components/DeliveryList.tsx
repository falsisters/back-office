import { getAllDeliveriesByUserId } from "@/lib/server/getAllDeliveriesByUserId"
import { DeliveryItem } from "@/components/DeliveryItem"

export async function DeliveryList() {
  const deliveries = await getAllDeliveriesByUserId()

  if (deliveries.length === 0) {
    return <p>No deliveries found.</p>
  }

  return (
    <div className="space-y-4">
      {deliveries.map((delivery) => (
        <DeliveryItem key={delivery.id} delivery={delivery} />
      ))}
    </div>
  )
}

