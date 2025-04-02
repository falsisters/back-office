"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { editProduct } from "@/lib/server/editProduct"
import { useToast } from "@/hooks/use-toast"
import type { PerKiloPrice } from "../../../utils/types/schema.type"
import { Loader2 } from "lucide-react"

interface PerKiloPriceEditorProps {
  productId: string
  currentPerKiloPrice: PerKiloPrice
  onPriceUpdated?: () => void
}

export default function PerKiloPriceEditor({
  productId,
  currentPerKiloPrice,
  onPriceUpdated,
}: PerKiloPriceEditorProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [price, setPrice] = useState(currentPerKiloPrice.price)
  const [stock, setStock] = useState(currentPerKiloPrice.stock)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!price) newErrors.price = "Price is required"
    if (price < 0) newErrors.price = "Price cannot be negative"

    if (!stock) newErrors.stock = "Stock is required"
    if (stock < 0) newErrors.stock = "Stock cannot be negative"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append(
        "perKiloPrice",
        JSON.stringify({
          id: currentPerKiloPrice.id,
          price,
          stock,
        }),
      )

      await editProduct(productId, formData)

      // Optimistic UI update
      onPriceUpdated?.()

      toast({
        title: "Price Updated Successfully",
        description: `Per kilo price has been updated to ₱${price.toFixed(2)}`,
      })

      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error Updating Price",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
        >
          Edit Per Kilo Price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-t-4 border-t-primary">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">Edit Per Kilo Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Price per Kilo (₱)
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              step="0.01"
              className={errors.price ? "border-destructive" : "focus-visible:ring-primary"}
            />
            {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock" className="text-sm font-medium">
              Stock (KG)
            </Label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              min="0"
              className={errors.stock ? "border-destructive" : "focus-visible:ring-primary"}
            />
            {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Price"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

