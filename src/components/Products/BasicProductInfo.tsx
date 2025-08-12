import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { CurrencyCalculator } from "../../../utils/currencyCalculator";

interface BasicProductInfoProps {
  product: ProductResponse;
  isLoading?: boolean;
}

export default function BasicProductInfo({
  product,
  isLoading = false,
}: BasicProductInfoProps) {
  // Helper function to safely parse and format price values from API
  const parseApiPrice = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "string") return parseFloat(value) || 0;
    if (typeof value === "number") return value;
    return 0;
  };

  // Helper function to format currency display
  const formatCurrency = (value: any): string => {
    const numValue = parseApiPrice(value);
    return CurrencyCalculator.round(numValue).toFixed(2);
  };

  if (isLoading) {
    return <ProductSkeleton />;
  }

  return (
    <Card className="w-full max-w-md hover:shadow-md transition-shadow duration-200 overflow-hidden border-t-2 border-t-primary">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-xl font-bold truncate text-primary">
          {product.name}
        </CardTitle>
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
            <h3 className="font-semibold text-lg mb-2 flex items-center text-primary">
              <span>Sack Prices</span>
              <Badge
                variant="outline"
                className="ml-2 bg-primary/5 text-primary border-primary/20"
              >
                {product.SackPrice.length} options
              </Badge>
            </h3>
            <div className="space-y-2">
              {product.SackPrice.map((sackPrice) => (
                <div
                  key={sackPrice.id}
                  className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium">
                    {formatSackType(sackPrice.type)}
                  </span>
                  <span className="font-semibold text-secondary">
                    ₱{formatCurrency(sackPrice.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {product.perKiloPrice && (
            <div>
              <h3 className="font-semibold text-lg mb-2 text-primary">
                Per Kilo Price
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors">
                  <span className="font-medium">Price per Kilo</span>
                  <span className="font-semibold text-secondary">
                    ₱{formatCurrency(product.perKiloPrice.price)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card className="w-full max-w-md border-t-2 border-t-primary/30">
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
  );
}

function formatSackType(type: string): string {
  switch (type) {
    case "FIFTY_KG":
      return "50 KG";
    case "TWENTY_FIVE_KG":
      return "25 KG";
    case "FIVE_KG":
      return "5 KG";
    default:
      return type.replace(/_/g, " ");
  }
}
