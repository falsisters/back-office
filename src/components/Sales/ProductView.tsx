"use client";

import { GetAllSalesByUserIdPayload } from "../../../utils/types/Sales/getAllSalesByUserId.type";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { parseProductType } from "../../../utils/parsers/productType.parser";

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
      }[];
      totalQuantity: number;
      totalAmount: number;
      originalAmount: number;
      hasDiscounts: boolean;
    }
  >();

  sales.forEach((sale) => {
    sale.SaleItem.forEach((item) => {
      const isSackPriceItem = item.sackPriceId && !item.perKiloPriceId;
      const isPerKiloItem = item.perKiloPriceId && !item.sackPriceId;

      const sackType = item.sackType;
      const sackTypeLabel = sackType ? parseProductType(sackType) : "";

      let basePrice = 0;

      if (isSackPriceItem) {
        const matchingSackPrice = item.product.SackPrice.find(
          (sp) => sp.type === sackType
        );

        if (!matchingSackPrice) {
          console.warn(
            `Missing sack price for type ${sackType} in product ${item.product.name}`
          );
        }

        basePrice = matchingSackPrice?.price || 0;
      } else if (isPerKiloItem) {
        basePrice = item.product.perKiloPrice?.price || 0;
      }

      const price =
        item.isDiscounted && item.discountedPrice
          ? item.discountedPrice
          : basePrice;

      const isDiscounted =
        item.isDiscounted && item.discountedPrice !== basePrice;

      const key = `${item.product.name}-${
        isSackPriceItem ? sackType : "per-kilo"
      }-${item.isGantang ? "gantang" : "regular"}`;

      if (!productGroups.has(key)) {
        productGroups.set(key, {
          productName: `${item.product.name}${
            isSackPriceItem && sackTypeLabel ? ` ${sackTypeLabel}` : ""
          }`.trim(),
          isGantang: item.isGantang,
          sackType: isSackPriceItem ? sackTypeLabel : "",
          priceType: isSackPriceItem ? "sack" : "per-kilo",
          items: [],
          totalQuantity: 0,
          totalAmount: 0,
          originalAmount: 0,
          hasDiscounts: false,
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
      });
      productGroup.totalQuantity += item.quantity;
      productGroup.totalAmount += Math.ceil(price * item.quantity);
      productGroup.originalAmount += Math.ceil(basePrice * item.quantity);

      if (isDiscounted) productGroup.hasDiscounts = true;
    });
  });

  return (
    <div className="space-y-6">
      {Array.from(productGroups.entries()).map(([key, product]) => (
        <Card key={key} className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {product.priceType === "sack" ? (
                  <>
                    {product.productName.replace(` ${product.sackType}`, "")}{" "}
                    <strong>{product.sackType}</strong>
                  </>
                ) : (
                  product.productName
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {product.priceType === "sack"
                    ? `${product.sackType} Sack`
                    : parseProductType("PER_KILO")}
                </Badge>
                {product.isGantang && (
                  <Badge variant="outline">{parseProductType("GANTANG")}</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y">
              {product.items.map((item, index) => (
                <div key={`${key}-${index}`} className="p-4 hover:bg-muted/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {item.quantity}{" "}
                          {product.priceType === "sack" ? (
                            <>
                              {product.productName.replace(
                                ` ${product.sackType}`,
                                ""
                              )}{" "}
                              <strong>{product.sackType}</strong>
                            </>
                          ) : (
                            product.productName
                          )}
                        </p>
                        {item.isDiscounted && (
                          <Badge variant="destructive" className="text-xs">
                            Discounted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">
                        ₱
                        {Math.ceil(item.price * item.quantity).toLocaleString()}
                      </p>
                      {item.isDiscounted && (
                        <p className="text-xs text-muted-foreground line-through">
                          ₱
                          {Math.ceil(
                            item.originalPrice * item.quantity
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 p-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Total</p>
                  <p className="text-sm text-muted-foreground">
                    {product.totalQuantity} items across {product.items.length}{" "}
                    sales
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-lg">
                    ₱{product.totalAmount.toLocaleString()}
                  </p>
                  {product.hasDiscounts && (
                    <p className="text-sm text-muted-foreground line-through">
                      Original: ₱{product.originalAmount.toLocaleString()}
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
