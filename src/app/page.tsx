import { getUserData } from "@/lib/server/getUserData"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function Home() {
  let userData;
  try {
    userData = await getUserData();
  } catch (error) {
    if (!userData) {
      redirect("/login");
    }
    console.error(error, "Unauthorized");
  }
  const user = { name: userData.name }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2 text-primary">FalSisters Rice Trading</CardTitle>
          <CardDescription className="text-lg">Back Office</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-6">
          <h2 className="text-2xl font-semibold text-gray-700">Welcome!</h2>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{user.name}</h2>
          <Link href="/products" className="w-full">
            <Button size="lg" variant="default" className="w-full text-white">
              Manage Inventory
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

