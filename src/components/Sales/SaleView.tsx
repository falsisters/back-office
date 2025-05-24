"use client";

import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
};

export function SaleView({ sales }: { sales: GetAllSalesByUserIdPayload }) {
  const asinSackItems = sales.flatMap((sale) =>
    sale.SaleItem.filter(
      (item) =>
        item.sackPriceId &&
        !item.perKiloPriceId &&
        item.product.name.toLowerCase().includes("asin")
    ).map((item) => ({ item, sale }))
  );

  const otherSackItems = sales.flatMap((sale) =>
    sale.SaleItem.filter(
      (item) =>
        item.sackPriceId &&
        !item.perKiloPriceId &&
        !item.product.name.toLowerCase().includes("asin")
    ).map((item) => ({ item, sale }))
  );

  const perKiloPriceItems = sales.flatMap((sale) =>
    sale.SaleItem.filter(
      (item) => item.perKiloPriceId && !item.sackPriceId
    ).map((item) => ({ item, sale }))
  );

  const calculateTotalSales = (items: typeof perKiloPriceItems) => {
    return items.reduce((total, { item }) => {
      let price = 0;

      if (item.sackPriceId) {
        const matchingSackPrice = item.product.SackPrice.find(
          (sp) => sp.type === item.sackType
        );
        price = matchingSackPrice?.price || 0;
      } else if (item.perKiloPriceId) {
        price = item.product.perKiloPrice?.price || 0;
      }

      const displayPrice =
        item.isDiscounted && item.discountedPrice
          ? item.discountedPrice
          : price;
      return total + displayPrice * item.quantity;
    }, 0);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      {/* Asin Sack Items */}
      <Card className="flex-1 min-w-[300px]">
        <CardHeader>
          <CardTitle>Asin Sack Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {asinSackItems.map(({ item, sale }) => {
            const sackType = item.sackType;
            const sackTypeLabel = sackType ? sackTypeLabels[sackType] : "";

            const matchingSackPrice = item.product.SackPrice.find(
              (sp) => sp.type === sackType
            );

            let price = 0;
            // Commented out special price implementation
            // if (item.isSpecialPrice && matchingSackPrice?.specialPrice?.price) {
            //   price = matchingSackPrice.specialPrice.price;
            // } else {
            price = matchingSackPrice?.price || 0;
            // }

            const displayPrice =
              item.isDiscounted && item.discountedPrice
                ? item.discountedPrice
                : price;

            const totalPrice = Math.floor(displayPrice * item.quantity);
            const paymentInfo =
              sale.paymentMethod !== "CASH"
                ? sale.paymentMethod.replace("_", " ")
                : "";
            const gantangInfo = item.isGantang ? " (gantang)" : "";

            return (
              <div
                key={`${item.id}-${sale.id}`}
                className="py-2 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">
                      {item.quantity} {item.product.name} {sackTypeLabel}
                      {gantangInfo}
                    </span>
                    {item.isDiscounted && (
                      <Badge variant="destructive" className="text-xs">
                        Discounted
                      </Badge>
                    )}
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="font-mono font-semibold text-secondary">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                    {paymentInfo && (
                      <span className="text-xs text-muted-foreground">
                        {paymentInfo}
                      </span>
                    )}
                    {item.isDiscounted && item.discountedPrice && (
                      <span className="text-xs text-muted-foreground">
                        Original: ₱
                        {Math.floor(price * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {asinSackItems.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Sales:</span>
                <span className="font-mono font-bold text-lg text-secondary">
                  ₱{Math.floor(calculateTotalSales(asinSackItems)).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Sack Items */}
      <Card className="flex-1 min-w-[300px]">
        <CardHeader>
          <CardTitle>Rice & Other Sack Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {otherSackItems.map(({ item, sale }) => {
            const sackType = item.sackType;
            const sackTypeLabel = sackType ? sackTypeLabels[sackType] : "";

            const matchingSackPrice = item.product.SackPrice.find(
              (sp) => sp.type === sackType
            );

            let price = 0;
            // Commented out special price implementation
            // if (item.isSpecialPrice && matchingSackPrice?.specialPrice?.price) {
            //   price = matchingSackPrice.specialPrice.price;
            // } else {
            price = matchingSackPrice?.price || 0;
            // }

            const displayPrice =
              item.isDiscounted && item.discountedPrice
                ? item.discountedPrice
                : price;

            const totalPrice = Math.floor(displayPrice * item.quantity);
            const paymentInfo =
              sale.paymentMethod !== "CASH"
                ? sale.paymentMethod.replace("_", " ")
                : "";
            const gantangInfo = item.isGantang ? " (gantang)" : "";

            return (
              <div
                key={`${item.id}-${sale.id}`}
                className="py-2 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">
                      {item.quantity} {item.product.name} {sackTypeLabel}
                      {gantangInfo}
                    </span>
                    {item.isDiscounted && (
                      <Badge variant="destructive" className="text-xs">
                        Discounted
                      </Badge>
                    )}
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="font-mono font-semibold text-secondary">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                    {paymentInfo && (
                      <span className="text-xs text-muted-foreground">
                        {paymentInfo}
                      </span>
                    )}
                    {item.isDiscounted && item.discountedPrice && (
                      <span className="text-xs text-muted-foreground">
                        Original: ₱
                        {Math.floor(price * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {otherSackItems.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Sales:</span>
                <span className="font-mono font-bold text-lg text-secondary">
                  ₱{Math.floor(calculateTotalSales(otherSackItems)).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per Kilo Items */}
      <Card className="flex-1 min-w-[300px]">
        <CardHeader>
          <CardTitle>Per Kilo Price Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {perKiloPriceItems.map(({ item, sale }) => {
            const price = item.product.perKiloPrice?.price || 0;

            const displayPrice =
              item.isDiscounted && item.discountedPrice
                ? item.discountedPrice
                : price;

            const totalPrice = Math.floor(displayPrice * item.quantity);
            const paymentInfo =
              sale.paymentMethod !== "CASH"
                ? sale.paymentMethod.replace("_", " ")
                : "";
            const gantangInfo = item.isGantang ? " (gantang)" : "";

            return (
              <div
                key={`${item.id}-${sale.id}`}
                className="py-2 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">
                      {item.quantity} {item.product.name}
                      {/* {specialPriceInfo} */}
                      {gantangInfo}
                    </span>
                    {item.isDiscounted && (
                      <Badge variant="destructive" className="text-xs">
                        Discounted
                      </Badge>
                    )}
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="font-mono font-semibold text-secondary">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                    {paymentInfo && (
                      <span className="text-xs text-muted-foreground">
                        {paymentInfo}
                      </span>
                    )}
                    {item.isDiscounted && item.discountedPrice && (
                      <span className="text-xs text-muted-foreground">
                        Original: ₱
                        {Math.floor(price * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {perKiloPriceItems.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Sales:</span>
                <span className="font-mono font-bold text-lg text-secondary">
                  ₱{Math.floor(calculateTotalSales(perKiloPriceItems)).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}