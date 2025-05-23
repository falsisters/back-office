"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { parseProductType } from "../../../utils/parsers/productType.parser"

interface StocksTableProps {
  products: ProductResponse[]
}

export default function StocksTable({ products }: StocksTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/20">
        <p className="text-muted-foreground mb-2 text-lg">No products found</p>
        <p className="text-muted-foreground">No stock data available</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="font-semibold text-base">Product</TableHead>
            <TableHead className="font-semibold text-base">Sack Types</TableHead>
            <TableHead className="font-semibold text-base">Per Kilo</TableHead>
            <TableHead className="font-semibold text-base text-right">Total Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const totalSackStock = product.SackPrice.reduce((sum, sack) => sum + sack.stock, 0)
            const totalKiloStock = product.perKiloPrice?.stock || 0

            return (
              <TableRow key={product.id} className="hover:bg-muted/30 text-base">
                <TableCell className="font-medium py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border">
                      <Image
                        src={product.picture || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-base font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{product.SackPrice.length} sack types</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-2">
                    {product.SackPrice.length > 0 ? (
                      product.SackPrice.map((sack) => (
                        <div key={sack.id} className="bg-white rounded-md border p-2 flex flex-col">
                          <div className="font-medium text-sm">{parseProductType(sack.type)}</div>
                          <div className="flex justify-between items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">₱{sack.price.toFixed(2)}</span>
                            <Badge variant="outline" className="text-xs font-semibold">
                              {sack.stock} in stock
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No sack types</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {product.perKiloPrice ? (
                    <div className="bg-white rounded-md border p-2 flex flex-col max-w-[150px]">
                      <div className="font-medium text-sm">{parseProductType("PER_KILO")}</div>
                      <div className="flex justify-between items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          ₱{product.perKiloPrice.price.toFixed(2)}/kg
                        </span>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {product.perKiloPrice.stock} kg
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <div className="font-semibold text-base">{totalSackStock} sacks</div>
                    {totalKiloStock > 0 && <div className="text-sm text-muted-foreground">{totalKiloStock} kg</div>}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
