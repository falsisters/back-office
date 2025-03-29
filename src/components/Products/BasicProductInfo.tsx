import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type"

interface BasicProductInfoProps {
  product: ProductResponse
  isLoading?: boolean
}

export default function BasicProductInfo({ product, isLoading = false }: BasicProductInfoProps) {
  if (isLoading) {
    return <ProductSkeleton />
  }

  return (
    <Card className="w-full max-w-md hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold truncate">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="relative w-full h-56 overflow-hidden rounded-md">
          <Image
            src={product.picture || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover rounded-md hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <span>Sack Prices</span>
              <Badge variant="outline" className="ml-2">
                {product.SackPrice.length} options
              </Badge>
            </h3>
            <div className="space-y-2">
              {product.SackPrice.map((sackPrice) => (
                <div key={sackPrice.id} className="flex justify-between items-center py-1 px-2 rounded-md bg-muted/50">
                  <span className="font-medium">{formatSackType(sackPrice.type)}</span>
                  <span className="font-semibold text-primary">₱{sackPrice.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {product.perKiloPrice.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Per Kilo Price</h3>
              <div className="space-y-2">
                {product.perKiloPrice.map((kiloPrice) => (
                  <div
                    key={kiloPrice.id}
                    className="flex justify-between items-center py-1 px-2 rounded-md bg-muted/50"
                  >
                    <span className="font-medium">Price per Kilo</span>
                    <span className="font-semibold text-primary">₱{kiloPrice.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <Skeleton className="w-full h-56 rounded-md" />

        <div className="space-y-4">
          <div>
            <Skeleton className="h-5 w-1/3 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatSackType(type: string): string {
  switch (type) {
    case "FIFTY_KG":
      return "50 KG"
    case "TWENTY_FIVE_KG":
      return "25 KG"
    case "FIVE_KG":
      return "5 KG"
    default:
      return type.replace(/_/g, " ")
  }
}

