"use client";

import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { SackType } from "../../../utils/types/schema.type";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
};

interface SalesItemListProps {
  sales: GetAllSalesByUserIdPayload;
  viewMode: "perSale" | "perProduct";
}

export function SalesItemList({ sales, viewMode }: SalesItemListProps) {
  if (viewMode === "perProduct") {
    return <ProductView sales={sales} />;
  }
  return <SaleView sales={sales} />;
}

function ProductView({ sales }: { sales: GetAllSalesByUserIdPayload }) {
  const productMap = new Map<
    string,
    {
      quantity: number;
      totalAmount: number;
      productName: string;
      isGantang: boolean;
      isSpecialPrice: boolean;
      sackType?: string;
    }
  >();

  sales.forEach((sale) => {
    sale.SaleItem.forEach((item) => {
      const sackType = item.product.SackPrice[0]?.type as SackType | undefined;
      const sackTypeLabel = sackType ? sackTypeLabels[sackType] : "";
      const price =
        item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
          ? item.product.SackPrice[0]?.specialPrice?.price
          : item.product.SackPrice[0]?.price ||
            item.product.perKiloPrice?.price ||
            0;

      const key = `${item.product.name}-${sackTypeLabel}-${
        item.isGantang ? "gantang" : "regular"
      }-${item.isSpecialPrice ? "special" : "normal"}`;

      if (!productMap.has(key)) {
        productMap.set(key, {
          quantity: 0,
          totalAmount: 0,
          productName: `${item.product.name} ${sackTypeLabel}`,
          isGantang: item.isGantang,
          isSpecialPrice: item.isSpecialPrice,
          sackType: sackTypeLabel,
        });
      }

      const productData = productMap.get(key)!;
      productData.quantity += item.quantity;
      productData.totalAmount += price * item.quantity;
    });
  });

  // Separate products into sackPrice and perKiloPrice groups
  const sackPriceProducts = Array.from(productMap.entries()).filter(
    ([, productData]) => productData.sackType !== ""
  );
  const perKiloPriceProducts = Array.from(productMap.entries()).filter(
    ([, productData]) => productData.sackType === ""
  );

  return (
    <div className="flex gap-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Sack Price Items</CardTitle>
        </CardHeader>
        <CardContent>
          {sackPriceProducts.map(([key, productData]) => {
            const specialPriceInfo = productData.isSpecialPrice
              ? " (special price)"
              : "";
            const gantangInfo = productData.isGantang ? " (gantang)" : "";

            return (
              <div
                key={key}
                className="py-2 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-medium">
                      {productData.quantity} {productData.productName}
                      {specialPriceInfo}
                      {gantangInfo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-secondary">
                      ₱{Math.floor(productData.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Per Kilo Price Items</CardTitle>
        </CardHeader>
        <CardContent>
          {perKiloPriceProducts.map(([key, productData]) => {
            const specialPriceInfo = productData.isSpecialPrice
              ? " (special price)"
              : "";
            const gantangInfo = productData.isGantang ? " (gantang)" : "";

            return (
              <div
                key={key}
                className="py-2 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-medium">
                      {productData.quantity} {productData.productName}
                      {specialPriceInfo}
                      {gantangInfo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-secondary">
                      ₱{Math.floor(productData.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function SaleView({ sales }: { sales: GetAllSalesByUserIdPayload }) {
  // Separate sale items into sackPrice and perKiloPrice groups with adjusted conditions
  const sackPriceItems = sales.flatMap((sale) =>
    sale.SaleItem.filter(
      (item) =>
        item.product.SackPrice[0]?.price !== undefined
    ).map((item) => ({ item, sale }))
  );
  const perKiloPriceItems = sales.flatMap((sale) =>
    sale.SaleItem.filter(
      (item) =>
        item.product.perKiloPrice?.price !== undefined &&
        item.product.SackPrice[0]?.price === undefined
    ).map((item) => ({ item, sale }))
  );

  return (
    <div className="flex gap-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Sack Price Items</CardTitle>
        </CardHeader>
        <CardContent>
          {sackPriceItems.map(({ item, sale }) => {
            const sackType = item.product.SackPrice[0]?.type as SackType | undefined;
            const sackTypeLabel = sackType ? sackTypeLabels[sackType] : "";
            const price =
              item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
                ? item.product.SackPrice[0]?.specialPrice?.price
                : item.product.SackPrice[0]?.price ||
                  item.product.perKiloPrice?.price ||
                  0;

            const totalPrice = Math.floor(price * item.quantity);
            const paymentInfo =
              sale.paymentMethod !== "CASH"
                ? ` (${sale.paymentMethod.replace("_", " ")})`
                : "";
            const specialPriceInfo = item.isSpecialPrice ? " (special price)" : "";
            const gantangInfo = item.isGantang ? " (gantang)" : "";

            return (
              <div
                key={`${item.id}-${sale.id}`}
                className="py-2 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-medium">
                      {item.quantity} {item.product.name} {sackTypeLabel}
                      {specialPriceInfo}
                      {gantangInfo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-secondary">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {paymentInfo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Per Kilo Price Items</CardTitle>
        </CardHeader>
        <CardContent>
          {perKiloPriceItems.map(({ item, sale }) => {
            const sackType = item.product.SackPrice[0]?.type as SackType | undefined;
            const sackTypeLabel = sackType ? sackTypeLabels[sackType] : "";
            const price =
              item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
                ? item.product.SackPrice[0]?.specialPrice?.price
                : item.product.SackPrice[0]?.price ||
                  item.product.perKiloPrice?.price ||
                  0;

            const totalPrice = Math.floor(price * item.quantity);
            const paymentInfo =
              sale.paymentMethod !== "CASH"
                ? ` (${sale.paymentMethod.replace("_", " ")})`
                : "";
            const specialPriceInfo = item.isSpecialPrice ? " (special price)" : "";
            const gantangInfo = item.isGantang ? " (gantang)" : "";

            return (
              <div
                key={`${item.id}-${sale.id}`}
                className="py-2 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-medium">
                      {item.quantity} {item.product.name} {sackTypeLabel}
                      {specialPriceInfo}
                      {gantangInfo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-secondary">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {paymentInfo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
