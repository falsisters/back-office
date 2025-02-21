import { Suspense } from "react"
import { DeliveryList } from "@/components/Deliveries/DeliveryList"
import { Spinner } from "@/components/ui/spinner"
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";

export default async function DeliveriesPage() {
    let userData;
    try {
      userData = await getUserData();
    } catch (error) {
      if (!userData) {
        redirect("/");
      }
      console.error(error, "Unauthorized");
    }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Deliveries</h1>
      <Suspense fallback={<Spinner />}>
        <DeliveryList />
      </Suspense>
    </div>
  )
}

