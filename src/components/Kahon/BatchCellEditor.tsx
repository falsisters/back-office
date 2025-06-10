"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useKahon } from "@/context/KahonContext";
import { useInventory } from "@/context/InventoryContext";

interface BatchCellEditorProps {
  mode: "kahon" | "inventory";
}

export function BatchCellEditor({ mode }: BatchCellEditorProps) {
  const kahonContext = useKahon();
  const inventoryContext = useInventory();
  const context = mode === "kahon" ? kahonContext : inventoryContext;
  const [open, setOpen] = useState(false);
  const [cellData, setCellData] = useState("");

  const handleSubmit = async () => {
    try {
      // Parse cell data (format: cellId,value,formula?,color?;)
      const cells = cellData
        .split(";")
        .map((line) => {
          const [id, value, formula, color] = line.split(",");
          const cellUpdate: any = { id, value };

          if (formula && formula.trim()) {
            cellUpdate.formula = formula.trim();
          }

          if (color && color.trim() && color.startsWith("#")) {
            cellUpdate.color = color.trim();
          }

          return cellUpdate;
        })
        .filter(
          (cell) => cell.id && (cell.value || cell.formula || cell.color)
        );

      if (cells.length > 0) {
        await context.updateCells({ cells });
        setOpen(false);
        setCellData("");
      }
    } catch (error) {
      console.error("Invalid cell data format", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Batch Edit Cells
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Batch Cell Editor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cell Data (format: id,value,formula?,color?;)</Label>
            <Textarea
              value={cellData}
              onChange={(e) => setCellData(e.target.value)}
              rows={10}
              placeholder="cell-id-1,New Value,=A1+B1,#fffacd;cell-id-2,Another Value,,#e6f3ff;"
              className="font-mono text-sm"
            />
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Format:</strong> cellId,value,formula,color;
            </p>
            <p>
              <strong>Examples:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>cell-123,100,,#fffacd; (set value and color)</li>
              <li>cell-456,,=A1*B1,; (set formula only)</li>
              <li>cell-789,Text,=SUM(A1:A5),#e6f3ff; (set all)</li>
            </ul>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!cellData.trim()}
            className="w-full"
          >
            Update Cells
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
