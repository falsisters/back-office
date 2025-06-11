"use client";

import { useState } from "react";

interface CellEditorProps {
  isOpen: boolean;
  currentColor?: string;
  currentValue?: string;
  currentFormula?: string;
  cellPosition: { row: number; column: string; columnIndex: number };
  sheetType?: "kahon" | "inventory"; // Add sheet type to distinguish formulas
  onColorChange: (color: string) => void;
  onFormulaApply: (formula: string) => void;
  onFormulaApplyToColumn?: (formula: string, columnIndex: number) => void; // New prop for column-wide application
  onClose: () => void;
}

const presetColors = [
  "#ffffff",
  "#f8f9fa",
  "#e9ecef",
  "#dee2e6",
  "#ced4da",
  "#adb5bd",
  "#6c757d",
  "#495057",
  "#343a40",
  "#212529",
  "#000000",
  "#fff3cd",
  "#ffeaa7",
  "#fdcb6e",
  "#e17055",
  "#d63031",
  "#fd79a8",
  "#e84393",
  "#a29bfe",
  "#6c5ce7",
  "#2d3436",
  "#00b894",
  "#00cec9",
  "#0984e3",
  "#74b9ff",
  "#55a3ff",
];

interface QuickFormula {
  name: string;
  description: string;
  formula: (position: {
    row: number;
    column: string;
    columnIndex: number;
  }) => string;
  isColumnFormula?: boolean; // Whether this formula should be applied to entire column
}

// Kahon formulas (with Quantity and Name columns)
const kahonFormulas: QuickFormula[] = [
  {
    name: "Add all vertical cells",
    description: "Sum of all cells above it",
    formula: ({ row, column }) => {
      if (row <= 1) return "0";
      let formula = `=${column}1`;
      for (let i = 2; i < row; i++) {
        formula += ` + ${column}${i}`;
      }
      return formula;
    },
  },
  {
    name: "Add vertical cells",
    description: "Sum of the next 2 cells above it",
    formula: ({ row, column }) => {
      if (row <= 2) return "0";
      const start = Math.max(1, row - 2);
      if (start === row - 1) {
        return `=${column}${start}`;
      }
      return `=${column}${start} + ${column}${row - 1}`;
    },
  },
  {
    name: "Apply multiply to all rows",
    description:
      "Multiply the two columns to the left for all rows with valid numeric data",
    formula: ({ row, column, columnIndex }) => {
      if (columnIndex < 2) return "0"; // Need at least 2 columns to the left

      const firstColumnIndex = columnIndex - 2;
      const secondColumnIndex = columnIndex - 1;

      let firstColumn, secondColumn;

      if (firstColumnIndex === 0) firstColumn = "Quantity";
      else if (firstColumnIndex === 1) firstColumn = "Name";
      else firstColumn = String.fromCharCode(65 + firstColumnIndex - 2);

      if (secondColumnIndex === 0) secondColumn = "Quantity";
      else if (secondColumnIndex === 1) secondColumn = "Name";
      else secondColumn = String.fromCharCode(65 + secondColumnIndex - 2);

      return `=${firstColumn}${row} * ${secondColumn}${row}`;
    },
    isColumnFormula: true,
  },
  {
    name: "Subtract vertical cells",
    description: "Subtract the next 2 cells above it",
    formula: ({ row, column }) => {
      if (row <= 2) return "0";
      return `=${column}${row - 2} - ${column}${row - 1}`;
    },
  },
  {
    name: "Apply addition to all rows",
    description: "Add all cells to the left for all rows",
    formula: ({ row, column, columnIndex }) => {
      if (columnIndex === 0) return "0";

      let formula = "=Quantity" + row;
      if (columnIndex > 1) formula += " + Name" + row;

      // Add A, B, C... columns up to current column (excluding current)
      for (let i = 0; i < columnIndex - 2; i++) {
        formula += ` + ${String.fromCharCode(65 + i)}${row}`;
      }

      return formula;
    },
    isColumnFormula: true,
  },
  {
    name: "Multiply left cells",
    description: "Multiply the next 2 cells to the left",
    formula: ({ row, column, columnIndex }) => {
      if (columnIndex === 0) return "0";
      if (columnIndex === 1) return `=Quantity${row} * Name${row}`;
      if (columnIndex === 2) return `=Quantity${row} * Name${row}`;

      // Get the two columns to the left
      const col1 =
        columnIndex === 3 ? "Name" : String.fromCharCode(65 + columnIndex - 4);
      const col2 = String.fromCharCode(65 + columnIndex - 3);

      return `=${col1}${row} * ${col2}${row}`;
    },
  },
  {
    name: "Subtract all vertical cells",
    description: "Subtract all cells above it sequentially",
    formula: ({ row, column }) => {
      if (row <= 1) return "0";
      let formula = `=${column}1`;
      for (let i = 2; i < row; i++) {
        formula += ` - ${column}${i}`;
      }
      return formula;
    },
  },
];

// Inventory formulas (only A-O columns)
const inventoryFormulas: QuickFormula[] = [
  {
    name: "Add all vertical cells",
    description: "Sum of all cells above it",
    formula: ({ row, column }) => {
      if (row <= 1) return "0";
      let formula = `=${column}1`;
      for (let i = 2; i < row; i++) {
        formula += ` + ${column}${i}`;
      }
      return formula;
    },
  },
  {
    name: "Add vertical cells",
    description: "Sum of the next 2 cells above it",
    formula: ({ row, column }) => {
      if (row <= 2) return "0";
      const start = Math.max(1, row - 2);
      if (start === row - 1) {
        return `=${column}${start}`;
      }
      return `=${column}${start} + ${column}${row - 1}`;
    },
  },
  {
    name: "Apply multiply to all rows",
    description:
      "Multiply the two columns to the left for all rows with valid numeric data",
    formula: ({ row, column, columnIndex }) => {
      if (columnIndex < 2) return "0"; // Need at least 2 columns to the left (C column minimum)

      const firstColumn = String.fromCharCode(65 + columnIndex - 2);
      const secondColumn = String.fromCharCode(65 + columnIndex - 1);

      return `=${firstColumn}${row} * ${secondColumn}${row}`;
    },
    isColumnFormula: true,
  },
  {
    name: "Subtract vertical cells",
    description: "Subtract the next 2 cells above it",
    formula: ({ row, column }) => {
      if (row <= 2) return "0";
      return `=${column}${row - 2} - ${column}${row - 1}`;
    },
  },
  {
    name: "Apply addition to all rows",
    description: "Add all cells to the left for all rows",
    formula: ({ row, column, columnIndex }) => {
      if (columnIndex === 0) return "0";

      let formula = "=A" + row;

      // Add B, C, D... columns up to current column (excluding current)
      for (let i = 1; i < columnIndex; i++) {
        formula += ` + ${String.fromCharCode(65 + i)}${row}`;
      }

      return formula;
    },
    isColumnFormula: true,
  },
  {
    name: "Multiply left cells",
    description: "Multiply the next 2 cells to the left",
    formula: ({ row, column, columnIndex }) => {
      if (columnIndex < 2) return "0";

      const col1 = String.fromCharCode(65 + columnIndex - 2);
      const col2 = String.fromCharCode(65 + columnIndex - 1);

      return `=${col1}${row} * ${col2}${row}`;
    },
  },
  {
    name: "Subtract all vertical cells",
    description: "Subtract all cells above it sequentially",
    formula: ({ row, column }) => {
      if (row <= 1) return "0";
      let formula = `=${column}1`;
      for (let i = 2; i < row; i++) {
        formula += ` - ${column}${i}`;
      }
      return formula;
    },
  },
];

export default function ColorPicker({
  isOpen,
  currentColor = "#ffffff",
  currentValue = "",
  currentFormula = "",
  cellPosition,
  sheetType = "kahon",
  onColorChange,
  onFormulaApply,
  onFormulaApplyToColumn,
  onClose,
}: CellEditorProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [activeTab, setActiveTab] = useState<"color" | "formula">("color");
  const [customFormula, setCustomFormula] = useState(currentFormula || "");

  if (!isOpen) return null;

  // Use appropriate formulas based on sheet type
  const quickFormulas =
    sheetType === "inventory" ? inventoryFormulas : kahonFormulas;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
  };

  const handleColorSave = () => {
    onColorChange(selectedColor);
  };

  const handleColorRemove = () => {
    onColorChange("");
  };

  const handleFormulaApply = (formula: QuickFormula) => {
    const generatedFormula = formula.formula(cellPosition);
    onFormulaApply(generatedFormula);
  };

  const handleCustomFormulaApply = () => {
    if (customFormula.trim()) {
      onFormulaApply(customFormula.trim());
    }
  };

  const handleApplyToColumn = (formula: QuickFormula) => {
    if (onFormulaApplyToColumn && formula.isColumnFormula) {
      const baseFormula = formula.formula(cellPosition);
      onFormulaApplyToColumn(baseFormula, cellPosition.columnIndex);
    } else {
      // Fallback to single cell application
      const generatedFormula = formula.formula(cellPosition);
      onFormulaApply(generatedFormula);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Cell Editor - {cellPosition.column}
            {cellPosition.row}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab("color")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "color"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => setActiveTab("formula")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "formula"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Formulas
            </button>
          </nav>
        </div>

        {/* Color Tab */}
        {activeTab === "color" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Color:</label>
              <input
                type="color"
                value={selectedColor}
                onChange={handleColorInputChange}
                className="w-full h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Preset Colors:</p>
              <div className="grid grid-cols-6 gap-1">
                {presetColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      selectedColor === color
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm">Selected:</span>
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-sm font-mono">{selectedColor}</span>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleColorSave}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply Color
              </button>
              <button
                onClick={handleColorRemove}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Remove Color
              </button>
            </div>
          </div>
        )}

        {/* Formula Tab */}
        {activeTab === "formula" && (
          <div className="space-y-4">
            {/* Current Value/Formula Display */}
            <div className="bg-gray-50 p-3 rounded border space-y-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Value:</p>
                <p className="font-mono text-sm">{currentValue || "Empty"}</p>
              </div>
              {currentFormula && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Formula:</p>
                  <p className="font-mono text-sm text-blue-600">
                    {currentFormula}
                  </p>
                </div>
              )}
            </div>

            {/* Custom Formula Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Formula:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder={
                    sheetType === "inventory"
                      ? "=A1+A2 or =A1*B1"
                      : "=Quantity1*Name1 or =A1+B1"
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCustomFormulaApply}
                  disabled={!customFormula.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Quick Formulas */}
            <div>
              <p className="text-sm font-medium mb-3">
                Quick Formulas (
                {sheetType === "inventory" ? "Inventory" : "Kahon"} Sheet):
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {quickFormulas.map((formula, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-2">
                        <h4 className="font-medium text-sm text-gray-900">
                          {formula.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {formula.description}
                        </p>
                        <p className="text-xs font-mono text-blue-600 mt-1 break-all">
                          Preview: {formula.formula(cellPosition)}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleFormulaApply(formula)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Apply
                        </button>
                        {formula.isColumnFormula && onFormulaApplyToColumn && (
                          <button
                            onClick={() => handleApplyToColumn(formula)}
                            className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                            title="Apply to entire column with valid data"
                          >
                            Column
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
