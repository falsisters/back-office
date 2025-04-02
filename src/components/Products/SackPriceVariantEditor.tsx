"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { editProduct } from "@/lib/server/editProduct"
import { useToast } from "@/hooks/use-toast"
import { SackTypeEnum } from "../../../utils/types/schema.type"
import type { z } from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface SackPriceVariantEditorProps {
  productId: string
  currentSackPrices: Array<{
    id: string
    type: z.infer<typeof SackTypeEnum>
    price: number
    stock: number
    specialPrice?: {
      price?: number
      minimumQty?: number
    }
  }>
  onPriceUpdated?: () => void
}

export default function SackPriceVariantEditor({
  productId,
  currentSackPrices,
  onPriceUpdated,
}: SackPriceVariantEditorProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [sackPrices, setSackPrices] = useState(currentSackPrices)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (sackPrices.length === 0) {
      newErrors.general = "At least one sack price is required"
      return false
    }

    sackPrices.forEach((sack, index) => {
      if (!sack.price) newErrors[`price_${index}`] = "Price is required"
      if (sack.price < 0) newErrors[`price_${index}`] = "Price cannot be negative"

      if (!sack.stock) newErrors[`stock_${index}`] = "Stock is required"
      if (sack.stock < 0) newErrors[`stock_${index}`] = "Stock cannot be negative"

      if (sack.specialPrice?.price && !sack.specialPrice?.minimumQty) {
        newErrors[`specialPrice_minimumQty_${index}`] = "Minimum quantity is required for special price"
      }
    })

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
        "sackPrices",
        JSON.stringify(
          sackPrices.map((sp) => ({
            id: sp.id,
            type: sp.type,
            price: sp.price,
            stock: sp.stock,
            specialPrice: sp.specialPrice,
          })),
        ),
      )

      await editProduct(productId, formData)

      // Optimistic UI update
      onPriceUpdated?.()

      toast({
        title: "Sack Prices Updated Successfully",
        description: `Updated ${sackPrices.length} sack price variants`,
      })

      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error Updating Prices",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateSackPrice = (index: number, field: keyof (typeof sackPrices)[0], value: unknown) => {
    const newSackPrices = [...sackPrices]
    newSackPrices[index] = {
      ...newSackPrices[index],
      [field]: value,
    }
    setSackPrices(newSackPrices)
  }

  const addSackPrice = () => {
    // Generate a temporary ID for new sack price
    const newId = `temp-${Date.now()}`
    setSackPrices([
      ...sackPrices,
      {
        id: newId,
        type: "FIFTY_KG" as z.infer<typeof SackTypeEnum>,
        price: 0,
        stock: 0,
      },
    ])
  }

  const removeSackPrice = (index: number) => {
    const newSackPrices = [...sackPrices]
    newSackPrices.splice(index, 1)
    setSackPrices(newSackPrices)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
        >
          Edit Sack Prices
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px] border-t-4 border-t-primary">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary font-bold">Edit Sack Price Variants</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {errors.general && (
            <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Sack Prices</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSackPrice}
              className="h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Plus size={14} />
              Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {sackPrices.map((sackPrice, index) => (
              <div
                key={sackPrice.id}
                className="space-y-3 border p-4 rounded-lg relative hover:shadow-sm transition-shadow"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSackPrice(index)}
                  className="h-6 w-6 absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  disabled={sackPrices.length === 1}
                >
                  <Trash2 size={14} />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Sack Type</Label>
                    <Select value={sackPrice.type} onValueChange={(value) => updateSackPrice(index, "type", value)}>
                      <SelectTrigger className="focus:ring-primary">
                        <SelectValue placeholder="Sack Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SackTypeEnum.enum).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "FIFTY_KG"
                              ? "50 KG"
                              : type === "TWENTY_FIVE_KG"
                                ? "25 KG"
                                : type === "FIVE_KG"
                                  ? "5 KG"
                                  : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Price (₱)</Label>
                    <Input
                      type="number"
                      value={sackPrice.price}
                      onChange={(e) => updateSackPrice(index, "price", Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className={errors[`price_${index}`] ? "border-destructive" : "focus-visible:ring-primary"}
                    />
                    {errors[`price_${index}`] && <p className="text-xs text-destructive">{errors[`price_${index}`]}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    value={sackPrice.stock}
                    onChange={(e) => updateSackPrice(index, "stock", Number(e.target.value))}
                    min="0"
                    className={errors[`stock_${index}`] ? "border-destructive" : "focus-visible:ring-primary"}
                  />
                  {errors[`stock_${index}`] && <p className="text-xs text-destructive">{errors[`stock_${index}`]}</p>}
                </div>

                <Separator className="my-2" />

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Special Price (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Special Price (₱)</Label>
                      <Input
                        type="number"
                        placeholder="Special Price"
                        value={sackPrice.specialPrice?.price || ""}
                        onChange={(e) => {
                          const specialPrice = {
                            ...sackPrice.specialPrice,
                            price: Number(e.target.value),
                          }
                          updateSackPrice(index, "specialPrice", specialPrice)
                        }}
                        min="0"
                        step="0.01"
                        className="focus-visible:ring-secondary"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Minimum Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Min Qty"
                        value={sackPrice.specialPrice?.minimumQty || ""}
                        onChange={(e) => {
                          const specialPrice = {
                            ...sackPrice.specialPrice,
                            minimumQty: Number(e.target.value),
                          }
                          updateSackPrice(index, "specialPrice", specialPrice)
                        }}
                        min="0"
                        className={
                          errors[`specialPrice_minimumQty_${index}`]
                            ? "border-destructive"
                            : "focus-visible:ring-secondary"
                        }
                      />
                      {errors[`specialPrice_minimumQty_${index}`] && (
                        <p className="text-xs text-destructive">{errors[`specialPrice_minimumQty_${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                "Update Sack Prices"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

