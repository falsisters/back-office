import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Delivery, DeliveryItem as DeliveryItemType } from "../../utils/types/schema.type"

interface DeliveryItemProps {
  delivery: Delivery & { items: (DeliveryItemType & { product: { name: string } })[]; cashier: { name: string } }
}

export function DeliveryItem({ delivery }: DeliveryItemProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery #{delivery.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Total:</strong> ${delivery.total.toFixed(2)}
            </p>
            <p>
              <strong>Driver:</strong> {delivery.driver}
            </p>
            <p>
              <strong>Cashier:</strong> {delivery.cashier.name}
            </p>
          </div>
          <div>
            <p>
              <strong>Status:</strong>{" "}
              {delivery.isFinished ? (
                <Badge variant="default">Finished</Badge>
              ) : (
                <Badge variant="destructive">In Progress</Badge>
              )}
            </p>
            <p>
              <strong>Created:</strong> {new Date(delivery.createdAt).toLocaleString()}
            </p>
            {delivery.isFinished && (
              <p>
                <strong>Finished:</strong> {new Date(delivery.timeFinished).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="list-disc list-inside">
            {delivery.items.map((item) => (
              <li key={item.id}>
                {item.product.name} - {item.qty} x ${item.price.toFixed(2)} ({item.type})
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

