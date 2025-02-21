import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Sale, SaleItem as SaleItemType, Cashier, Product } from "../../../utils/types/schema.type"

interface SaleItemProps {
  sale: Sale & {
    items: (SaleItemType & { product: Product })[]
    cashier: Cashier
  }
}

export function SaleItem({ sale }: SaleItemProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sale #{sale.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Total:</strong> ${sale.total.toFixed(2)}
            </p>
            <p>
              <strong>Cashier:</strong> {sale.cashier.name}
            </p>
          </div>
          <div>
            <p>
              <strong>Payment Method:</strong> <Badge>{sale.paymentMethod}</Badge>
            </p>
            <p>
              <strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="list-disc list-inside">
            {sale.items.map((item) => (
              <li key={item.id}>
                {item.product.name} - {item.qty} x ${item.price.toFixed(2)} ({item.type})
                {item.isSpecialPrice && (
                  <Badge className="ml-2 bg-green-500">
                    Special Price
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

