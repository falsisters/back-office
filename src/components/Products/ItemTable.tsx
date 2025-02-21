"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EditProduct from "./EditProduct";
import type { Product, Price } from "../../../utils/types/schema.type";

interface ItemTableProps {
  items: (Product & { Price?: Price[] })[];
  onUpdateItem: (item: Product & { Price?: Price[] }) => void;
  onDeleteItem: (id: string) => void;
}

export function ItemTable({
  items,
  onUpdateItem,
  onDeleteItem,
}: ItemTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const formatPriceType = (type: string) => {
    switch (type) {
      case "FIFTY_KG":
        return "50 KG";
      case "TWENTY_FIVE_KG":
        return "25 KG";
      case "FIVE_KG":
        return "5 KG";
      case "PER_KILO":
        return "Per Kilo";
      case "GANTANG":
        return "Gantang";
      case "SPECIAL_PRICE":
        return "Special Price";
      default:
        return type;
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteItem(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Name</TableHead>
              <TableHead className="w-[45%]">Prices</TableHead>
              <TableHead className="w-[20%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {item.Price && item.Price.length > 0 ? (
                    <div className="space-y-1">
                      {item.Price.map((p) => (
                        <div key={p.id} className="text-sm">
                          {formatPriceType(p.type)}: Php{p.price.toFixed(2)}{" "}
                          (Stock: {p.stock})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No prices set
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <EditProduct
                      product={item}
                      onProductUpdated={onUpdateItem}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ItemTable;
