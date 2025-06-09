// src/components/Kahon/KahonFormulas.tsx
"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X } from "lucide-react";
import { useKahon } from "@/context/KahonContext";
import { useToast } from "@/hooks/use-toast";

export function KahonFormulas() {
  const [open, setOpen] = useState(false);
  const { selectedSheet, updateCells, loadingOperations } = useKahon();
  const toast = useToast();

  const getSelectedCellInfo = () => {
    const selected = document.querySelector('.jexcel_selected');
    if (!selected) return null;

    const col = selected.getAttribute('data-x');
    const row = selected.getAttribute('data-y');

    // Get the cell ID from the sheet data structure
    const cellElement = selected.closest('td');
    const cellId = cellElement?.getAttribute('id');

    return { col, row, cellId };
  };

  const applyFormula = async (formulaType: string) => {
    if (!selectedSheet) {
      toast.toast({
        title: "No sheet selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const cellInfo = getSelectedCellInfo();
      if (!cellInfo?.col || !cellInfo?.row || !cellInfo?.cellId) {
        toast.toast({
          title: "Please select a cell first",
          variant: "destructive",
        });
        return;
      }

      const col = parseInt(cellInfo.col);
      const row = parseInt(cellInfo.row);

      let formula = "";
      let description = "";

      switch (formulaType) {
        case "add-vertical":
          if (row === 0) {
            toast.toast({
              title: "No cells above to sum",
              variant: "destructive",
            });
            return;
          }
          const cellsAbove = Array.from({ length: row }, (_, i) => 
            `${String.fromCharCode(65 + col)}${i + 1}`
          ).join('+');
          formula = `=${cellsAbove}`;
          description = "Sum of cells above";
          break;

        case "subtract-vertical":
          if (row <= 0) {
            toast.toast({
              title: "No cells above to subtract",
              variant: "destructive",
            });
            return;
          }
          formula = `=${String.fromCharCode(65 + col)}${row}-${String.fromCharCode(65 + col)}${row + 1}`;
          description = "Subtraction of cells above";
          break;

        case "multiply-all":
          const rowCells = Array.from({ length: col + 1 }, (_, i) => 
            `${String.fromCharCode(65 + i)}${row + 1}`
          ).join('*');
          formula = `=${rowCells}`;
          description = "Product of all cells in row";
          break;

        case "sum-all-above":
          if (row === 0) {
            toast.toast({
              title: "No cells above to sum",
              variant: "destructive",
            });
            return;
          }
          const allAbove = Array.from({ length: row }, (_, r) =>
            Array.from({ length: col + 1 }, (_, c) => 
              `${String.fromCharCode(65 + c)}${r + 1}`
            ).join('+')
          ).join('+');
          formula = `=${allAbove}`;
          description = "Sum of all cells above";
          break;

        default:
          return;
      }

      await updateCells({
        cells: [{
          id: cellInfo.cellId,
          value: "",
          formula: formula,
        }]
      });

      toast.toast({
        title: `Applied ${description}`,
        variant: "default",
      });
      setOpen(false);
    } catch (error) {
      toast.toast({
        title: "Failed to apply formula",
        variant: "destructive",
      });
      console.error("Formula error:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Formulas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="flex justify-between items-center p-2 border-b">
          <h4 className="font-medium">Quick Formulas</h4>
          <button 
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1 mt-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => applyFormula("add-vertical")}
            disabled={loadingOperations}
          >
            Add Vertical Cells
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => applyFormula("subtract-vertical")}
            disabled={loadingOperations}
          >
            Subtract Vertical Cells
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => applyFormula("multiply-all")}
            disabled={loadingOperations}
          >
            Apply Multiply to All Rows
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => applyFormula("sum-all-above")}
            disabled={loadingOperations}
          >
            Sum All Cells Above
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}