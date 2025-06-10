"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useKahon } from "@/context/KahonContext";
import { useInventory } from "@/context/InventoryContext";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calculator } from "lucide-react";

interface AddCalculationRowButtonProps {
  mode: "kahon" | "inventory";
}

export function AddCalculationRowButton({
  mode,
}: AddCalculationRowButtonProps) {
  const kahonContext = useKahon();
  const inventoryContext = useInventory();
  const [open, setOpen] = useState(false);
  const [rowIndex, setRowIndex] = useState<number | "">("");
  const [position, setPosition] = useState<"before" | "after" | "bottom">(
    "bottom"
  );
  const [numberOfRows, setNumberOfRows] = useState<number>(1);

  const context = mode === "kahon" ? kahonContext : inventoryContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.selectedSheet) return;

    try {
      if (position === "bottom") {
        // Add multiple rows at the bottom
        for (let i = 0; i < numberOfRows; i++) {
          if (mode === "kahon") {
            await kahonContext.addCalculationRow({
              sheetId: context.selectedSheet,
              rowIndex: -1, // Backend should handle adding to bottom
            });
          } else {
            // For inventory, we need inventoryId instead of sheetId
            await inventoryContext.addCalculationRow({
              inventoryId: context.selectedSheet, // Assuming selectedSheet is inventoryId for inventory mode
              rowIndex: -1,
            });
          }
        }
      } else {
        // Add single row before/after specified position
        if (rowIndex === "") return;

        const targetIndex =
          position === "before" ? Number(rowIndex) : Number(rowIndex) + 1;

        if (mode === "kahon") {
          await kahonContext.addCalculationRow({
            sheetId: context.selectedSheet,
            rowIndex: targetIndex,
          });
        } else {
          // For inventory, we need inventoryId instead of sheetId
          await inventoryContext.addCalculationRow({
            inventoryId: context.selectedSheet, // Assuming selectedSheet is inventoryId for inventory mode
            rowIndex: targetIndex,
          });
        }
      }

      setOpen(false);
      setRowIndex("");
      setPosition("bottom");
      setNumberOfRows(1);
    } catch (error) {
      console.error("Failed to add calculation row:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Calculator className="h-4 w-4" />
          Add Calculation Row
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Calculation Row(s)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="position">Position</Label>
            <Select
              value={position}
              onValueChange={(value: "before" | "after" | "bottom") =>
                setPosition(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before selected row</SelectItem>
                <SelectItem value="after">After selected row</SelectItem>
                <SelectItem value="bottom">At bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {position !== "bottom" && (
            <div>
              <Label htmlFor="rowIndex">Row Number</Label>
              <Input
                id="rowIndex"
                type="number"
                value={rowIndex}
                onChange={(e) => setRowIndex(Number(e.target.value) || "")}
                placeholder="Enter row number"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Row numbers start from 1
              </p>
            </div>
          )}

          {position === "bottom" && (
            <div>
              <Label htmlFor="numberOfRows">Number of Rows</Label>
              <Input
                id="numberOfRows"
                type="number"
                min="1"
                max="10"
                value={numberOfRows}
                onChange={(e) => setNumberOfRows(Number(e.target.value) || 1)}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={
              context.loadingOperations ||
              (position !== "bottom" && rowIndex === "")
            }
            className="w-full"
          >
            {context.loadingOperations
              ? "Adding..."
              : `Add ${position === "bottom" ? numberOfRows : 1} Row${
                  numberOfRows > 1 ? "s" : ""
                }`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
