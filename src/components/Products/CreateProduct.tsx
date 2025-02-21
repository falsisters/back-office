"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product, Price, ProductType } from "../../../utils/types/schema.type"
import { createProduct } from "@/lib/server/createProduct"
import { toast } from "@/hooks/use-toast"
import { BasicProductInfo } from "@/components/Products/BasicProductInfo"
import { PriceVariants } from "@/components/Products/PriceVariants"
import { PriceSummary } from "@/components/Products/PriceSummary"

interface CreateProductProps {
  onProductCreated?: (product: Product & { Price?: Price[] }) => void
}

export function CreateProduct({ onProductCreated }: CreateProductProps) {
  const [newProduct, setNewProduct] = useState<{ name: string }>({
    name: "",
  })

  const [prices, setPrices] = useState<
    Array<{
      price: number
      stock: number
      type: ProductType
      specialPrice: Array<{ specialPrice: number; minimumQty: number }>
      profit: Array<{ profit: number }>
    }>
  >([
    {
      price: 0,
      stock: 0,
      type: "FIFTY_KG",
      specialPrice: [],
      profit: [],
    },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleInputChange = (field: "name", value: string) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setError("")
      setSubmitting(true)

      const trimmedName = newProduct.name.trim()
      if (!trimmedName) {
        setError("Product name is required")
        setSubmitting(false)
        return
      }
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
          price: prices.map((price) => ({
            price: price.price,
            stock: price.stock,
            type: price.type,
            profit: price.profit,
            specialPrice: price.specialPrice,
          })),
        },
      }

      const createdProduct = await createProduct(productData)

      if (onProductCreated) {
        onProductCreated(createdProduct)
      }

      toast({
        title: "Product created successfully",
        description: `Added ${trimmedName} with ${prices.length} price variants`,
      })

      setNewProduct({ name: "" })
      setPrices([{ price: 0, stock: 0, type: "FIFTY_KG", specialPrice: [], profit: [] }])

      closeRef.current?.click()
    } catch (err) {
      console.error("Error creating product:", err)
      setError(err instanceof Error ? err.message : "Failed to create product")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <BasicProductInfo product={newProduct} handleInputChange={handleInputChange} />
          <PriceVariants prices={prices} setPrices={setPrices} />
          <PriceSummary prices={prices} />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <DialogClose ref={closeRef} asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProduct

