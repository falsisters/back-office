"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AddRowsDialogProps {
  isOpen: boolean;
  maxRowIndex: number;
  onAddRows: (count: number, startIndex?: number) => void;
  onClose: () => void;
  sheetType?: "kahon" | "inventory"; // Add sheet type prop
}

export default function AddRowsDialog({
  isOpen,
  maxRowIndex,
  onAddRows,
  onClose,
  sheetType = "kahon", // Default to kahon for backward compatibility
}: AddRowsDialogProps) {
  const [rowCount, setRowCount] = useState(1);
  const [insertPosition, setInsertPosition] = useState<"end" | "after">("end");
  const [afterRowIndex, setAfterRowIndex] = useState(maxRowIndex);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rowCount < 1 || rowCount > 100) {
      alert("Please enter a number between 1 and 100");
      return;
    }

    let startIndex: number;

    if (insertPosition === "end") {
      startIndex = maxRowIndex + 1;
    } else {
      startIndex = afterRowIndex + 1;
    }

    onAddRows(rowCount, startIndex);
  };

  const handleClose = () => {
    setRowCount(1);
    setInsertPosition("end");
    setAfterRowIndex(maxRowIndex);
    onClose();
  };

  const getSheetTypeLabel = () => {
    return sheetType === "inventory" ? "Inventory" : "Kahon";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Add Multiple Rows - {getSheetTypeLabel()}
          </h3>
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-black text-black hover:bg-gray-100"
            size="sm"
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Number of rows */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of rows to add:
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={rowCount}
              onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maximum: 100 rows</p>
          </div>

          {/* Insert position */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Insert position:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="position"
                  value="end"
                  checked={insertPosition === "end"}
                  onChange={(e) => setInsertPosition(e.target.value as "end")}
                  className="mr-2"
                />
                At the end (after row {maxRowIndex})
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="position"
                  value="after"
                  checked={insertPosition === "after"}
                  onChange={(e) => setInsertPosition(e.target.value as "after")}
                  className="mr-2"
                />
                After specific row:
                <input
                  type="number"
                  min="0"
                  max={maxRowIndex}
                  value={afterRowIndex}
                  onChange={(e) =>
                    setAfterRowIndex(parseInt(e.target.value) || 0)
                  }
                  disabled={insertPosition !== "after"}
                  className="ml-2 w-20 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                />
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> Will add {rowCount} row
              {rowCount > 1 ? "s" : ""}
              {insertPosition === "end"
                ? ` at the end (rows ${maxRowIndex + 1}-${
                    maxRowIndex + rowCount
                  })`
                : ` after row ${afterRowIndex} (rows ${afterRowIndex + 1}-${
                    afterRowIndex + rowCount
                  })`}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Add Rows
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="border-black text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
