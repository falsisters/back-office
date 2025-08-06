"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import EditProduct from "./EditProduct";
import DeleteProduct from "./DeleteProduct";
import ProductDetails from "./ProductDetails";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { parseProductType } from "../../../utils/parsers/productType.parser";

interface ItemTableProps {
  products: ProductResponse[];
  onProductUpdate: () => void;
}

export default function ItemTable({
  products,
  onProductUpdate,
}: ItemTableProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Safety check for products array
  const safeProducts = Array.isArray(products)
    ? products.filter((product) => product && product.id)
    : [];

  const handleProductDeleted = () => {
    onProductUpdate();
  };

  const handleRowClick = (product: ProductResponse) => {
    try {
      // Validate product data before opening details
      if (!product || !product.id) {
        console.error("Invalid product data:", product);
        return;
      }
      setSelectedProduct(product);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error opening product details:", error, { product });
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedProduct(null);
  };
  if (safeProducts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground mb-2">No products found</p>
        <p className="text-sm text-muted-foreground">
          Add products using the Create Product button above
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead className="w-[250px] font-semibold">Product</TableHead>
              <TableHead className="font-semibold">Sack Prices</TableHead>
              <TableHead className="font-semibold">Per Kilo Price</TableHead>
              <TableHead className="text-right w-[120px] font-semibold">
                Actions
              </TableHead>{" "}
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeProducts.map((product) => (
              <TableRow
                key={product.id}
                className="hover:bg-muted/30 cursor-pointer"
              >
                <TableCell
                  className="font-medium"
                  onClick={() => handleRowClick(product)}
                >
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border">
                      <Image
                        src={product.picture || "/placeholder.svg"}
                        alt={product.name || "Product image"}
                        fill
                        sizes="40px"
                        className="object-cover"
                        onError={(e) => {
                          console.warn(
                            "Product image failed to load:",
                            product.picture
                          );
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    </div>
                    <span className="truncate">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell onClick={() => handleRowClick(product)}>
                  {product.SackPrice && product.SackPrice.length > 0 ? (
                    <div className="space-y-1.5">
                      {product.SackPrice.map((sackPrice: any) => (
                        <div
                          key={sackPrice.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Badge
                            variant="outline"
                            className="font-normal bg-primary/5 text-primary border-primary/20"
                          >
                            {parseProductType(sackPrice.type)}
                          </Badge>
                          <span className="font-medium text-secondary">
                            ₱{sackPrice.price.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            (Stock: {sackPrice.stock})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      No sack pricing
                    </span>
                  )}
                </TableCell>
                <TableCell onClick={() => handleRowClick(product)}>
                  {product.perKiloPrice ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className="font-normal bg-primary/5 text-primary border-primary/20"
                      >
                        Per Kilo
                      </Badge>
                      <span className="font-medium text-secondary">
                        ₱{product.perKiloPrice.price.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        (Stock: {product.perKiloPrice.stock} kg)
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No kilo price
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EditProduct
                      productId={product.id}
                      onProductUpdated={onProductUpdate}
                    />
                    <DeleteProduct
                      productId={product.id}
                      productName={product.name}
                      onProductDeleted={handleProductDeleted}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductDetails
        product={selectedProduct}
        open={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </>
  );
}
