"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import type { Product, Price } from "../../utils/types/schema.type"
import { AddProductPrice } from "@/components/AddProductPrice"

interface ItemTableProps {
  items: (Product & { prices?: Price[] })[]
  onUpdateItem: (item: Product) => void
  onDeleteItem: (id: string) => void
  onAddPrice: (productId: string, price: Omit<Price, "id" | "createdAt" | "updatedAt">) => void
}

export function ItemTable({ items, onUpdateItem, onDeleteItem, onAddPrice }: ItemTableProps) {
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleUpdateItem = () => {
    if (editingItem) {
      onUpdateItem(editingItem)
      setEditingItem(null)
      closeRef.current?.click()
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Name</TableHead>
            <TableHead className="w-[15%]">Min Qty</TableHead>
            <TableHead className="w-[45%]">Prices</TableHead>
            <TableHead className="w-[20%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.minimumQty}</TableCell>
              <TableCell>
                {item.prices?.map((p) => (
                  <div key={p.id}>
                    {p.type}: ₱{p.price.toFixed(2)} (Stock: {p.stock})
                  </div>
                )) || "No prices set"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                        Edit
                      </Button>
                    </DialogTrigger>
                    {editingItem && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <p className="mb-2 text-sm font-medium">Product Name:</p>
                            <Input
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              placeholder="Product name"
                            />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-medium">Minimum Quantity:</p>
                            <Input
                              type="number"
                              value={editingItem.minimumQty}
                              onChange={(e) => setEditingItem({ ...editingItem, minimumQty: Number(e.target.value) })}
                              placeholder="Minimum quantity"
                              min="1"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-4">
                          <DialogClose ref={closeRef} asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button onClick={handleUpdateItem}>Update Product</Button>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                  <AddProductPrice productId={item.id} onAddPrice={(price) => onAddPrice(item.id, price)} />
                  <Button variant="destructive" size="sm" onClick={() => onDeleteItem(item.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

