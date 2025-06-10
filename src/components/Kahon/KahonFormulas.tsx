// src/components/Kahon/KahonFormulas.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X } from "lucide-react";
import { useKahon } from "@/context/KahonContext";
import { useInventory } from "@/context/InventoryContext";
import { toast } from "sonner";
import { getCellReference } from "@/utils/formulaUtils";

interface KahonFormulasProps {
  mode?: "kahon" | "inventory";
}

interface SelectedCellInfo {
  col: number;
  row: number;
  cellId: string;
  element: HTMLElement;
}

export function KahonFormulas({ mode = "kahon" }: KahonFormulasProps) {
  const [open, setOpen] = useState(false);
  const [selectedCellInfo, setSelectedCellInfo] =
    useState<SelectedCellInfo | null>(null);
  const kahonContext = useKahon();
  const inventoryContext = useInventory();
  const context = mode === "kahon" ? kahonContext : inventoryContext;

  const captureSelectedCellInfo = (): SelectedCellInfo | null => {
    const selected = document.querySelector(".jexcel_selected");
    if (!selected) return null;

    const col = parseInt(selected.getAttribute("data-x") || "0");
    const row = parseInt(selected.getAttribute("data-y") || "0");

    // Get the cell ID from the sheet data structure
    const cellElement = selected.closest("td") as HTMLElement;
    const cellId = cellElement?.getAttribute("id");

    if (!cellId || !cellElement) return null;

    return { col, row, cellId, element: cellElement };
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      // Capture selected cell info when opening
      const cellInfo = captureSelectedCellInfo();
      if (cellInfo) {
        setSelectedCellInfo(cellInfo);
        // Keep the cell visually selected
        cellInfo.element.classList.add("jexcel_selected");
      } else {
        // Set to null but still allow popover to open to show the message
        setSelectedCellInfo(null);
      }
    } else {
      // Clear stored info when closing
      setSelectedCellInfo(null);
    }
  };

  const applyFormula = async (formulaType: string) => {
    if (!context.selectedSheet) {
      toast.error("No sheet selected");
      return;
    }

    if (!selectedCellInfo) {
      toast.error("No cell selected");
      return;
    }

    try {
      const { col, row, cellId } = selectedCellInfo;
      let formula = "";
      let description = "";
      const maxCols = 5;

      switch (formulaType) {
        case "add-all-vertical":
          if (row === 0) {
            toast.error("No cells above to sum");
            return;
          }
          const allCellsAbove = Array.from({ length: row }, (_, i) =>
            getCellReference(col, i)
          ).join("+");
          formula = `=${allCellsAbove}`;
          description = "Sum of all cells above";
          break;

        case "add-vertical":
          if (row < 2) {
            toast.error("Need at least 2 cells above");
            return;
          }
          const twoAbove = [
            getCellReference(col, row - 2),
            getCellReference(col, row - 1),
          ].join("+");
          formula = `=${twoAbove}`;
          description = "Sum of next two cells above";
          break;

        case "multiply-all-rows":
          const rowCells = [];
          for (let c = 2; c < maxCols; c++) {
            if (c !== col) {
              rowCells.push(getCellReference(c, row));
            }
          }
          if (rowCells.length === 0) {
            toast.error("No valid cells to multiply in this row");
            return;
          }
          formula = `=${rowCells.join("*")}`;
          description = "Multiply all row cells (excluding A and B)";
          break;

        case "subtract-vertical":
          if (row < 2) {
            toast.error("Need at least 2 cells above");
            return;
          }
          formula = `=${getCellReference(col, row - 2)}-${getCellReference(
            col,
            row - 1
          )}`;
          description = "Subtract next two cells above";
          break;

        case "add-all-rows":
          const addRowCells = [];
          for (let c = 2; c < maxCols; c++) {
            if (c !== col) {
              addRowCells.push(getCellReference(c, row));
            }
          }
          if (addRowCells.length === 0) {
            toast.error("No valid cells to add in this row");
            return;
          }
          formula = `=${addRowCells.join("+")}`;
          description = "Add all row cells (excluding A and B)";
          break;

        case "multiply-left":
          if (col < 2) {
            toast.error("Need at least 2 cells to the left");
            return;
          }
          const twoLeft = [
            getCellReference(col - 2, row),
            getCellReference(col - 1, row),
          ].join("*");
          formula = `=${twoLeft}`;
          description = "Multiply next two cells to the left";
          break;

        default:
          return;
      }

      await context.updateCells({
        cells: [
          {
            id: cellId,
            value: "",
            formula: formula,
          },
        ],
      });

      // Restore cell selection after formula application
      setTimeout(() => {
        if (selectedCellInfo?.element) {
          selectedCellInfo.element.classList.add("jexcel_selected");
          selectedCellInfo.element.focus();
        }
      }, 100);

      toast.success(`Applied ${description}`);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to apply formula");
      console.error("Formula error:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Formulas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="flex justify-between items-center p-2 border-b">
          <h4 className="font-medium">Quick Formulas</h4>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {selectedCellInfo ? (
          <div className="p-2 text-xs text-muted-foreground border-b">
            Selected:{" "}
            {getCellReference(selectedCellInfo.col, selectedCellInfo.row)}
          </div>
        ) : (
          <div className="p-2 text-xs text-amber-600 bg-amber-50 border-b rounded-sm">
            Please select a cell in the spreadsheet first
          </div>
        )}

        <div className="space-y-1 mt-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => applyFormula("add-all-vertical")}
            disabled={context.loadingOperations || !selectedCellInfo}
          >
            Add All Vertical Cells
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => applyFormula("add-vertical")}
            disabled={context.loadingOperations || !selectedCellInfo}
          >
            Add Vertical Cells
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => applyFormula("multiply-all-rows")}
            disabled={context.loadingOperations || !selectedCellInfo}
          >
            Apply Multiply to All Rows
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => applyFormula("subtract-vertical")}
            disabled={context.loadingOperations || !selectedCellInfo}
          >
            Subtract Vertical Cells
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => applyFormula("add-all-rows")}
            disabled={context.loadingOperations || !selectedCellInfo}
          >
            Apply Addition to All Rows
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => applyFormula("multiply-left")}
            disabled={context.loadingOperations || !selectedCellInfo}
          >
            Multiply Left Cells
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
