"use client"

import { useState } from "react"
import { SearchBar } from "@/components/SearchBar"
import { AddItemDialog } from "@/components/AddItem"
import { ItemTable } from "@/components/ItemTable"
import type { Product } from "@/types/products"

// Mock data (in a real application, this would be fetched from an API)
const mockProducts: Product[] = [
  { id: "1", name: "Sinandomeng", type: "FIFTY_KG", price: 2350, stock: 50, minimumQty: 1 },
  { id: "2", name: "Sinandomeng", type: "TWENTY_FIVE_KG", price: 1200, stock: 100, minimumQty: 1 },
  { id: "3", name: "Salt", type: "TWENTY_FIVE_KG", price: 600, stock: 30, minimumQty: 1 },
  { id: "4", name: "Jasmin", type: "TWENTY_FIVE_KG", price: 1250, stock: 75, minimumQty: 1 },
  { id: "5", name: "Jasmin", type: "PER_KILO", price: 400, stock: 200, minimumQty: 1 },
]

export function InventoryManagement() {
  const [items, setItems] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddItem = (newItem: Omit<Product, "id">) => {
    const id = (Math.max(...items.map((item) => Number.parseInt(item.id))) + 1).toString()
    setItems((prevItems) => [...prevItems, { ...newItem, id }])
  }

  const handleUpdateItem = (updatedItem: Product) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <AddItemDialog onAddItem={handleAddItem} />
      </div>
      <ItemTable items={filteredItems} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />
    </div>
  )
}

