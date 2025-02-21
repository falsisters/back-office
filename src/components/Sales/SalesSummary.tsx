import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type"

interface SalesSummaryProps {
  sales: GetAllSalesByUserIdPayload
}

export function SalesSummary({ sales }: SalesSummaryProps) {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const averageSale = totalSales / sales.length
  const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Average Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${averageSale.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Items Sold</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalItems}</p>
        </CardContent>
      </Card>
    </div>
  )
}

