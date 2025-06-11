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
  PendingCellChange,
} from "../../../utils/types/kahon.type";
import { addInventoryCalculationRow } from "@/lib/server/manageInventoryRows";
import {
  addInventoryCell,
  updateInventoryCell,
  batchUpdateInventoryCells,
} from "@/lib/server/manageCells";
import {
  buildDependencyMap,
  findDependentCells,
  resolveAllFormulas,
  type DependencyMap,
} from "@/lib/utils/dependencyTracker";
import {
  getCellDisplayValue,
  isValidFormula,
  updateCellValueInSheetData,
} from "@/lib/utils/formulaParser";
import ColorPicker from "./ColorPicker";
import AddRowsDialog from "./AddRowsDialog";

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
  const [dependencyMap, setDependencyMap] = useState<DependencyMap>({});
  const [showCellEditor, setShowCellEditor] = useState(false);
  const [showAddRowsDialog, setShowAddRowsDialog] = useState(false);
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    cellId: string;
    rowIndex: number;
    field: string;
    currentColor?: string;
    currentValue?: string;
    currentFormula?: string;
  } | null>(null);

  // New state for change tracking
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, PendingCellChange>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Prepare grid data and build dependency map
  useEffect(() => {
    if (sheetData) {
      const data = prepareGridData(sheetData);
      setGridData(data);

      // Build dependency map for formula tracking
      const depMap = buildDependencyMap(sheetData, "inventory");
      setDependencyMap(depMap);

      // Resolve all formulas on initialization
      resolveFormulasOnInit();
    }
  }, [sheetData]);

  const resolveFormulasOnInit = async () => {
    if (!sheetData) return;

    try {
      const updates = resolveAllFormulas(sheetData, "inventory");

      if (updates.length > 0) {
        console.log(`Resolving ${updates.length} formulas on initialization`);

        // Apply updates via API
        for (const update of updates) {
          await updateInventoryCell(update.cellId, {
            value: update.newValue,
          });
        }

        // Refresh the grid to show updated values
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to resolve formulas on init:", error);
    }
  };

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
        const changeKey = `${row.rowIndex}-${cell.columnIndex}`;
        const pendingChange = pendingChanges.get(changeKey);

        let displayValue: string;

        if (pendingChange) {
          // Use pending change value
          if (pendingChange.formula && pendingChange.formula.startsWith("=")) {
            // For formulas, evaluate using current sheet data + pending changes
            displayValue = evaluateFormulaWithPendingChanges(
              pendingChange.formula,
              data,
              row.rowIndex,
              cell.columnIndex
            );
          } else {
            displayValue = pendingChange.newValue;
          }
        } else {
          // Use original cell value
          displayValue = getCellDisplayValue(
            cell,
            data,
            row.rowIndex,
            cell.columnIndex,
            "inventory"
          );
        }

        if (columnName in gridRow) {
          (gridRow as any)[columnName] = displayValue;
        }
      });

      rows.push(gridRow);
    });

    return rows;
  };

  // Helper function to evaluate formulas with pending changes
  const evaluateFormulaWithPendingChanges = (
    formula: string,
    sheetData: any,
    currentRow: number,
    currentCol: number
  ): string => {
    if (!formula || !formula.startsWith("=")) {
      return formula;
    }

    try {
      // Create a temporary sheet data with pending changes applied
      const tempSheetData = JSON.parse(JSON.stringify(sheetData));

      // Apply all pending changes to temp data
      pendingChanges.forEach((change, changeKey) => {
        const [rowIndex, columnIndex] = changeKey.split("-").map(Number);
        const row = tempSheetData.Rows?.find(
          (r: any) => r.rowIndex === rowIndex
        );
        if (row) {
          let cell = row.Cells?.find((c: any) => c.columnIndex === columnIndex);
          if (cell) {
            cell.value = change.newValue;
            if (change.formula) {
              cell.formula = change.formula;
            }
          } else if (change.rowId) {
            // Add new cell if it doesn't exist
            if (!row.Cells) row.Cells = [];
            row.Cells.push({
              id: `temp-${changeKey}`,
              columnIndex: columnIndex,
              value: change.newValue,
              formula: change.formula || null,
              color: change.color || null,
            });
          }
        }
      });

      // Evaluate formula with temp data
      return getCellDisplayValue(
        { formula, value: "0" },
        tempSheetData,
        currentRow,
        currentCol,
        "inventory"
      );
    } catch (error) {
      console.error("Error evaluating formula with pending changes:", error);
      return "#ERROR";
    }
  };

  // Update grid data when pending changes change
  useEffect(() => {
    if (sheetData) {
      const data = prepareGridData(sheetData);
      setGridData(data);
    }
  }, [sheetData, pendingChanges]);

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

        // Check for pending changes
        const changeKey = `${params.data.rowIndex}-${columnIndex}`;
        const pendingChange = pendingChanges.get(changeKey);

        let style: CellStyle = {};

        // Apply pending change styling (highest priority)
        if (pendingChange) {
          if (pendingChange.color) {
            // Use pending color
            const rgb = hexToRgb(pendingChange.color);
            const textColor = rgb
              ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 128
                ? "#000000"
                : "#ffffff"
              : "#000000";
            style.backgroundColor = pendingChange.color;
            style.color = textColor;
          } else {
            // Pending change indicator
            style.backgroundColor = "#fff3cd";
            style.border = "2px solid #ffc107";
          }

          // Add visual indication for pending formulas
          if (pendingChange.formula?.startsWith("=")) {
            const value = params.data[field];
            if (value === "#ERROR") {
              style.backgroundColor = "#fee2e2";
              style.color = "#dc2626";
            } else {
              style.fontStyle = "italic";
            }
          }
        } else if (existingCell?.color) {
          // Apply existing color styling if no pending changes
          const rgb = hexToRgb(existingCell.color);
          const textColor = rgb
            ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 128
              ? "#000000"
              : "#ffffff"
            : "#000000";

          style.backgroundColor = existingCell.color;
          style.color = textColor;

          // Add visual indication for existing formulas
          if (existingCell.formula?.startsWith("=")) {
            if (params.data[field] === "#ERROR") {
              style.backgroundColor = "#fee2e2";
              style.color = "#dc2626";
            } else {
              style.fontStyle = "italic";
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
  }, [sheetData, pendingChanges]);

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

    const { data, colDef, newValue, oldValue } = event;
    if (!data || !colDef?.field) return;

    // Skip if value hasn't actually changed
    if (newValue === oldValue) return;

    const rowIndex = data.rowIndex;
    const field = colDef.field;
    const columnIndex = field.charCodeAt(0) - 65;
    const changeKey = `${rowIndex}-${columnIndex}`;

    const existingRow = sheetData?.Rows.find((r) => r.rowIndex === rowIndex);
    const existingCell = existingRow?.Cells.find(
      (c) => c.columnIndex === columnIndex
    );

    let cellValue = newValue || "";
    let formula: string | null | undefined = undefined;

    if (cellValue && cellValue.startsWith("=")) {
      if (!isValidFormula(cellValue)) {
        alert("Invalid formula syntax");
        // Revert the change in the grid
        if (gridRef.current) {
          const api = gridRef.current.api;
          const rowNode = api.getRowNode(data.id);
          if (rowNode) {
            rowNode.setDataValue(field, oldValue);
          }
        }
        return;
      }
      formula = cellValue;
      cellValue = "0";
    }

    // Create pending change
    const pendingChange: PendingCellChange = {
      id: `${changeKey}-${Date.now()}`,
      rowId: existingRow?.id,
      rowIndex,
      columnIndex,
      cellId: existingCell?.id,
      oldValue: existingCell?.value || "",
      newValue: cellValue,
      formula,
      color: existingCell?.color || undefined,
      changeType: existingCell ? "update" : "add",
      timestamp: Date.now(),
      isFormulaChange: Boolean(formula), // Fix: Convert to boolean explicitly
    };

    // Add to pending changes
    setPendingChanges((prev) => new Map(prev.set(changeKey, pendingChange)));
  };

  // Save all pending changes
  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) return;

    setIsSaving(true);
    try {
      const changes = Array.from(pendingChanges.values());
      const { results, errors } = await batchUpdateInventoryCells(changes);

      if (errors.length > 0) {
        console.error("Some changes failed:", errors);
        alert(
          `${errors.length} changes failed to save. Check console for details.`
        );
      }

      if (results.length > 0) {
        // Clear pending changes
        setPendingChanges(new Map());
        // Refresh to get latest data
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard all pending changes
  const handleDiscardChanges = () => {
    setPendingChanges(new Map());
    // Refresh grid data to show original values
    if (sheetData) {
      const data = prepareGridData(sheetData);
      setGridData(data);
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

  const addMultipleRows = async (count: number, startIndex?: number) => {
    if (isLoading || !sheetData) return;

    setIsLoading(true);
    try {
      const maxRow = Math.max(...sheetData.Rows.map((r) => r.rowIndex), 0);
      const actualStartIndex = startIndex || maxRow + 1;

      // Add rows sequentially
      for (let i = 0; i < count; i++) {
        await addInventoryCalculationRow({
          inventoryId: sheetData.id,
          rowIndex: actualStartIndex + i,
        });
      }

      setShowAddRowsDialog(false);
      onRefresh();
    } catch (error) {
      console.error("Failed to add multiple rows:", error);
      alert("Failed to add rows");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCell = async () => {
    if (!selectedCellInfo) {
      console.log("No cell selected for clearing");
      return;
    }

    console.log("Starting clear cell operation for:", selectedCellInfo);
    setIsLoading(true);

    try {
      const existingRow = sheetData?.Rows.find(
        (r) => r.rowIndex === selectedCellInfo.rowIndex
      );
      const columnIndex = selectedCellInfo.field.charCodeAt(0) - 65;
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      console.log("Found existing row:", existingRow);
      console.log("Found existing cell:", existingCell);
      console.log("Column index:", columnIndex);

      if (existingCell) {
        console.log("Clearing cell with ID:", existingCell.id);

        // Clear the cell by setting empty values for value, formula, and color
        const clearData = {
          value: "",
          formula: undefined,
          color: undefined,
        };

        console.log("Sending clear data:", clearData);

        const result = await updateInventoryCell(existingCell.id, clearData);
        console.log("Clear cell API result:", result);

        setSelectedCellInfo(null);
        onRefresh();
        console.log("Cell cleared successfully");
      } else {
        // If no cell exists, nothing to clear
        console.log("No existing cell found to clear");
        alert("No cell to clear - cell doesn't exist in database");
      }
    } catch (error) {
      console.error("Failed to clear cell - detailed error:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to clear cell: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = async (color: string) => {
    if (!selectedCellInfo) return;

    const rowIndex = selectedCellInfo.rowIndex;
    const columnIndex = selectedCellInfo.field.charCodeAt(0) - 65;
    const changeKey = `${rowIndex}-${columnIndex}`;

    const existingRow = sheetData?.Rows.find((r) => r.rowIndex === rowIndex);
    const existingCell = existingRow?.Cells.find(
      (c) => c.columnIndex === columnIndex
    );

    // Get existing pending change or create new one
    const existingPendingChange = pendingChanges.get(changeKey);

    const updatedChange: PendingCellChange = {
      id: existingPendingChange?.id || `${changeKey}-${Date.now()}`,
      rowId: existingRow?.id,
      rowIndex,
      columnIndex,
      cellId: existingCell?.id,
      oldValue: existingPendingChange?.oldValue || existingCell?.value || "",
      newValue: existingPendingChange?.newValue || existingCell?.value || "",
      formula:
        existingPendingChange?.formula || existingCell?.formula || undefined,
      color: color || undefined,
      changeType: existingCell ? "update" : "add",
      timestamp: Date.now(),
      isFormulaChange: false,
    };

    // Add to pending changes
    setPendingChanges((prev) => new Map(prev.set(changeKey, updatedChange)));
    setShowCellEditor(false);
  };

  // Updated handleFormulaApply to work with pending changes
  const handleFormulaApply = async (formula: string) => {
    if (!selectedCellInfo) return;

    // Validate formula
    if (formula.startsWith("=") && !isValidFormula(formula)) {
      alert("Invalid formula syntax");
      return;
    }

    const rowIndex = selectedCellInfo.rowIndex;
    const columnIndex = selectedCellInfo.field.charCodeAt(0) - 65;
    const changeKey = `${rowIndex}-${columnIndex}`;

    const existingRow = sheetData?.Rows.find((r) => r.rowIndex === rowIndex);
    const existingCell = existingRow?.Cells.find(
      (c) => c.columnIndex === columnIndex
    );

    // Get existing pending change or create new one
    const existingPendingChange = pendingChanges.get(changeKey);

    const updatedChange: PendingCellChange = {
      id: existingPendingChange?.id || `${changeKey}-${Date.now()}`,
      rowId: existingRow?.id,
      rowIndex,
      columnIndex,
      cellId: existingCell?.id,
      oldValue: existingPendingChange?.oldValue || existingCell?.value || "",
      newValue: formula.startsWith("=") ? "0" : formula,
      formula: formula.startsWith("=") ? formula : undefined,
      color: existingPendingChange?.color || existingCell?.color || undefined,
      changeType: existingCell ? "update" : "add",
      timestamp: Date.now(),
      isFormulaChange: Boolean(formula.startsWith("=")), // Fix: Explicit boolean conversion
    };

    // Add to pending changes
    setPendingChanges((prev) => new Map(prev.set(changeKey, updatedChange)));
    setShowCellEditor(false);
    setSelectedCellInfo(null);
  };

  const handleFormulaApplyToColumn = async (
    baseFormula: string,
    columnIndex: number
  ) => {
    if (!selectedCellInfo || !sheetData) return;

    // Validate formula
    if (baseFormula.startsWith("=") && !isValidFormula(baseFormula)) {
      alert("Invalid formula syntax");
      return;
    }

    let formulasApplied = 0;
    const newPendingChanges = new Map(pendingChanges);

    // Get all rows sorted by row index
    const sortedRows = [...sheetData.Rows].sort(
      (a, b) => a.rowIndex - b.rowIndex
    );

    for (const row of sortedRows) {
      // Initialize shouldApply with default value
      let shouldApply = false;

      // Check if we need to verify numeric values for multiplication formulas
      if (baseFormula.includes("*")) {
        // For multiplication, check if the two left columns have valid data
        if (columnIndex >= 2) {
          // Need at least 2 columns to the left (C column minimum)
          const firstColumnIndex = columnIndex - 2;
          const secondColumnIndex = columnIndex - 1;

          const firstCell = row.Cells.find(
            (c) => c.columnIndex === firstColumnIndex
          );
          const secondCell = row.Cells.find(
            (c) => c.columnIndex === secondColumnIndex
          );

          // Check if at least one cell has valid numeric data (not both empty/invalid)
          const firstHasValue =
            firstCell?.value && !isNaN(parseFloat(firstCell.value));
          const secondHasValue =
            secondCell?.value && !isNaN(parseFloat(secondCell.value));

          // Apply formula if at least one cell has a valid value
          shouldApply = Boolean(firstHasValue || secondHasValue);
        }
      } else if (baseFormula.includes("+") && baseFormula.includes("B")) {
        // For addition formulas that exclude A column
        // Check if at least one cell from B column onwards has valid data
        let hasValidData = false;

        // Check B column (index 1) and subsequent columns
        for (let i = 1; i < columnIndex; i++) {
          const cell = row.Cells.find((c) => c.columnIndex === i);
          if (
            cell?.value &&
            cell.value.trim() !== "" &&
            !isNaN(parseFloat(cell.value))
          ) {
            hasValidData = true;
            break;
          }
        }

        shouldApply = hasValidData;
      } else {
        // For other formulas, apply to all rows
        shouldApply = true;
      }

      if (shouldApply) {
        // Generate formula for this specific row
        const rowFormula = baseFormula.replace(/\d+/g, row.rowIndex.toString());
        const changeKey = `${row.rowIndex}-${columnIndex}`;
        const existingCell = row.Cells.find(
          (c) => c.columnIndex === columnIndex
        );
        const existingPendingChange = newPendingChanges.get(changeKey);

        const updatedChange: PendingCellChange = {
          id: existingPendingChange?.id || `${changeKey}-${Date.now()}`,
          rowId: row.id,
          rowIndex: row.rowIndex,
          columnIndex,
          cellId: existingCell?.id,
          oldValue:
            existingPendingChange?.oldValue || existingCell?.value || "",
          newValue: "0",
          formula: rowFormula,
          color:
            existingPendingChange?.color || existingCell?.color || undefined,
          changeType: existingCell ? "update" : "add",
          timestamp: Date.now(),
          isFormulaChange: true,
        };

        newPendingChanges.set(changeKey, updatedChange);
        formulasApplied++;
      }
    }

    setPendingChanges(newPendingChanges);
    setShowCellEditor(false);
    setSelectedCellInfo(null);

    if (formulasApplied > 0) {
      alert(`Applied formula to ${formulasApplied} rows (pending save)`);
    } else {
      alert("No valid data found for formula application");
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
          {pendingChanges.size > 0 && (
            <>
              <span className="text-sm text-orange-600 font-medium">
                {pendingChanges.size} unsaved change
                {pendingChanges.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleDiscardChanges}
                disabled={isSaving}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Discard
              </button>
            </>
          )}
          <button
            onClick={addNewRow}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Add Row
          </button>
          <button
            onClick={() => setShowAddRowsDialog(true)}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Add Multiple Rows
          </button>
          <button
            onClick={handleClearCell}
            disabled={!selectedCellInfo || isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Clear Cell
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

      {/* Pending Changes Summary */}
      {pendingChanges.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-800 mb-2">
            Pending Changes ({pendingChanges.size}):
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {Array.from(pendingChanges.values()).map((change) => (
              <div
                key={change.id}
                className="text-sm text-yellow-700 flex items-center space-x-2"
              >
                <span className="font-mono">
                  {String.fromCharCode(65 + change.columnIndex)}
                  {change.rowIndex}:
                </span>
                {change.isFormulaChange ? (
                  <span className="text-blue-600">
                    Formula: {change.formula}
                  </span>
                ) : change.color ? (
                  <div className="flex items-center space-x-1">
                    <span>Color:</span>
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: change.color }}
                      title={change.color}
                    />
                  </div>
                ) : (
                  <span>
                    "{change.oldValue}" → "{change.newValue}"
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Cell Info */}
      {selectedCellInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Selected Cell:</span>{" "}
            {selectedCellInfo.field}
            {selectedCellInfo.rowIndex}
            {(() => {
              const changeKey = `${selectedCellInfo.rowIndex}-${
                selectedCellInfo.field.charCodeAt(0) - 65
              }`;
              const pendingChange = pendingChanges.get(changeKey);
              return pendingChange ? (
                <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                  Has pending changes
                </span>
              ) : null;
            })()}
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
          currentColor={(() => {
            const changeKey = `${selectedCellInfo.rowIndex}-${
              selectedCellInfo.field.charCodeAt(0) - 65
            }`;
            const pendingChange = pendingChanges.get(changeKey);
            return pendingChange?.color || selectedCellInfo.currentColor;
          })()}
          currentValue={selectedCellInfo.currentValue}
          currentFormula={(() => {
            const changeKey = `${selectedCellInfo.rowIndex}-${
              selectedCellInfo.field.charCodeAt(0) - 65
            }`;
            const pendingChange = pendingChanges.get(changeKey);
            return pendingChange?.formula || selectedCellInfo.currentFormula;
          })()}
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
          }}
        />
      )}

      {showAddRowsDialog && sheetData && (
        <AddRowsDialog
          isOpen={showAddRowsDialog}
          maxRowIndex={Math.max(...sheetData.Rows.map((r) => r.rowIndex), 0)}
          onAddRows={addMultipleRows}
          onClose={() => setShowAddRowsDialog(false)}
        />
      )}

      {isLoading && (
        <div className="text-center text-gray-600 py-2">Saving changes...</div>
      )}
    </div>
  );
}
