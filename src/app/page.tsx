import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">FalSisters Rice Trading</CardTitle>
          <CardDescription className="text-lg">Back Office</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4 p-6">
          <Link href="/inventory">
            <Button size="lg" variant="outline">
              Manage Inventory
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}