"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type";
import Image from "next/image";
import { parseProductType } from "../../../utils/parsers/productType.parser";

interface StocksTableProps {
  products: ProductResponse[];
}

export default function StocksTable({ products }: StocksTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/20">
        <p className="text-muted-foreground mb-2 text-lg">No products found</p>
        <p className="text-muted-foreground">No stock data available</p>
      </div>
    );
  }

  const tableRows: Array<{
    productId: string;
    productName: string;
    productImage: string;
    isFirstRow: boolean;
    rowSpan: number;
    type: string;
    price: number;
    stock: number;
    isPerKilo: boolean;
  }> = [];

  products.forEach((product) => {
    let rowCount = product.SackPrice.length;
    if (product.perKiloPrice) rowCount += 1;

    product.SackPrice.forEach((sack, index) => {
      tableRows.push({
        productId: product.id,
        productName: product.name,
        productImage: product.picture || "/placeholder.svg",
        isFirstRow: index === 0,
        rowSpan: rowCount,
        type: sack.type,
        price: sack.price,
        stock: sack.stock,
        isPerKilo: false,
      });
    });

    if (product.perKiloPrice) {
      tableRows.push({
        productId: product.id,
        productName: product.name,
        productImage: product.picture || "/placeholder.svg",
        isFirstRow: product.SackPrice.length === 0,
        rowSpan: rowCount,
        type: "PER_KILO",
        price: product.perKiloPrice.price,
        stock: product.perKiloPrice.stock,
        isPerKilo: true,
      });
    }
  });

  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="font-semibold text-base w-[30%]">Product</TableHead>
            <TableHead className="font-semibold text-base w-[20%]">Type</TableHead>
            <TableHead className="font-semibold text-base w-[50%]">Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRows.map((row, index) => (
            <TableRow
              key={`${row.productId}-${row.type}-${index}`}
              className={`hover:bg-muted/30 text-base ${
                !row.isFirstRow ? "border-t-0" : ""
              }`}
            >
              {row.isFirstRow && (
                <TableCell
                  className="font-medium py-1 pl-4 pr-2"
                  rowSpan={row.rowSpan}
                  style={{ verticalAlign: "middle" }}
                >
                  <div className="flex items-center">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border">
                      <Image
                        src={row.productImage || "/placeholder.svg"}
                        alt={row.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-lg font-bold ml-3">
                      {row.productName}
                    </div>
                  </div>
                </TableCell>
              )}
              <TableCell className="pl-2 pr-1">
                <div className="font-bold text-base">
                  {parseProductType(row.type)}
                </div>
              </TableCell>
              <TableCell className="pl-1 pr-4">
                <div className="font-semibold text-base">
                  {row.stock} {row.isPerKilo ? "kg" : "sacks"}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}