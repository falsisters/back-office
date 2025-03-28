"use client"

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type";
import EditProduct from "./EditProduct";

interface ItemTableProps {
  products: ProductResponse[];
  onProductUpdate: () => void;
}

const ItemTable: React.FC<ItemTableProps> = ({ products, onProductUpdate }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Sack Prices</TableHead>
          <TableHead>Per Kilo Price</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>
              {product.SackPrice && product.SackPrice.length > 0
                ? product.SackPrice.map((sackPrice) => (
                    <div key={sackPrice.id}>
                      {sackPrice.type}: ₱{sackPrice.price.toFixed(2)} (Stock:{" "}
                      {sackPrice.stock})
                    </div>
                  ))
                : "No sack prices"}
            </TableCell>
            <TableCell>
              {product.perKiloPrice &&
              Array.isArray(product.perKiloPrice) &&
              product.perKiloPrice.length > 0
                ? product.perKiloPrice.map((kiloPrice) => (
                    <div key={kiloPrice.id}>
                      ₱{kiloPrice.price.toFixed(2)} (Stock: {kiloPrice.stock})
                    </div>
                  ))
                : "No kilo prices"}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center">
                <EditProduct 
                  productId={product.id} 
                  onProductUpdated={onProductUpdate} 
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ItemTable;