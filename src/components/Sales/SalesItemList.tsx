"use client";

import { GetAllSalesByUserIdPayload } from "../../../utils/types/Sales/getAllSalesByUserId.type";
import { SaleView } from "./SaleView";
import { ProductView } from "./ProductView";

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
