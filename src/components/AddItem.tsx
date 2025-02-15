import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product, ProductType } from "@/types/products"

interface AddItemDialogProps {
  onAddItem: (item: Omit<Product, "id">) => void
}

export function AddItemDialog({ onAddItem }: AddItemDialogProps) {
  const [newItem, setNewItem] = useState<Omit<Product, "id">>({
    name: "",
    stock: 0,
    price: 0,
    type: "FIFTY_KG",
    minimumQty: 1,
  })
  const [error, setError] = useState<string>("")
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleAddItem = () => {
    setError("")

    if (!newItem.name.trim()) {
      setError("Item name is required")
      return
    }

    if (newItem.stock < 0) {
      setError("Stock must be 0 or greater")
      return
    }

    if (newItem.price <= 0) {
      setError("Price must be greater than 0")
      return
    }

    if (newItem.minimumQty <= 0) {
      setError("Minimum quantity must be greater than 0")
      return
    }

    onAddItem(newItem)

    setNewItem({ name: "", stock: 0, price: 0, type: "FIFTY_KG", minimumQty: 1 })
    closeRef.current?.click()
  }

  const handleInputChange = (field: keyof Omit<Product, "id">, value: string | number) => {
    setError("")
    setNewItem((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <p className="mb-2 text-sm font-medium">Item:</p>
            <Input
              value={newItem.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Item name"
              required
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Type:</p>
            <Select value={newItem.type} onValueChange={(value: ProductType) => handleInputChange("type", value)}>
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
              value={newItem.stock}
              onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value) || 0)}
              placeholder="Stock"
              min="0"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Price:</p>
            <Input
              type="number"
              value={newItem.price}
              onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
              placeholder="Price"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Minimum Quantity:</p>
            <Input
              type="number"
              value={newItem.minimumQty}
              onChange={(e) => handleInputChange("minimumQty", Number.parseInt(e.target.value) || 1)}
              placeholder="Minimum quantity"
              min="1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <DialogClose ref={closeRef} asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddItem}>Add Item</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
