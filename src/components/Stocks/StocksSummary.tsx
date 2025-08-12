import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";

interface StockSummaryProps {
  products: ProductResponse[];
}

export default function StockSummary({ products }: StockSummaryProps) {
  const totalSackStock = products.reduce((total, product) => {
    return (
      total +
      product.SackPrice.reduce((sum, sack) => {
        const stock =
          typeof sack.stock === "string"
            ? parseFloat(sack.stock) || 0
            : sack.stock || 0;
        return sum + stock;
      }, 0)
    );
  }, 0);

  const totalKiloStock = products.reduce((total, product) => {
    if (!product.perKiloPrice) return total;
    const stock =
      typeof product.perKiloPrice.stock === "string"
        ? parseFloat(product.perKiloPrice.stock) || 0
        : product.perKiloPrice.stock || 0;
    return total + stock;
  }, 0);

  return (
    <Card className="border-primary/20">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-semibold text-primary">
          Stock Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-6 py-4">
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">Total Products</p>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">Total Sacks</p>
          <p className="text-3xl font-bold">{totalSackStock.toFixed(0)}</p>
        </div>
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">Total Kilos</p>
          <p className="text-3xl font-bold">{totalKiloStock.toFixed(2)} kg</p>
        </div>
      </CardContent>
    </Card>
  );
}
