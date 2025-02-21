import { getAllSalesByUserId } from "@/lib/server/getAllSalesByUserId"
import { SaleItem } from "./SaleItem"
import { SalesSummary } from "./SalesSummary"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type"

export async function SalesList() {
  try {
    const sales: GetAllSalesByUserIdPayload = await getAllSalesByUserId()

    if (sales.length === 0) {
      return <p>No sales found.</p>
    }

    return (
      <>
        <SalesSummary sales={sales} />
        <div className="space-y-4">
          {sales.map((sale) => (
            <SaleItem key={sale.id} sale={sale} />
          ))}
        </div>
      </>
    )
  } catch (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error ? error.message : "An unexpected error occurred while fetching sales data."}
        </AlertDescription>
      </Alert>
    )
  }
}

