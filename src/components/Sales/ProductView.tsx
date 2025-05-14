"use client";

import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
};

export function ProductView({ sales }: { sales: GetAllSalesByUserIdPayload }) {
  // Group sale items by product
  const productGroups = new Map<
    string,
    {
      productName: string;
      isGantang: boolean;
      sackType?: string;
      priceType: "sack" | "per-kilo";
      items: {
        quantity: number;
        price: number;
        originalPrice: number;
        saleId: string;
        saleDate: Date;
        isDiscounted: boolean;
        isSpecialPrice: boolean;
      }[];
      totalQuantity: number;
      totalAmount: number;
      originalAmount: number;
      hasDiscounts: boolean;
      hasSpecialPrices: boolean;
    }
  >();

  sales.forEach((sale) => {
    sale.SaleItem.forEach((item) => {
      const isSackPriceItem = item.sackPriceId && !item.perKiloPriceId;
      const isPerKiloItem = item.perKiloPriceId && !item.sackPriceId;

      // FIX 1: Directly use item.sackType without fallback
      const sackType = item.sackType;
      const sackTypeLabel = sackType ? sackTypeLabels[sackType] : "";

      let basePrice = 0;

      if (isSackPriceItem) {
        // FIX 2: Properly find matching sack price
        const matchingSackPrice = item.product.SackPrice.find(
          (sp) => sp.type === sackType
        );
        
        if (!matchingSackPrice) {
          console.warn(`Missing sack price for type ${sackType} in product ${item.product.name}`);
        }

        if (item.isSpecialPrice && matchingSackPrice?.specialPrice?.price) {
          basePrice = matchingSackPrice.specialPrice.price;
        } else {
          basePrice = matchingSackPrice?.price || 0;
        }
      } else if (isPerKiloItem) {
        basePrice = item.product.perKiloPrice?.price || 0;
      }

      const price =
        item.isDiscounted && item.discountedPrice
          ? item.discountedPrice
          : basePrice;

      const isDiscounted = item.isDiscounted && item.discountedPrice !== basePrice;
      const isSpecialPrice = item.isSpecialPrice;


      const key = `${item.product.name}-${
        isSackPriceItem ? sackType : "per-kilo"
      }-${item.isGantang ? "gantang" : "regular"}`;

      if (!productGroups.has(key)) {
        productGroups.set(key, {
          productName: `${item.product.name} ${
            isSackPriceItem ? sackTypeLabel : ""
          }`.trim(),
          isGantang: item.isGantang,
          sackType: isSackPriceItem ? sackTypeLabel : "",
          priceType: isSackPriceItem ? "sack" : "per-kilo",
          items: [],
          totalQuantity: 0,
          totalAmount: 0,
          originalAmount: 0,
          hasDiscounts: false,
          hasSpecialPrices: false,
        });
      }

      const productGroup = productGroups.get(key)!;
      productGroup.items.push({
        quantity: item.quantity,
        price,
        originalPrice: basePrice,
        saleId: sale.id,
        saleDate: sale.createdAt,
        isDiscounted,
        isSpecialPrice,
      });
      productGroup.totalQuantity += item.quantity;
      productGroup.totalAmount += price * item.quantity;
      productGroup.originalAmount += basePrice * item.quantity;
      
      // Track if any items have discounts or special prices
      if (isDiscounted) productGroup.hasDiscounts = true;
      if (isSpecialPrice) productGroup.hasSpecialPrices = true;
    });
  });

  return (
    <div className="space-y-6">
      {/* Individual product cards with sale items */}
      {Array.from(productGroups.entries()).map(([key, product]) => (
        <Card key={key} className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {product.productName}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {product.priceType === "sack" 
                    ? `${product.sackType} Sack` 
                    : "Per Kilo"}
                </Badge>
                {product.isGantang && <Badge variant="outline">Gantang</Badge>}
                {product.hasSpecialPrices && <Badge variant="secondary">Has Special Prices</Badge>}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Individual sale items */}
            <div className="divide-y">
              {product.items.map((item, index) => (
                <div key={`${key}-${index}`} className="p-4 hover:bg-muted/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {item.quantity} {product.productName}
                        </p>
                        {item.isDiscounted && (
                          <Badge variant="destructive" className="text-xs">
                            Discounted
                          </Badge>
                        )}
                        {item.isSpecialPrice && (
                          <Badge variant="secondary" className="text-xs">
                            Special Price
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">
                        ₱{Math.floor(item.price * item.quantity).toLocaleString()}
                      </p>
                      {item.isDiscounted && (
                        <p className="text-xs text-muted-foreground line-through">
                          ₱{Math.floor(item.originalPrice * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Product summary */}
            <div className="bg-muted/30 p-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Total</p>
                  <p className="text-sm text-muted-foreground">
                    {product.totalQuantity} items across {product.items.length} sales
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-lg">
                    ₱{Math.floor(product.totalAmount).toLocaleString()}
                  </p>
                  {product.hasDiscounts && (
                    <p className="text-sm text-muted-foreground line-through">
                      Original: ₱{Math.floor(product.originalAmount).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}