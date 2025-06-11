"use client";

import { useState } from "react";

interface CellEditorProps {
  isOpen: boolean;
  currentColor?: string;
  currentValue?: string;
  currentFormula?: string;
  cellPosition: { row: number; column: string; columnIndex: number };
  onColorChange: (color: string) => void;
  onFormulaApply: (formula: string) => void;
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

const quickFormulas = [
  {
    name: "Sum all above",
    formula: (pos: any) =>
      pos.row <= 1 ? "0" : `=SUM(${pos.column}1:${pos.column}${pos.row - 1})`,
  },
  {
    name: "Sum 2 above",
    formula: (pos: any) =>
      pos.row <= 2
        ? "0"
        : `=SUM(${pos.column}${Math.max(1, pos.row - 2)}:${pos.column}${
            pos.row - 1
          })`,
  },
  {
    name: "Multiply Quantity×Name",
    formula: (pos: any) => `=Quantity${pos.row}*Name${pos.row}`,
  },
];

export default function CellEditor({
  isOpen,
  currentColor = "#ffffff",
  currentValue = "",
  currentFormula = "",
  cellPosition,
  onColorChange,
  onFormulaApply,
  onClose,
}: CellEditorProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [activeTab, setActiveTab] = useState<"color" | "formula">("color");
  const [customFormula, setCustomFormula] = useState(currentFormula || "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Edit Cell {cellPosition.column}
            {cellPosition.row}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
                  : "border-transparent text-gray-500"
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => setActiveTab("formula")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "formula"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500"
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
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Preset Colors:</p>
              <div className="grid grid-cols-6 gap-1">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      selectedColor === color
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => onColorChange(selectedColor)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply Color
              </button>
              <button
                onClick={() => onColorChange("")}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Formula Tab */}
        {activeTab === "formula" && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-600 mb-1">Current Value:</p>
              <p className="font-mono text-sm">{currentValue || "Empty"}</p>
              {currentFormula && (
                <>
                  <p className="text-sm text-gray-600 mb-1 mt-2">
                    Current Formula:
                  </p>
                  <p className="font-mono text-sm text-blue-600">
                    {currentFormula}
                  </p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Formula:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="=SUM(A1:A5) or =Quantity1*Name1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => onFormulaApply(customFormula)}
                  disabled={!customFormula.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Quick Formulas:</p>
              <div className="space-y-2">
                {quickFormulas.map((formula, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-sm">{formula.name}</h4>
                        <p className="text-xs font-mono text-blue-600 mt-1">
                          {formula.formula(cellPosition)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onFormulaApply(formula.formula(cellPosition))
                        }
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Apply
                      </button>
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
