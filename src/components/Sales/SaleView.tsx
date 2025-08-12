"use client";

import { useState } from "react";
import { GetAllSalesByUserIdPayload } from "../../../utils/types/Sales/getAllSalesByUserId.type";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseProductType } from "../../../utils/parsers/productType.parser";
import { Decimal } from "decimal.js";

const sackTypeLabels = {
  FIFTY_KG: "50KG",
  TWENTY_FIVE_KG: "25KG",
  FIVE_KG: "5KG",
};

const ITEMS_PER_PAGE = 10;

export function SaleView({ sales }: { sales: GetAllSalesByUserIdPayload }) {
  const [asinCurrentPage, setAsinCurrentPage] = useState(1);
  const [otherCurrentPage, setOtherCurrentPage] = useState(1);
  const [perKiloCurrentPage, setPerKiloCurrentPage] = useState(1);

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
      return total + Math.ceil(displayPrice * item.quantity);
    }, 0);
  };

  const calculateTotalQuantity = (items: typeof perKiloPriceItems) => {
    const total = items.reduce((total, { item }) => {
      return total.plus(item.quantity);
    }, new Decimal(0));
    return total.toFixed(2);
  };

  const getPaginatedItems = (
    items: typeof perKiloPriceItems,
    currentPage: number
  ) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: typeof perKiloPriceItems) => {
    return Math.ceil(items.length / ITEMS_PER_PAGE);
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex gap-4 flex-wrap">
      {/* Asin Sack Items */}
      <Card className="flex-1 min-w-[300px]">
        <CardHeader>
          <CardTitle>Asin Sack Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getPaginatedItems(asinSackItems, asinCurrentPage).map(
            ({ item, sale }) => {
              const sackType = item.sackType;
              const sackTypeLabel = sackType ? parseProductType(sackType) : "";

              const matchingSackPrice = item.product.SackPrice.find(
                (sp) => sp.type === sackType
              );

              let price = 0;
              price = matchingSackPrice?.price || 0;

              const displayPrice =
                item.isDiscounted && item.discountedPrice
                  ? item.discountedPrice
                  : price;

              const totalPrice = Math.ceil(displayPrice * item.quantity);
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
                        {new Decimal(item.quantity).toFixed(2)}{" "}
                        {item.product.name} <strong>{sackTypeLabel}</strong>
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
            }
          )}

          <PaginationControls
            currentPage={asinCurrentPage}
            totalPages={getTotalPages(asinSackItems)}
            onPageChange={setAsinCurrentPage}
          />

          {asinSackItems.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl text-primary">
                  {calculateTotalQuantity(asinSackItems)}
                </span>
                <span className="font-mono font-bold text-2xl text-primary">
                  ₱{calculateTotalSales(asinSackItems).toLocaleString()}
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
          {getPaginatedItems(otherSackItems, otherCurrentPage).map(
            ({ item, sale }) => {
              const sackType = item.sackType;
              const sackTypeLabel = sackType ? parseProductType(sackType) : "";

              const matchingSackPrice = item.product.SackPrice.find(
                (sp) => sp.type === sackType
              );

              let price = 0;
              price = matchingSackPrice?.price || 0;

              const displayPrice =
                item.isDiscounted && item.discountedPrice
                  ? item.discountedPrice
                  : price;

              const totalPrice = Math.ceil(displayPrice * item.quantity);
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
                        {new Decimal(item.quantity).toFixed(0)}{" "}
                        {item.product.name} <strong>{sackTypeLabel}</strong>
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
            }
          )}

          <PaginationControls
            currentPage={otherCurrentPage}
            totalPages={getTotalPages(otherSackItems)}
            onPageChange={setOtherCurrentPage}
          />

          {otherSackItems.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl text-primary">
                  {calculateTotalQuantity(otherSackItems)}
                </span>
                <span className="font-mono font-bold text-2xl text-primary">
                  ₱{calculateTotalSales(otherSackItems).toLocaleString()}
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
          {getPaginatedItems(perKiloPriceItems, perKiloCurrentPage).map(
            ({ item, sale }) => {
              const price = item.product.perKiloPrice?.price || 0;

              const displayPrice =
                item.isDiscounted && item.discountedPrice
                  ? item.discountedPrice
                  : price;

              const totalPrice = Math.ceil(displayPrice * item.quantity);
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
                        {new Decimal(item.quantity).toFixed(2)}{" "}
                        {item.product.name}
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
            }
          )}

          <PaginationControls
            currentPage={perKiloCurrentPage}
            totalPages={getTotalPages(perKiloPriceItems)}
            onPageChange={setPerKiloCurrentPage}
          />

          {perKiloPriceItems.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl text-primary">
                  {calculateTotalQuantity(perKiloPriceItems)}
                </span>
                <span className="font-mono font-bold text-2xl text-primary">
                  ₱{calculateTotalSales(perKiloPriceItems).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
