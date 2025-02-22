import type { ProductType } from "../../../utils/types/schema.type"
import { parseProductType } from "../../../utils/parsers/productType.parser"

interface PriceSummaryProps {
  prices: Array<{
    price: number
    stock: number
    type: ProductType
    profit: Array<{ profit: number }>
    specialPrice: Array<{ specialPrice: number; minimumQty: number }>
  }>
}

export function PriceSummary({ prices }: PriceSummaryProps) {

  return (
    <>
      {prices.some((p) => p.price > 0) && (
        <div className="bg-slate-50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Price Summary</h4>
          <ul className="text-sm space-y-1">
            {prices
              .filter((p) => p.price > 0)
              .map((p, i) => (
                <li key={i}>
                  {parseProductType(p.type)}: Pesos{p.price.toFixed(2)} (Stock: {p.stock})
                  {p.profit.length > 0 &&
                    p.profit[0].profit > 0 &&
                    ` with ${p.profit.length} profit setting${p.profit.length > 1 ? "s" : ""}`}
                  {p.specialPrice.length > 0 &&
                    ` and ${p.specialPrice.length} special price${p.specialPrice.length > 1 ? "s" : ""}`}
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  )
}

