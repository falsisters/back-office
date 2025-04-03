import { Suspense } from "react"
import { DeliveryList } from "@/components/Deliveries/DeliveryList"
import { Spinner } from "@/components/ui/spinner"
import { getUserData } from "@/lib/server/getUserData"
import { getAllDeliveriesByUserId } from "@/lib/server/getAllDeliveriesByUserId"
import { redirect } from "next/navigation"

export default async function DeliveriesPage() {
  let userData
  try {
    userData = await getUserData()
  } catch (error) {
    if (!userData) {
      redirect("/")
    }
    console.error(error, "Unauthorized")
  }

  const deliveries = await getAllDeliveriesByUserId()

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Spinner />}>
        <DeliveryList initialDeliveries={deliveries} />
      </Suspense>
    </div>
  )
}

