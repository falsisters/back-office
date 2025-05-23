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
  const sackPriceItems = sales.flatMap((sale) =>
    sale.SaleItem.filter(
      (item) => item.sackPriceId && !item.perKiloPriceId
    ).map((item) => ({ item, sale }))
  );

  const perKiloPriceItems = sales.flatMap((sale) =>
    sale.SaleItem.filter(
      (item) => item.perKiloPriceId && !item.sackPriceId
    ).map((item) => ({ item, sale }))
  );

  return (
    <div className="flex gap-4 flex-col md:flex-row">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Sack Price Items</CardTitle>
        </CardHeader>
        <CardContent>
          {sackPriceItems.map(({ item, sale }) => {
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
                ? ` (${sale.paymentMethod.replace("_", " ")})`
                : "";
            // const specialPriceInfo = item.isSpecialPrice
            //   ? " (special price)"
            //   : "";
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
                    <div className="flex items-center justify-end">
                      <span className="font-mono font-semibold text-secondary">
                        ₱{totalPrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {paymentInfo}
                      </span>
                    </div>
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
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Per Kilo Price Items</CardTitle>
        </CardHeader>
        <CardContent>
          {perKiloPriceItems.map(({ item, sale }) => {
            const price = item.product.perKiloPrice?.price || 0;

            const displayPrice =
              item.isDiscounted && item.discountedPrice
                ? item.discountedPrice
                : price;

            const totalPrice = Math.floor(displayPrice * item.quantity);
            const paymentInfo =
              sale.paymentMethod !== "CASH"
                ? ` (${sale.paymentMethod.replace("_", " ")})`
                : "";
            // const specialPriceInfo = item.isSpecialPrice
            //   ? " (special price)"
            //   : "";
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
                    <div className="flex items-center justify-end">
                      <span className="font-mono font-semibold text-secondary">
                        ₱{totalPrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {paymentInfo}
                      </span>
                    </div>
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
        </CardContent>
      </Card>
    </div>
  );
}