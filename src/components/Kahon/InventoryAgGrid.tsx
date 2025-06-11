"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  CellValueChangedEvent,
  CellClickedEvent,
  CellStyle,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type {
  InventorySheetWithData,
  AddCellType,
} from "../../../utils/types/kahon.type";
import { addInventoryCalculationRow } from "@/lib/server/manageInventoryRows";
import {
  addInventoryCell,
  updateInventoryCell,
} from "@/lib/server/manageCells";
import { getCellDisplayValue, isValidFormula } from "@/lib/utils/formulaParser";
import ColorPicker from "./ColorPicker";

interface InventoryAgGridProps {
  cashierId: string;
  sheetData?: InventorySheetWithData | null;
  onRefresh: () => void;
}

interface GridRow {
  id: string;
  rowIndex: number;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
  H: string;
  I: string;
  J: string;
  K: string;
  L: string;
  M: string;
  N: string;
  O: string;
}

export default function InventoryAgGrid({
  cashierId,
  sheetData,
  onRefresh,
}: InventoryAgGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gridData, setGridData] = useState<GridRow[]>([]);
  const [showCellEditor, setShowCellEditor] = useState(false);
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    cellId: string;
    rowIndex: number;
    field: string;
    currentColor?: string;
    currentValue?: string;
    currentFormula?: string;
  } | null>(null);

  // Prepare grid data from sheet data
  useEffect(() => {
    if (sheetData) {
      const data = prepareGridData(sheetData);
      setGridData(data);
    }
  }, [sheetData]);

  const prepareGridData = (data: InventorySheetWithData): GridRow[] => {
    const rows: GridRow[] = [];

    data.Rows.forEach((row) => {
      const gridRow: GridRow = {
        id: row.id,
        rowIndex: row.rowIndex,
        A: "",
        B: "",
        C: "",
        D: "",
        E: "",
        F: "",
        G: "",
        H: "",
        I: "",
        J: "",
        K: "",
        L: "",
        M: "",
        N: "",
        O: "",
      };

      // Map cells to columns with formula evaluation for inventory sheets
      row.Cells.forEach((cell) => {
        const columnName = String.fromCharCode(65 + cell.columnIndex);
        const displayValue = getCellDisplayValue(
          cell,
          data,
          row.rowIndex,
          cell.columnIndex,
          "inventory" // Pass inventory sheet type
        );

        if (columnName in gridRow) {
          (gridRow as any)[columnName] = displayValue;
        }
      });

      rows.push(gridRow);
    });

    return rows;
  };

  // Column definitions - 15 columns total (A-O)
  const columnDefs: ColDef[] = useMemo(() => {
    const getCellStyleFunction =
      (field: string) =>
      (params: any): CellStyle => {
        if (!params.data || !sheetData) return {};

        const existingRow = sheetData.Rows.find(
          (r: any) => r.rowIndex === params.data.rowIndex
        );
        const columnIndex = field.charCodeAt(0) - 65;
        const existingCell = existingRow?.Cells.find(
          (c: any) => c.columnIndex === columnIndex
        );

        let style: CellStyle = {};

        // Apply color styling
        if (existingCell?.color) {
          const rgb = hexToRgb(existingCell.color);
          const textColor = rgb
            ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 128
              ? "#000000"
              : "#ffffff"
            : "#000000";

          style.backgroundColor = existingCell.color;
          style.color = textColor;
        }

        // Add visual indication for formulas and errors
        if (existingCell?.formula) {
          if (existingCell.formula.startsWith("=")) {
            if (params.data[field] === "#ERROR") {
              style.backgroundColor = "#fee2e2"; // Light red for errors
              style.color = "#dc2626"; // Dark red text
            } else {
              style.fontStyle = "italic"; // Italic for formula cells
            }
          }
        }

        return style;
      };

    return [
      {
        field: "rowIndex",
        headerName: "#",
        width: 60,
        pinned: "left",
        editable: false,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          fontWeight: "bold",
        } as CellStyle,
      },
      ...[
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
      ].map((col) => ({
        field: col,
        headerName: col,
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction(col),
      })),
    ];
  }, [sheetData]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const handleCellValueChanged = async (event: CellValueChangedEvent) => {
    if (isLoading) return;

    const { data, colDef, newValue } = event;
    if (!data || !colDef?.field) return;

    setIsLoading(true);

    try {
      const rowIndex = data.rowIndex;
      const field = colDef.field;
      const columnIndex = field.charCodeAt(0) - 65;

      const existingRow = sheetData?.Rows.find((r) => r.rowIndex === rowIndex);
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      let cellValue = newValue || "";
      let formula = undefined;

      if (cellValue && cellValue.startsWith("=")) {
        // Validate formula before saving
        if (!isValidFormula(cellValue)) {
          alert("Invalid formula syntax");
          return;
        }
        formula = cellValue;
        cellValue = "0"; // Backend will calculate actual value
      }

      const cellData = {
        value: cellValue,
        formula: formula,
        color: existingCell?.color || undefined,
      };

      if (existingCell) {
        await updateInventoryCell(existingCell.id, cellData);
      } else if (existingRow) {
        await addInventoryCell({
          rowId: existingRow.id,
          columnIndex: columnIndex,
          ...cellData,
        });
      } else {
        await addInventoryCalculationRow({
          inventoryId: sheetData?.id,
          rowIndex: rowIndex,
        });
        onRefresh();
        return;
      }

      onRefresh();
    } catch (error) {
      console.error("Failed to update cell:", error);
      alert("Failed to update cell");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellClicked = (event: CellClickedEvent) => {
    const { data, colDef } = event;
    if (!data || !colDef?.field || colDef.field === "rowIndex") return;

    const field = colDef.field;
    const currentValue = data[field];

    const existingRow = sheetData?.Rows.find(
      (r) => r.rowIndex === data.rowIndex
    );
    const columnIndex = field.charCodeAt(0) - 65;
    const existingCell = existingRow?.Cells.find(
      (c) => c.columnIndex === columnIndex
    );

    setSelectedCellInfo({
      cellId: existingCell?.id || "",
      rowIndex: data.rowIndex,
      field: field,
      currentColor: existingCell?.color || undefined,
      currentValue: currentValue,
      currentFormula: existingCell?.formula || undefined,
    });
  };

  const handleEditCell = () => {
    if (!selectedCellInfo) {
      alert("Please select a cell first by clicking on it");
      return;
    }
    setShowCellEditor(true);
  };

  const addNewRow = async () => {
    if (isLoading || !sheetData) return;

    setIsLoading(true);

    try {
      const maxRow = Math.max(...sheetData.Rows.map((r) => r.rowIndex), 0);
      await addInventoryCalculationRow({
        inventoryId: sheetData.id,
        rowIndex: maxRow + 1,
      });
      onRefresh();
    } catch (error) {
      console.error("Failed to add row:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = async (color: string) => {
    if (!selectedCellInfo) return;

    setIsLoading(true);
    try {
      const existingRow = sheetData?.Rows.find(
        (r) => r.rowIndex === selectedCellInfo.rowIndex
      );
      const columnIndex = selectedCellInfo.field.charCodeAt(0) - 65;
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      if (existingCell) {
        await updateInventoryCell(existingCell.id, {
          value: existingCell.value || "",
          formula: existingCell.formula || undefined,
          color: color || undefined,
        });
      } else if (existingRow) {
        await addInventoryCell({
          rowId: existingRow.id,
          columnIndex: columnIndex,
          value: selectedCellInfo.currentValue || "",
          color: color || undefined,
        });
      }

      setShowCellEditor(false);
      onRefresh();
    } catch (error) {
      console.error("Failed to update cell color:", error);
      alert("Failed to update cell color");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormulaApply = async (formula: string) => {
    if (!selectedCellInfo) return;

    try {
      // Validate formula
      if (formula.startsWith("=") && !isValidFormula(formula)) {
        alert("Invalid formula syntax");
        return;
      }

      const existingRow = sheetData?.Rows.find(
        (r) => r.rowIndex === selectedCellInfo.rowIndex
      );
      const columnIndex = selectedCellInfo.field.charCodeAt(0) - 65;
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      const cellData = {
        value: formula.startsWith("=") ? "0" : formula,
        formula: formula.startsWith("=") ? formula : undefined,
        color: existingCell?.color || undefined,
      };

      if (existingCell) {
        await updateInventoryCell(existingCell.id, cellData);
      } else if (existingRow) {
        await addInventoryCell({
          rowId: existingRow.id,
          columnIndex: columnIndex,
          ...cellData,
        });
      }

      setShowCellEditor(false);
      setSelectedCellInfo(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to apply formula:", error);
      alert("Failed to apply formula");
    }
  };

  const handleFormulaApplyToColumn = async (
    baseFormula: string,
    columnIndex: number
  ) => {
    if (!selectedCellInfo || !sheetData) return;

    setIsLoading(true);
    try {
      let formulasApplied = 0;

      // Get all rows sorted by row index
      const sortedRows = [...sheetData.Rows].sort(
        (a, b) => a.rowIndex - b.rowIndex
      );

      for (const row of sortedRows) {
        // Check if we need to verify numeric values for multiplication formulas
        if (baseFormula.includes("*")) {
          // For multiplication, check if the two left columns have valid numeric data
          if (columnIndex < 2) continue; // Need at least 2 columns to the left (C column minimum)

          const firstColumnIndex = columnIndex - 2;
          const secondColumnIndex = columnIndex - 1;

          const firstCell = row.Cells.find(
            (c) => c.columnIndex === firstColumnIndex
          );
          const secondCell = row.Cells.find(
            (c) => c.columnIndex === secondColumnIndex
          );

          // Only apply formula if both cells exist and have numeric values
          if (
            firstCell?.value &&
            secondCell?.value &&
            !isNaN(parseFloat(firstCell.value)) &&
            !isNaN(parseFloat(secondCell.value))
          ) {
            // Generate formula for this specific row
            let rowFormula = baseFormula.replace(
              /\d+/g,
              row.rowIndex.toString()
            );

            const existingCell = row.Cells.find(
              (c) => c.columnIndex === columnIndex
            );
            const cellData = {
              value: "0",
              formula: rowFormula,
              color: existingCell?.color || undefined,
            };

            if (existingCell) {
              await updateInventoryCell(existingCell.id, cellData);
            } else {
              await addInventoryCell({
                rowId: row.id,
                columnIndex: columnIndex,
                ...cellData,
              });
            }
            formulasApplied++;
          }
        } else {
          // For non-multiplication formulas, apply to all rows
          let rowFormula = baseFormula.replace(/\d+/g, row.rowIndex.toString());

          const existingCell = row.Cells.find(
            (c) => c.columnIndex === columnIndex
          );
          const cellData = {
            value: "0",
            formula: rowFormula,
            color: existingCell?.color || undefined,
          };

          if (existingCell) {
            await updateInventoryCell(existingCell.id, cellData);
          } else {
            await addInventoryCell({
              rowId: row.id,
              columnIndex: columnIndex,
              ...cellData,
            });
          }
          formulasApplied++;
        }
      }

      setShowCellEditor(false);
      setSelectedCellInfo(null);
      onRefresh();

      if (formulasApplied > 0) {
        alert(`Applied formula to ${formulasApplied} rows`);
      } else {
        alert("No valid numeric cells found for multiplication formula");
      }
    } catch (error) {
      console.error("Failed to apply formula to column:", error);
      alert("Failed to apply formula to column");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultColDef: ColDef = {
    resizable: true,
    sortable: false,
    filter: false,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inventory Sheet</h3>
        <div className="space-x-2 flex items-center">
          <button
            onClick={addNewRow}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Add Row
          </button>
          <button
            onClick={handleEditCell}
            disabled={!selectedCellInfo}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Edit Cell
          </button>
        </div>
      </div>

      {/* Selected Cell Info */}
      {selectedCellInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Selected Cell:</span>{" "}
            {selectedCellInfo.field}
            {selectedCellInfo.rowIndex}
            {selectedCellInfo.currentValue && (
              <>
                {" "}
                | <span className="font-medium">Value:</span>{" "}
                {selectedCellInfo.currentValue}
              </>
            )}
            {selectedCellInfo.currentFormula && (
              <>
                {" "}
                | <span className="font-medium">Formula:</span>{" "}
                {selectedCellInfo.currentFormula}
              </>
            )}
          </div>
        </div>
      )}

      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={gridData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={handleCellValueChanged}
          onCellClicked={handleCellClicked}
          getRowId={(params) => params.data.id}
          enableRangeSelection={false}
          singleClickEdit={true}
          stopEditingWhenCellsLoseFocus={true}
          tooltipShowDelay={500}
          getRowStyle={(params) => {
            // Add subtle styling for rows with formulas
            const hasFormulas = Object.keys(params.data).some((key) => {
              if (key === "id" || key === "rowIndex") return false;
              const row = sheetData?.Rows.find(
                (r: any) => r.rowIndex === params.data.rowIndex
              );
              const columnIndex = key.charCodeAt(0) - 65;
              const cell = row?.Cells.find(
                (c: any) => c.columnIndex === columnIndex
              );
              return cell?.formula?.startsWith("=");
            });

            return hasFormulas ? { backgroundColor: "#fafbff" } : undefined;
          }}
        />
      </div>

      {showCellEditor && selectedCellInfo && (
        <ColorPicker
          isOpen={showCellEditor}
          currentColor={selectedCellInfo.currentColor}
          currentValue={selectedCellInfo.currentValue}
          currentFormula={selectedCellInfo.currentFormula}
          cellPosition={{
            row: selectedCellInfo.rowIndex,
            column: selectedCellInfo.field,
            columnIndex: selectedCellInfo.field.charCodeAt(0) - 65,
          }}
          sheetType="inventory"
          onColorChange={handleColorChange}
          onFormulaApply={handleFormulaApply}
          onFormulaApplyToColumn={handleFormulaApplyToColumn}
          onClose={() => {
            setShowCellEditor(false);
            // Don't clear selectedCellInfo here so user can see what's selected
          }}
        />
      )}

      {isLoading && (
        <div className="text-center text-gray-600 py-2">Saving changes...</div>
      )}
    </div>
  );
}
