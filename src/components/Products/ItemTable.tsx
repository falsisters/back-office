"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type"
import EditProduct from "./EditProduct"
import DeleteProduct from "./DeleteProduct"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { parseProductType } from "../../../utils/parsers/productType.parser"

interface ItemTableProps {
  products: ProductResponse[]
  onProductUpdate: () => void
}

export default function ItemTable({ products, onProductUpdate }: ItemTableProps) {
  const handleProductDeleted = (productId: string) => {
    onProductUpdate()
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground mb-2">No products found</p>
        <p className="text-sm text-muted-foreground">Add products using the Create Product button above</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="w-[250px] font-semibold">Product</TableHead>
            <TableHead className="font-semibold">Sack Prices</TableHead>
            <TableHead className="font-semibold">Per Kilo Price</TableHead>
            <TableHead className="text-right w-[120px] font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border">
                    <Image
                      src={product.picture || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="truncate">{product.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {product.SackPrice && product.SackPrice.length > 0 ? (
                  <div className="space-y-1.5">
                    {product.SackPrice.map((sackPrice) => (
                      <div key={sackPrice.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-normal bg-primary/5 text-primary border-primary/20">
                          {parseProductType(sackPrice.type)}
                        </Badge>
                        <span className="font-medium text-secondary">₱{sackPrice.price.toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">(Stock: {sackPrice.stock})</span>
                        {sackPrice.specialPrice && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-secondary/10 text-secondary border-secondary/20"
                          >
                            Special: ₱{sackPrice.specialPrice.price.toFixed(2)}
                            (Min: {sackPrice.specialPrice.minimumQty})
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No sack prices</span>
                )}
              </TableCell>
              <TableCell>
                {product.perKiloPrice && Array.isArray(product.perKiloPrice) && product.perKiloPrice.length > 0 ? (
                  <div className="space-y-1">
                    {product.perKiloPrice.map((kiloPrice) => (
                      <div key={kiloPrice.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-normal bg-primary/5 text-primary border-primary/20">
                          Per Kilo
                        </Badge>
                        <span className="font-medium text-secondary">₱{kiloPrice.price.toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">(Stock: {kiloPrice.stock} kg)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No kilo prices</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <EditProduct productId={product.id} onProductUpdated={onProductUpdate} />
                  <DeleteProduct
                    productId={product.id}
                    productName={product.name}
                    onProductDeleted={() => handleProductDeleted(product.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

