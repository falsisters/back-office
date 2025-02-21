"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { deleteSale } from "@/lib/server/deleteSale"
import type { Sale, SaleItem as SaleItemType, Cashier, Product } from "../../../utils/types/schema.type"

interface SaleItemProps {
  sale: Sale & {
    items: (SaleItemType & { product: Product })[]
    cashier: Cashier
  }
  onDelete: () => void
}

export function SaleItem({ sale, onDelete }: SaleItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteSale(sale.id)
      onDelete()
    } catch (error) {
      console.error("Failed to delete sale:", error)
      alert("Failed to delete sale. Please try again.")
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sale #{sale.id}</CardTitle>
          <Button variant="destructive" onClick={handleDeleteClick}>
            Delete
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Total:</strong> ${sale.total.toFixed(2)}
              </p>
              <p>
                <strong>Cashier:</strong> {sale.cashier.name}
              </p>
            </div>
            <div>
              <div>
                <strong>Payment Method:</strong> <Badge>{sale.paymentMethod}</Badge>
              </div>
              <p>
                <strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Items:</h3>
            <ul className="list-disc list-inside">
              {sale.items.map((item) => (
                <li key={item.id}>
                  {item.product.name} - {item.qty} x ${item.price.toFixed(2)} ({item.type})
                  {item.isSpecialPrice && <Badge className="ml-2 bg-green-500">Special Price</Badge>}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Sale #{sale.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

