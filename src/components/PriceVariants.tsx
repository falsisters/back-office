import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { Price, ProductType, Profit } from "../../utils/types/schema.type"

interface PriceVariantsProps {
  prices: Array<
    Omit<Price, "id" | "createdAt" | "updatedAt" | "productId"> & {
      profit: Omit<Profit, "id" | "createdAt" | "updatedAt" | "priceId">[]
    }
  >
  setPrices: React.Dispatch<
    React.SetStateAction<
      Array<
        Omit<Price, "id" | "createdAt" | "updatedAt" | "productId"> & {
          profit: Omit<Profit, "id" | "createdAt" | "updatedAt" | "priceId">[]
        }
      >
    >
  >
}

export function PriceVariants({ prices, setPrices }: PriceVariantsProps) {
  const handleAddPriceVariant = () => {
    setPrices([...prices, { price: 0, stock: 0, type: "FIFTY_KG", profit: [{ profit: 0 }] }])
  }

  const handleRemovePriceVariant = (index: number) => {
    if (prices.length > 1) {
      setPrices(prices.filter((_, i) => i !== index))
    }
  }

  const handleAddProfit = (priceIndex: number) => {
    const updatedPrices = [...prices]
    updatedPrices[priceIndex].profit.push({ profit: 0 })
    setPrices(updatedPrices)
  }

  const handleRemoveProfit = (priceIndex: number, profitIndex: number) => {
    if (prices[priceIndex].profit.length > 1) {
      const updatedPrices = [...prices]
      updatedPrices[priceIndex].profit = updatedPrices[priceIndex].profit.filter((_, i) => i !== profitIndex)
      setPrices(updatedPrices)
    }
  }

  const handlePriceChange = (
    index: number,
    field: keyof Omit<Price, "id" | "createdAt" | "updatedAt" | "productId">,
    value: string | number | ProductType,
  ) => {
    const updatedPrices = [...prices]
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: field === "type" ? value : Number(value),
    }
    setPrices(updatedPrices)
  }

  const handleProfitChange = (priceIndex: number, profitIndex: number, value: number) => {
    const updatedPrices = [...prices]
    updatedPrices[priceIndex].profit[profitIndex].profit = value
    setPrices(updatedPrices)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium">Price Variants</h3>
        <Button variant="outline" size="sm" onClick={handleAddPriceVariant}>
          <Plus className="mr-1 h-4 w-4" /> Add Variant
        </Button>
      </div>

      <div className="space-y-4">
        {prices.map((price, priceIndex) => (
          <Card key={priceIndex}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Variant #{priceIndex + 1}</h4>
                {prices.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => handleRemovePriceVariant(priceIndex)}>
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
                  <Button variant="ghost" size="sm" onClick={() => handleAddProfit(priceIndex)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Profit
                  </Button>
                </div>

                <div className="space-y-2">
                  {price.profit.map((profit, profitIndex) => (
                    <div key={profitIndex} className="flex items-center gap-2">
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
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveProfit(priceIndex, profitIndex)}>
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
  )
}

