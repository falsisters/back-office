import { Suspense } from "react"
import { DeliveryList } from "@/components/DeliveryList"
import { Spinner } from "@/components/ui/spinner"

export default function DeliveriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Deliveries</h1>
      <Suspense fallback={<Spinner />}>
        <DeliveryList />
      </Suspense>
    </div>
  )
}

