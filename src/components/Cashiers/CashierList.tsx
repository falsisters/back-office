"use client"

import { useEffect, useState } from "react"
import { getAllCashiersByUserId } from "@/lib/server/getAllCashiersByUserId"
import { deleteCashier } from "@/lib/server/deleteCashier"
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/getAllCashiersByUserId.type"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CashierTable } from "./CashierTable"

export function CashierList() {
  const [cashiers, setCashiers] = useState<GetAllCashiersByUserIdPayload>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCashiers()
  }, [])

  const fetchCashiers = async () => {
    try {
      setIsLoading(true)
      const data = await getAllCashiersByUserId()
      setCashiers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cashiers")
      console.error("Error fetching cashiers:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCashier = async (id: string) => {
    try {
      await deleteCashier(id)
      toast({
        title: "Cashier deleted",
        description: "The cashier has been successfully deleted.",
      })
      fetchCashiers() // Refresh the list
    } catch (error) {
      console.error("Error: ", error)
      toast({
        title: "Error",
        description: "Failed to delete the cashier. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading cashiers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchCashiers()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (cashiers.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No cashiers found. Create your first cashier to get started.</p>
            <Button asChild>
              <Link href="/cashiers/create">Create Cashier</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cashiers</CardTitle>
        <CardDescription>Manage your cashiers and their permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashiers.map((cashier) => (
              <CashierTable key={cashier.id} cashier={cashier} onDeleteCashier={handleDeleteCashier} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

