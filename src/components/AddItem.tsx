"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product } from "../../utils/types/schema.type"

interface AddItemDialogProps {
  onAddItem: (item: Omit<Product, "id" | "createdAt" | "updatedAt" | "userId">) => void
}

export function AddItemDialog({ onAddItem }: AddItemDialogProps) {
  const [newItem, setNewItem] = useState<Omit<Product, "id" | "createdAt" | "updatedAt" | "userId">>({
    name: "",
    minimumQty: 1,
  })
  const [error, setError] = useState<string>("")
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleAddItem = () => {
    setError("")
    const trimmedName = newItem.name.trim()
  
    if (!trimmedName) {
      setError("Item name is required")
      return
    }
  
    if (newItem.minimumQty <= 0) {
      setError("Minimum quantity must be greater than 0")
      return
    }
  
    onAddItem({
      ...newItem,
      name: trimmedName
    })
  
    setNewItem({
      name: "",
      minimumQty: 1,
    })
    closeRef.current?.click()
  }

  const handleInputChange = (field: keyof typeof newItem, value: string | number) => {
    setError("")
    setNewItem((prev) => ({ ...prev, [field]: field === "minimumQty" ? Number(value) : value }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <p className="mb-2 text-sm font-medium">Product Name:</p>
            <Input
              value={newItem.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Product name"
              required
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Minimum Quantity:</p>
            <Input
              type="number"
              value={newItem.minimumQty}
              onChange={(e) => handleInputChange("minimumQty", e.target.value)}
              placeholder="Minimum quantity"
              min="1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <DialogClose ref={closeRef} asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddItem}>Add Product</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

