import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product, ProductType } from "@/types/products"

interface ItemTableProps {
  items: Product[]
  onUpdateItem: (item: Product) => void
  onDeleteItem: (id: string) => void
}

export function ItemTable({ items, onUpdateItem, onDeleteItem }: ItemTableProps) {
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
            <TableHead className="w-[15%]">Type</TableHead>
            <TableHead className="w-[15%]">Stock</TableHead>
            <TableHead className="w-[15%]">Price</TableHead>
            <TableHead className="w-[15%]">Min Qty</TableHead>
            <TableHead className="w-[20%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>₱{item.price.toFixed(2)}</TableCell>
              <TableCell>{item.minimumQty}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <p className="mb-2 text-sm font-medium">Item:</p>
                          <Input
                            value={editingItem?.name || ""}
                            onChange={(e) => setEditingItem({ ...editingItem!, name: e.target.value })}
                            placeholder="Item name"
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Type:</p>
                          <Select
                            value={editingItem?.type}
                            onValueChange={(value: ProductType) => setEditingItem({ ...editingItem!, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FIFTY_KG">50 KG</SelectItem>
                              <SelectItem value="TWENTY_FIVE_KG">25 KG</SelectItem>
                              <SelectItem value="FIVE_KG">5 KG</SelectItem>
                              <SelectItem value="PER_KILO">Per Kilo</SelectItem>
                              <SelectItem value="GANTANG">Gantang</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Stock:</p>
                          <Input
                            type="number"
                            value={editingItem?.stock || ""}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem!, stock: Number.parseInt(e.target.value) })
                            }
                            placeholder="Stock"
                            min="0"
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Price:</p>
                          <Input
                            type="number"
                            value={editingItem?.price || ""}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem!, price: Number.parseFloat(e.target.value) })
                            }
                            placeholder="Price"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Minimum Quantity:</p>
                          <Input
                            type="number"
                            value={editingItem?.minimumQty || ""}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem!, minimumQty: Number.parseInt(e.target.value) })
                            }
                            placeholder="Minimum quantity"
                            min="1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-4">
                        <DialogClose ref={closeRef} asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleUpdateItem}>Update Item</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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

