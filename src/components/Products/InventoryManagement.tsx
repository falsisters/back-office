"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllProducts } from "@/lib/server/getAllProductsByUserId"
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type"
import CreateProduct from "./CreateProduct"
import ItemTable from "./ItemTable"
import PriceSummary from "./PriceSummary"
import { Toaster } from "@/components/ui/toaster"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InventoryManagement() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllProducts()
      if (result.data) {
        setProducts(result.data)
        setError(null)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to fetch products")
      console.error("Error: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleProductUpdate = useCallback(() => {
    setIsRefreshing(true)
    fetchProducts().finally(() => setIsRefreshing(false))
  }, [fetchProducts])

  return (
    <>
      <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-2xl font-bold text-primary">Inventory Management</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleProductUpdate}
            disabled={isRefreshing}
            className="gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <CreateProduct onProductCreated={handleProductUpdate} />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading inventory data...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 text-center">
              <p className="text-sm text-destructive font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleProductUpdate}
                className="mt-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <ItemTable products={products} onProductUpdate={handleProductUpdate} />
              <PriceSummary products={products} />
            </>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
}

