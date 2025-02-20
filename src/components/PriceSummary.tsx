import type { ProductType } from "../../utils/types/schema.type"

interface PriceSummaryProps {
  prices: Array<{
    price: number
    stock: number
    type: ProductType
    specialPrice: Array<{ specialPrice: number; minimumQty: number }>
    profit: Array<{ profit: number }>
  }>
}

export function PriceSummary({ prices }: PriceSummaryProps) {
  const formatPriceType = (type: ProductType) => {
    switch (type) {
      case "FIFTY_KG":
        return "50 KG"
      case "TWENTY_FIVE_KG":
        return "25 KG"
      case "FIVE_KG":
        return "5 KG"
      case "PER_KILO":
        return "Per Kilo"
      case "GANTANG":
        return "Gantang"
      default:
        return type
    }
  }

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
                  {formatPriceType(p.type)}: Pesos{p.price.toFixed(2)} (Stock: {p.stock})
                  {p.profit.length > 0 && ` with ${p.profit.length} profit setting${p.profit.length > 1 ? "s" : ""}`}
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

