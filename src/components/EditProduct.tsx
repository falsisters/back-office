"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product, Price, ProductType } from "../../utils/types/schema.type"
import { editProduct } from "@/lib/server/editProduct"
import { toast } from "@/hooks/use-toast"
import { BasicProductInfo } from "@/components/BasicProductInfo"
import { PriceVariants } from "@/components/PriceVariants"
import { PriceSummary } from "@/components/PriceSummary"
import type { EditProductFormData } from "../../utils/types/editProduct.type"

interface EditProductProps {
  product: Product & { Price?: Price[] }
  onProductUpdated?: (product: Product & { Price?: Price[] }) => void
  trigger?: React.ReactNode
}

export function EditProduct({ product, onProductUpdated, trigger }: EditProductProps) {
  const [editedProduct, setEditedProduct] = useState<{ id: string; name: string }>({
    id: product.id,
    name: product.name,
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
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open && product.Price) {
      const initialPrices = product.Price.map((price) => ({
        price: price.price,
        stock: price.stock,
        type: price.type,
        profit: price.profit,
        specialPrice: price.specialPrice,
      }))

      setPrices(
        initialPrices.length > 0
          ? initialPrices
          : [{ price: 0, stock: 0, type: "FIFTY_KG", profit: [{ profit: 0 }], specialPrice: [] }],
      )

      setEditedProduct({
        id: product.id,
        name: product.name,
      })
    }
  }, [open, product])

  const handleInputChange = (field: "name", value: string) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setError("")
      setSubmitting(true)

      const trimmedName = editedProduct.name.trim()
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

      const productData: EditProductFormData = {
        product: {
          name: trimmedName,
          price: prices,
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

      closeRef.current?.click()
      setOpen(false)
    } catch (err) {
      console.error("Error updating product:", err)
      setError(err instanceof Error ? err.message : "Failed to update product")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Edit Product
          </Button>
        )}
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
          <BasicProductInfo product={editedProduct} handleInputChange={handleInputChange} />
          <PriceVariants prices={prices} setPrices={setPrices} />
          <PriceSummary prices={prices} />
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
