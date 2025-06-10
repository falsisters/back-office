// src/components/Kahon/AddItemRowModal.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useKahon } from "@/context/KahonContext";
import { useInventory } from "@/context/InventoryContext";

interface AddItemRowModalProps {
  mode: "kahon" | "inventory";
}

export function AddItemRowModal({ mode }: AddItemRowModalProps) {
  const kahonContext = useKahon();
  const inventoryContext = useInventory();
  const [itemId, setItemId] = useState("");
  const [rowIndex, setRowIndex] = useState<number | "">("");
  const [open, setOpen] = useState(false);

  const context = mode === "kahon" ? kahonContext : inventoryContext;
  const itemLabel = mode === "kahon" ? "Kahon Item ID" : "Inventory Item ID";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.selectedSheet || !itemId || rowIndex === "") return;

    try {
      if (mode === "kahon") {
        await kahonContext.addItemRow({
          sheetId: context.selectedSheet,
          kahonItemId: itemId,
          rowIndex: Number(rowIndex),
        });
      } else {
        await inventoryContext.addItemRow({
          sheetId: context.selectedSheet,
          inventoryItemId: itemId,
          rowIndex: Number(rowIndex),
        });
      }

      setOpen(false);
      setItemId("");
      setRowIndex("");
    } catch (error) {
      console.error("Failed to add item row:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Add Item Row
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add New {mode === "kahon" ? "Kahon" : "Inventory"} Item Row
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="itemId">{itemLabel}</Label>
            <Input
              id="itemId"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="rowIndex">Row Index</Label>
            <Input
              id="rowIndex"
              type="number"
              value={rowIndex}
              onChange={(e) => setRowIndex(Number(e.target.value) || "")}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={context.loadingOperations}
            className="w-full"
          >
            {context.loadingOperations ? "Adding..." : "Add Row"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
