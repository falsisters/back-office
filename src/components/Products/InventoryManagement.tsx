"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllProducts } from "@/lib/server/getAllProductsByUserId"
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type"
import CreateProduct from "./CreateProduct"
import ItemTable from "./ItemTable"
import PriceSummary from "./PriceSummary"
import { Toaster } from "@/components/ui/toaster"
import { Loader2, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/SearchBar"

export default function InventoryManagement() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllProducts()
      if (result.data) {
        setProducts(result.data)
        setFilteredProducts(result.data)
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

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  const handleProductUpdate = useCallback(() => {
    setIsRefreshing(true)
    fetchProducts().finally(() => setIsRefreshing(false))
  }, [fetchProducts])

  const handleClearSearch = () => {
    setSearchTerm("")
  }

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

          {/* Search bar implementation */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                placeholder="Search products by name..." 
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={handleClearSearch}
                >
                  <span className="sr-only">Clear search</span>
                  ×
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length} of {products.length} items
            </div>
          </div>

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
              {filteredProducts.length === 0 && searchTerm ? (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-muted-foreground">No products found matching &quot;{searchTerm}&quot;</p>
                  <Button
                    variant="link"
                    onClick={handleClearSearch}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <ItemTable products={filteredProducts} onProductUpdate={handleProductUpdate} />
              )}
              <PriceSummary products={filteredProducts} />
            </>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
}