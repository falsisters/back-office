import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryManagement } from "@/components/Products/InventoryManagement"
import { getUserData } from "@/lib/server/getUserData"
import { redirect } from "next/navigation"

export default async function Inventory() {
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="p-6">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-bold">Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <InventoryManagement />
        </CardContent>
      </Card>
    </div>
  )
}

