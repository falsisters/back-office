"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Product, Price, ProductType, Profit } from "../../utils/types/schema.type"
import { editProduct } from "@/lib/server/editProduct"
import { toast } from "@/hooks/use-toast"

interface EditProductProps {
  product: Product & { Price?: Price[] }
  onProductUpdated?: (product: Product & { Price?: Price[] }) => void
  trigger?: React.ReactNode
}

export function EditProduct({ product, onProductUpdated, trigger }: EditProductProps) {
  const [editedProduct, setEditedProduct] = useState<Omit<Product, "createdAt" | "updatedAt" | "userId">>({
    id: product.id,
    name: product.name,
    minimumQty: product.minimumQty,
  })
  
  const [prices, setPrices] = useState<Array<Omit<Price, "createdAt" | "updatedAt"> & { profit: Omit<Profit, "createdAt" | "updatedAt">[] }>>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open && product.Price) {
      // Initialize with existing prices and profits
      const initialPrices = product.Price.map(price => {
        return {
          id: price.id,
          productId: price.productId,
          price: price.price,
          stock: price.stock,
          type: price.type,
          profit: price.Profit ? price.Profit.map(p => ({
            id: p.id,
            priceId: p.priceId,
            profit: p.profit
          })) : [{ profit: 0 }]
        }
      })
      
      setPrices(initialPrices.length > 0 ? initialPrices : [{ price: 0, stock: 0, type: "FIFTY_KG", productId: product.id, profit: [{ profit: 0 }] }])
      
      setEditedProduct({
        id: product.id,
        name: product.name,
        minimumQty: product.minimumQty,
      })
    }
  }, [open, product])

  const handleAddPriceVariant = () => {
    setPrices([...prices, { price: 0, stock: 0, type: "FIFTY_KG", productId: product.id, profit: [{ profit: 0 }] }])
  }

  const handleRemovePriceVariant = (index: number) => {
    if (prices.length > 1) {
      setPrices(prices.filter((_, i) => i !== index))
    }
  }

  const handleAddProfit = (priceIndex: number) => {
    const updatedPrices = [...prices]
    updatedPrices[priceIndex].profit.push({
        profit: 0,
        id: "",
        priceId: ""
    })
    setPrices(updatedPrices)
  }

  const handleRemoveProfit = (priceIndex: number, profitIndex: number) => {
    if (prices[priceIndex].profit.length > 1) {
      const updatedPrices = [...prices]
      updatedPrices[priceIndex].profit = updatedPrices[priceIndex].profit.filter((_, i) => i !== profitIndex)
      setPrices(updatedPrices)
    }
  }

  const handleInputChange = (field: keyof typeof editedProduct, value: string | number) => {
    setEditedProduct(prev => ({ ...prev, [field]: field === "minimumQty" ? Number(value) : value }))
  }

  const handlePriceChange = (index: number, field: keyof Omit<Price, "createdAt" | "updatedAt">, value: string | number | ProductType) => {
    const updatedPrices = [...prices]
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: field === "type" ? value : Number(value)
    }
    setPrices(updatedPrices)
  }

  const handleProfitChange = (priceIndex: number, profitIndex: number, value: number) => {
    const updatedPrices = [...prices]
    updatedPrices[priceIndex].profit[profitIndex].profit = value
    setPrices(updatedPrices)
  }

  const handleSubmit = async () => {
    try {
      setError("")
      setSubmitting(true)
      
      // Validation
      const trimmedName = editedProduct.name.trim()
      if (!trimmedName) {
        setError("Product name is required")
        setSubmitting(false)
        return
      }
      
      if (editedProduct.minimumQty <= 0) {
        setError("Minimum quantity must be greater than 0")
        setSubmitting(false)
        return
      }

      // Validate prices
      for (let i = 0; i < prices.length; i++) {
        if (prices[i].price <= 0) {
          setError(`Price for variant #${i + 1} must be greater than 0`)
          setSubmitting(false)
          return
        }
        if (prices[i].stock < 0) {
          setError(`Stock for variant #${i + 1} cannot be negative`)
          setSubmitting(false)
          return
        }
      }

      const productData = {
        product: {
          name: trimmedName,
          minimumQty: editedProduct.minimumQty,
          price: prices
        }
      }

      const updatedProduct = await editProduct(product.id, productData)
      
      if (onProductUpdated) {
        onProductUpdated(updatedProduct)
      }
      
      toast({
        title: "Product updated successfully",
        description: `Updated ${trimmedName} with ${prices.length} price variants`,
      })
      
      // Close dialog
      closeRef.current?.click()
      setOpen(false)
    } catch (err) {
      console.error("Error updating product:", err)
      setError(err instanceof Error ? err.message : "Failed to update product")
    } finally {
      setSubmitting(false)
    }
  }

  const formatPriceType = (type: ProductType) => {
    switch (type) {
      case "FIFTY_KG": return "50 KG"
      case "TWENTY_FIVE_KG": return "25 KG"
      case "FIVE_KG": return "5 KG"
      case "PER_KILO": return "Per Kilo"
      case "GANTANG": return "Gantang"
      case "SPECIAL_PRICE": return "Special Price"
      default: return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Edit Product</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Basic Product Info */}
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Product Name</label>
              <Input
                value={editedProduct.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Minimum Quantity</label>
              <Input
                type="number"
                value={editedProduct.minimumQty}
                onChange={(e) => handleInputChange("minimumQty", e.target.value)}
                min="1"
                placeholder="Enter minimum quantity"
              />
            </div>
          </div>
          
          {/* Price Variants */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium">Price Variants</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddPriceVariant}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Variant
              </Button>
            </div>
            
            <div className="space-y-4">
              {prices.map((price, priceIndex) => (
                <Card key={price.id || priceIndex}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium">Variant #{priceIndex + 1}</h4>
                      {prices.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemovePriceVariant(priceIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Type</label>
                        <Select
                          value={price.type}
                          onValueChange={(value: ProductType) => handlePriceChange(priceIndex, "type", value)}
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
                            <SelectItem value="SPECIAL_PRICE">Special Price</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Price</label>
                        <Input
                          type="number"
                          value={price.price}
                          onChange={(e) => handlePriceChange(priceIndex, "price", e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="Enter price"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Stock</label>
                        <Input
                          type="number"
                          value={price.stock}
                          onChange={(e) => handlePriceChange(priceIndex, "stock", e.target.value)}
                          min="0"
                          placeholder="Enter stock amount"
                        />
                      </div>
                    </div>
                    
                    {/* Profit Section */}
                    <div className="mt-4 border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-medium">Profit Settings</h5>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAddProfit(priceIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Profit
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {price.profit.map((profit, profitIndex) => (
                          <div key={profit.id || profitIndex} className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={profit.profit}
                              onChange={(e) => handleProfitChange(priceIndex, profitIndex, Number(e.target.value))}
                              min="0"
                              step="0.01"
                              placeholder="Enter profit amount"
                              className="flex-1"
                            />
                            
                            {price.profit.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveProfit(priceIndex, profitIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Price Summary */}
          {prices.some(p => p.price > 0) && (
            <div className="bg-slate-50 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Price Summary</h4>
              <ul className="text-sm space-y-1">
                {prices.filter(p => p.price > 0).map((p, i) => (
                  <li key={p.id || i}>
                    {formatPriceType(p.type)}: Pesos{p.price.toFixed(2)} (Stock: {p.stock})
                    {p.profit.length > 0 && p.profit[0].profit > 0 && 
                      ` with ${p.profit.length} profit setting${p.profit.length > 1 ? 's' : ''}`
                    }
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <DialogClose ref={closeRef} asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditProduct