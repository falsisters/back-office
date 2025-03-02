import { SalesList } from "@/components/Sales/SalesList";
import { Spinner } from "@/components/ui/spinner";
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function SalesPage() {
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
      <h1 className="text-2xl font-bold mb-4">Sales</h1>
      <Suspense fallback={<Spinner />}>
        <SalesList />
      </Suspense>
    </div>
  )
}