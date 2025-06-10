"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette, X } from "lucide-react";
import { useKahon } from "@/context/KahonContext";
import { useInventory } from "@/context/InventoryContext";
import { toast } from "sonner";

const predefinedColors = [
  { name: "White", value: "#ffffff" },
  { name: "Light Yellow", value: "#fffacd" },
  { name: "Light Blue", value: "#e6f3ff" },
  { name: "Light Green", value: "#e6ffe6" },
  { name: "Light Pink", value: "#ffe6f3" },
  { name: "Light Orange", value: "#ffe6cc" },
  { name: "Light Purple", value: "#f3e6ff" },
  { name: "Light Gray", value: "#f0f0f0" },
  { name: "Yellow", value: "#ffff99" },
  { name: "Blue", value: "#99ccff" },
  { name: "Green", value: "#99ff99" },
  { name: "Pink", value: "#ff99cc" },
  { name: "Orange", value: "#ffcc99" },
  { name: "Purple", value: "#cc99ff" },
  { name: "Gray", value: "#cccccc" },
  { name: "Red", value: "#ff9999" },
];

interface CellColorPickerProps {
  mode?: "kahon" | "inventory";
}

interface SelectedCellInfo {
  cellId: string;
  col: number;
  row: number;
  element: HTMLElement;
}

export function CellColorPicker({ mode = "kahon" }: CellColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState("#ffffff");
  const [selectedCells, setSelectedCells] = useState<SelectedCellInfo[]>([]);
  const kahonContext = useKahon();
  const inventoryContext = useInventory();
  const context = mode === "kahon" ? kahonContext : inventoryContext;

  // Real-time selection monitoring
  useEffect(() => {
    if (!open) return;

    const updateSelection = () => {
      const cells = captureSelectedCells();
      setSelectedCells(cells);
    };

    // Monitor for selection changes
    const interval = setInterval(updateSelection, 100);

    // Initial capture
    updateSelection();

    return () => clearInterval(interval);
  }, [open]);

  const captureSelectedCells = (): SelectedCellInfo[] => {
    const selectedElements = document.querySelectorAll(".jexcel_selected");
    const cells: SelectedCellInfo[] = [];

    for (const element of selectedElements) {
      const cellElement = element as HTMLElement;
      const col = parseInt(cellElement.getAttribute("data-x") || "0");
      const row = parseInt(cellElement.getAttribute("data-y") || "0");
      const cellId = cellElement.getAttribute("id");

      if (cellId) {
        cells.push({ cellId, col, row, element: cellElement });
      }
    }

    return cells;
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      // Immediate capture when opening
      const cells = captureSelectedCells();
      setSelectedCells(cells);
    } else {
      // Clear when closing
      setSelectedCells([]);
    }
  };
  const applyColor = async (color: string) => {
    if (!context.selectedSheet) {
      toast.error("No sheet selected");
      return;
    }

    if (selectedCells.length === 0) {
      toast.error("No cells selected");
      return;
    }

    try {
      // For now, we'll use a placeholder value and let the backend handle it properly
      // The actual implementations in KahonSheets and InventorySheets get the real values from sheetData
      const cellUpdates = selectedCells.map(({ cellId }) => ({
        id: cellId,
        value: "", // Placeholder - backend should preserve existing values
        color: color,
      }));

      await context.updateCells({
        cells: cellUpdates,
      });

      // Apply color immediately to selected cells
      selectedCells.forEach(({ element }) => {
        if (element) {
          element.style.setProperty("--cell-bg-color", color);
          element.setAttribute("data-cell-color", color);
        }
      });

      toast.success(`Applied color to ${selectedCells.length} cell(s)`);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to apply color");
      console.error("Color application error:", error);
    }
  };
  const removeColor = async () => {
    if (!context.selectedSheet) {
      toast.error("No sheet selected");
      return;
    }

    if (selectedCells.length === 0) {
      toast.error("No cells selected");
      return;
    }

    try {
      // For now, we'll use a placeholder value and let the backend handle it properly
      // The actual implementations in KahonSheets and InventorySheets get the real values from sheetData
      const cellUpdates = selectedCells.map(({ cellId }) => ({
        id: cellId,
        value: "", // Placeholder - backend should preserve existing values
        color: undefined,
      }));

      await context.updateCells({
        cells: cellUpdates,
      });

      // Remove color immediately from selected cells
      selectedCells.forEach(({ element }) => {
        if (element) {
          element.style.removeProperty("--cell-bg-color");
          element.removeAttribute("data-cell-color");
        }
      });

      toast.success(`Removed color from ${selectedCells.length} cell(s)`);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to remove color");
      console.error("Color removal error:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Cell Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Cell Colors</h4>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {selectedCells.length > 0 ? (
          <div className="mb-4 p-2 text-xs text-muted-foreground bg-gray-50 rounded">
            Selected {selectedCells.length} cell(s):{" "}
            {selectedCells
              .map(
                (cell) => `${String.fromCharCode(65 + cell.col)}${cell.row + 1}`
              )
              .join(", ")}
          </div>
        ) : (
          <div className="mb-4 p-2 text-xs text-amber-600 bg-amber-50 rounded">
            Please select one or more cells in the spreadsheet first
          </div>
        )}

        {/* Predefined Colors */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {predefinedColors.map((color) => (
            <button
              key={color.value}
              onClick={() => applyColor(color.value)}
              disabled={context.loadingOperations || selectedCells.length === 0}
              className="w-12 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        {/* Custom Color */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-12 h-8 rounded border cursor-pointer"
            />
            <Button
              size="sm"
              onClick={() => applyColor(customColor)}
              disabled={context.loadingOperations || selectedCells.length === 0}
              className="flex-1"
            >
              Apply Custom Color
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={removeColor}
            disabled={context.loadingOperations || selectedCells.length === 0}
            className="w-full"
          >
            Remove Color
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
