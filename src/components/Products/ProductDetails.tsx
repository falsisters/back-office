"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { parseProductType } from "../../../utils/parsers/productType.parser";
import { Button } from "../ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Scale, Tag } from "lucide-react";

interface ProductDetailsProps {
  product: ProductResponse | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDetails({
  product,
  open,
  onClose,
}: ProductDetailsProps) {
  if (!product) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border">
              <Image
                src={product.picture || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {product.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Product details and pricing information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Sack Prices Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Sack Prices</h3>
            </div>

            {product.SackPrice && product.SackPrice.length > 0 ? (
              <div className="space-y-4">
                {[...product.SackPrice]
                  .sort((a, b) => {
                    // Extract numeric values from type strings
                    const aMatch = a.type.match(/(\d+)/);
                    const bMatch = b.type.match(/(\d+)/);

                    const aValue = aMatch ? Number.parseInt(aMatch[0], 10) : 0;
                    const bValue = bMatch ? Number.parseInt(bMatch[0], 10) : 0;

                    // Sort in descending order (largest to smallest)
                    return bValue - aValue;
                  })
                  .map((sackPrice) => (
                    <div
                      key={sackPrice.id}
                      className="bg-card rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="font-medium text-sm bg-primary/10 text-primary border-primary/20 px-3 py-1.5"
                        >
                          {parseProductType(sackPrice.type)}
                        </Badge>
                        <span className="font-bold text-xl text-primary">
                          ₱{sackPrice.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-secondary/5 px-4 py-2 rounded-md border border-secondary/10">
                          <Tag className="h-4 w-4 text-secondary" />
                          <p className="font-medium">
                            Stock:{" "}
                            <span className="text-lg font-bold text-secondary">
                              {sackPrice.stock} Sacks
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg border p-4 text-center">
                <p className="text-muted-foreground italic">
                  No sack pricing available - This product is sold per kilo only
                </p>
              </div>
            )}
          </div>

          {/* Per Kilo Price Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Per Kilo Price</h3>
            </div>

            {product.perKiloPrice ? (
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="font-medium text-sm bg-primary/10 text-primary border-primary/20 px-3 py-1.5"
                  >
                    Per Kilo
                  </Badge>
                  <span className="font-bold text-xl text-primary">
                    ₱{product.perKiloPrice.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-secondary/5 px-4 py-2 rounded-md border border-secondary/10">
                  <Tag className="h-4 w-4 text-secondary" />
                  <p className="font-medium">
                    Stock:{" "}
                    <span className="text-lg font-bold text-secondary">
                      {product.perKiloPrice.stock} kg
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg border p-4 text-center">
                <p className="text-muted-foreground">
                  No per kilo price available
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
