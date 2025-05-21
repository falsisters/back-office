"use client"

import React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { parseProductType } from "../../../utils/parsers/productType.parser"

interface StocksTableProps {
  products: ProductResponse[]
}

export default function StocksTable({ products }: StocksTableProps) {
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({})

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

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
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[300px] font-semibold text-base">Product</TableHead>
            <TableHead className="font-semibold text-base">Total Stock (Sacks)</TableHead>
            <TableHead className="font-semibold text-base">Total Stock (Kg)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isExpanded = expandedProducts[product.id] || false
            const totalSackStock = product.SackPrice.reduce((sum, sack) => sum + sack.stock, 0)
            const totalKiloStock = product.perKiloPrice?.stock || 0

            return (
              <React.Fragment key={product.id}>
                <TableRow className="hover:bg-muted/30 text-base">
                  <TableCell className="p-0 w-[50px] pl-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleProductExpand(product.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      <span className="sr-only">Toggle details</span>
                    </Button>
                  </TableCell>
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
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-base">{totalSackStock}</span>
                      {product.SackPrice.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {product.SackPrice.length} types
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {product.perKiloPrice ? (
                      <span className="font-medium text-base">{totalKiloStock} kg</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow key={`${product.id}-expanded`} className="bg-muted/5 border-t-0">
                    <TableCell colSpan={4} className="p-0">
                      <div className="px-4 py-3 pl-16">
                        <div className="grid gap-6">
                          {/* Sack Types Section */}
                          {product.SackPrice.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-primary">Sack Types</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {product.SackPrice.map((sack) => (
                                  <div
                                    key={sack.id}
                                    className="bg-white rounded-md border p-3 flex justify-between items-center"
                                  >
                                    <div>
                                      <div className="font-medium">{parseProductType(sack.type)}</div>
                                      <div className="text-sm text-muted-foreground">
                                        ₱{sack.price.toFixed(2)} per sack
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold">{sack.stock}</div>
                                      <div className="text-xs text-muted-foreground">in stock</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Per Kilo Section */}
                          {product.perKiloPrice && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-primary">Per Kilo</h4>
                              <div className="bg-white rounded-md border p-3 flex justify-between items-center max-w-xs">
                                <div>
                                  <div className="font-medium">{parseProductType("PER_KILO")}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ₱{product.perKiloPrice.price.toFixed(2)} per kg
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">{product.perKiloPrice.stock} kg</div>
                                  <div className="text-xs text-muted-foreground">in stock</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
