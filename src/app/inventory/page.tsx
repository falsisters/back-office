"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { Product } from "@/types/products"
import { SearchBar } from "@/components/SearchBar"
import { AddItemDialog } from "@/components/AddItem"
import { ItemTable } from "@/components/ItemTable"

const mockProducts: Product[] = [
  { id: "1", name: "Sinandomeng", type: "FIFTY_KG", price: 2350, stock: 50, minimumQty: 1 },
  { id: "2", name: "Sinandomeng", type: "TWENTY_FIVE_KG", price: 1200, stock: 100, minimumQty: 1 },
  { id: "3", name: "Salt", type: "TWENTY_FIVE_KG", price: 600, stock: 30, minimumQty: 1 },
  { id: "4", name: "Jasmin", type: "TWENTY_FIVE_KG", price: 1250, stock: 75, minimumQty: 1 },
  { id: "5", name: "Jasmin", type: "PER_KILO", price: 400, stock: 200, minimumQty: 1 },
]

export default function Inventory() {
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <AddItemDialog onAddItem={handleAddItem} />
            </div>
            <ItemTable items={filteredItems} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

