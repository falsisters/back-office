"use client";

import React, { useState } from "react";
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

  const captureSelectedCells = (): SelectedCellInfo[] => {
    const selectedElements = document.querySelectorAll(".jexcel_selected");
    const cells: SelectedCellInfo[] = [];

    for (const cell of selectedElements) {
      const col = parseInt(cell.getAttribute("data-x") || "0");
      const row = parseInt(cell.getAttribute("data-y") || "0");
      const cellElement = cell.closest("td") as HTMLElement;
      const cellId = cellElement?.getAttribute("id");

      if (cellId && cellElement) {
        cells.push({ cellId, col, row, element: cellElement });
      }
    }

    return cells;
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    if (isOpen) {
      // Capture selected cells when opening
      const cells = captureSelectedCells();
      if (cells.length > 0) {
        setSelectedCells(cells);
        // Keep cells visually selected
        cells.forEach(({ element }) => {
          element.classList.add("jexcel_selected");
        });
      } else {
        // Set to empty array but still allow popover to open to show the message
        setSelectedCells([]);
      }
    } else {
      // Clear stored info when closing
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
      // Update cells with new color - include current value to satisfy type requirements
      const cellUpdates = selectedCells.map(({ cellId, element }) => ({
        id: cellId,
        value: element?.textContent || "", // Preserve current cell value
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

      // Restore cell selection after color application
      setTimeout(() => {
        selectedCells.forEach(({ element }) => {
          element.classList.add("jexcel_selected");
        });
      }, 100);

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
      // Remove color from cells - include current value to satisfy type requirements
      const cellUpdates = selectedCells.map(({ cellId, element }) => ({
        id: cellId,
        value: element?.textContent || "", // Preserve current cell value
        color: undefined, // Use undefined instead of null
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

      // Restore cell selection after color removal
      setTimeout(() => {
        selectedCells.forEach(({ element }) => {
          element.classList.add("jexcel_selected");
        });
      }, 100);

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
            Selected {selectedCells.length} cell(s)
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
