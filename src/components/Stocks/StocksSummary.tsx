import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type"

interface StockSummaryProps {
  products: ProductResponse[]
}

export default function StockSummary({ products }: StockSummaryProps) {
  const totalSackStock = products.reduce((total, product) => {
    return total + product.SackPrice.reduce((sum, sack) => sum + sack.stock, 0)
  }, 0)

  const totalKiloStock = products.reduce((total, product) => {
    return total + (product.perKiloPrice?.stock || 0)
  }, 0)

  return (
    <Card className="border-primary/20">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-semibold text-primary">Stock Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-6 py-4">
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">Total Products</p>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">Total Sacks</p>
          <p className="text-3xl font-bold">{totalSackStock}</p>
        </div>
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">Total Kilos</p>
          <p className="text-3xl font-bold">{totalKiloStock} kg</p>
        </div>
      </CardContent>
    </Card>
  )
}
