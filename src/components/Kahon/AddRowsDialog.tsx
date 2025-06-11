"use client";

import { useState } from "react";

interface AddRowsDialogProps {
  isOpen: boolean;
  maxRowIndex: number;
  onAddRows: (count: number, startIndex?: number) => void;
  onClose: () => void;
}

export default function AddRowsDialog({
  isOpen,
  maxRowIndex,
  onAddRows,
  onClose,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Multiple Rows</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
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
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Rows
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
