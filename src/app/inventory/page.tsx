import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryManagement } from "@/components/InventoryManagement"
import { getUserData } from "@/lib/server/getUserData"
import { redirect } from "next/navigation"

export default async function Inventory() {
  let userData;
  try {
    userData = await getUserData();
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/");
    }
    throw error;
  }
  const user = {id: userData.id}

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            ← Back to Home
          </Button>
        </Link>
      </div>
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

