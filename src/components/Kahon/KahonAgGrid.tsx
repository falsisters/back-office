"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellValueChangedEvent,
  CellClickedEvent,
  CellStyle,
  RowDragEndEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@/components/ui/button";
import type {
  SheetWithData,
  PendingCellChange,
} from "../../../utils/types/kahon.type";
import {
  useCreateKahonRow,
  useDeleteKahonRow,
  useUpdateCell,
  useBatchUpdateCells,
  useReorderKahonRows,
} from "@/hooks/useKahon";
import { toast } from "sonner";
import { extractNestError } from "@/lib/api/types";
import {
  buildDependencyMap,
  findDependentCells,
  resolveAllFormulas,
  type DependencyMap,
} from "@/lib/utils/dependencyTracker";
import {
  getColumnName,
  getColumnIndex,
  getCellDisplayValue,
  isValidFormula,
  parseAndEvaluateFormula,
} from "@/lib/utils/formulaParser";
import ColorPicker from "./ColorPicker";
import AddRowsDialog from "./AddRowsDialog";
import {
  updateAllFormulasForRowReorder,
  createRowMappingsFromReorders,
  calculateRowReorderMappings,
} from "@/lib/utils/formulaUpdater";

interface KahonAgGridProps {
  cashierId: string;
  sheetData?: SheetWithData | null;
  onRefresh: () => void;
}

interface GridRow {
  id: string;
  rowIndex: number;
  Quantity: string;
  Name: string;
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
}

// Add new interface for row position changes
interface PendingRowReorder {
  id: string;
  rowId: string;
  oldRowIndex: number;
  newRowIndex: number;
  timestamp: number;
}

export default function KahonAgGrid({
  cashierId,
  sheetData,
  onRefresh,
}: KahonAgGridProps) {
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

  const [pendingChanges, setPendingChanges] = useState<
    Map<string, PendingCellChange>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const [pendingRowReorders, setPendingRowReorders] = useState<
    Map<string, PendingRowReorder>
  >(new Map());
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFormulaPicker, setShowFormulaPicker] = useState(false);

  const createRow = useCreateKahonRow();
  const deleteRow = useDeleteKahonRow();
  const updateCell = useUpdateCell();
  const batchUpdateCells = useBatchUpdateCells();
  const reorderRows = useReorderKahonRows();

  // Prepare grid data and build dependency map
  useEffect(() => {
    if (sheetData) {
      const data = prepareGridData(sheetData);
      setGridData(data);

      // Build dependency map for formula tracking
      const depMap = buildDependencyMap(sheetData, "kahon");
      setDependencyMap(depMap);

      // Resolve all formulas on initialization
      resolveFormulasOnInit();
    }
  }, [sheetData]);

  // Resolve dependent formulas when a cell changes
  const resolveDependentFormulas = async (changedCellRef: string) => {
    if (!sheetData) return;

    try {
      const dependentCells = findDependentCells(changedCellRef, dependencyMap);

      if (dependentCells.length > 0) {
        console.log(
          `Resolving ${dependentCells.length} dependent formulas for ${changedCellRef}`
        );

        // Get updated sheet data with current changes
        const tempSheetData = JSON.parse(JSON.stringify(sheetData));

        // Apply pending changes to temp data
        pendingChanges.forEach((change, changeKey) => {
          const [rowIndex, columnIndex] = changeKey.split("-").map(Number);
          const row = tempSheetData.Rows?.find(
            (r: any) => r.rowIndex === rowIndex
          );
          if (row) {
            let cell = row.Cells?.find(
              (c: any) => c.columnIndex === columnIndex
            );
            if (cell) {
              cell.value = change.newValue;
              if (change.formula) {
                cell.formula = change.formula;
              }
            }
          }
        });

        // Resolve all formulas with updated data
        const updates = resolveAllFormulas(tempSheetData, "kahon");

        // Apply dependent formula updates as pending changes
        updates.forEach((update) => {
          const changeKey = `${update.rowIndex}-${update.columnIndex}`;
          const existingChange = pendingChanges.get(changeKey);

          if (!existingChange || existingChange.isFormulaChange) {
            const row = sheetData.Rows.find(
              (r) => r.rowIndex === update.rowIndex
            );
            const cell = row?.Cells.find(
              (c) => c.columnIndex === update.columnIndex
            );

            const pendingChange: PendingCellChange = {
              id: `${changeKey}-${Date.now()}`,
              rowId: row?.id,
              rowIndex: update.rowIndex,
              columnIndex: update.columnIndex,
              cellId: cell?.id || update.cellId,
              oldValue: cell?.value || "",
              newValue: update.newValue,
              formula: update.formula || cell?.formula, // Use the preserved formula
              color: cell?.color,
              changeType: cell ? "update" : "add",
              timestamp: Date.now(),
              isFormulaChange: Boolean(update.formula?.startsWith("=")),
            };

            setPendingChanges(
              (prev) => new Map(prev.set(changeKey, pendingChange))
            );
          }
        });
      }
    } catch (error) {
      console.error("Failed to resolve dependent formulas:", error);
    }
  };

  const prepareGridData = (data: SheetWithData): GridRow[] => {
    const rows: GridRow[] = [];

    data.Rows.forEach((row) => {
      const gridRow: GridRow = {
        id: row.id,
        rowIndex: row.rowIndex,
        Quantity: "",
        Name: "",
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
      };

      // Map cells to columns with formula evaluation
      row.Cells.forEach((cell) => {
        const columnName = getColumnName(cell.columnIndex);
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
            "kahon"
          );
        }

        if (columnName in gridRow) {
          (gridRow as any)[columnName] = displayValue;
        }
      });

      rows.push(gridRow);
    });

    // Apply pending row reorders to the grid data
    const finalRows = rows.map((row) => {
      const reorderChange = pendingRowReorders.get(row.id);
      if (reorderChange) {
        return { ...row, rowIndex: reorderChange.newRowIndex };
      }
      return row;
    });

    // Sort by the (possibly updated) row index to show correct order
    return finalRows.sort((a, b) => a.rowIndex - b.rowIndex);
  };

  // Helper function to evaluate formulas with pending changes
  const evaluateFormulaWithPendingChanges = (
    formula: string,
    sheetData: any,
    currentRow: number,
    currentCol: number
  ): string => {
    if (!formula || !formula.startsWith("=")) {
      // Apply Kahon rounding even to direct values
      const value = parseFloat(formula) || 0;
      return Math.floor(value).toString();
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

      // Use the Kahon-specific evaluation function
      return parseAndEvaluateFormula(
        formula,
        tempSheetData,
        currentRow,
        currentCol
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

  const resolveFormulasOnInit = async () => {
    if (!sheetData) return;

    try {
      const updates = resolveAllFormulas(sheetData, "kahon");

      if (updates.length > 0) {
        console.log(`Resolving ${updates.length} formulas on initialization`);

        // Apply updates via API - preserve formulas
        for (const update of updates) {
          await updateCell.mutateAsync({
            cellId: update.cellId,
            data: {
              value: update.newValue,
              formula: update.formula,
            },
          });
        }

        // Refresh the grid to show updated values
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to resolve formulas on init:", error);
    }
  };

  // Column definitions - 15 columns total (Quantity + Name + A-M)
  const columnDefs: ColDef[] = useMemo(() => {
    const getCellStyleFunction =
      (field: string) =>
      (params: any): CellStyle => {
        if (!params.data || !sheetData) return {};

        const existingRow = sheetData.Rows.find(
          (r: any) => r.rowIndex === params.data.rowIndex
        );
        const columnIndex = getColumnIndex(field);
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
            style.backgroundColor = "#fff3cd"; // Light yellow for pending changes
            style.border = "2px solid #ffc107"; // Yellow border
          }

          // Add visual indication for pending formulas
          if (pendingChange.formula?.startsWith("=")) {
            const value = params.data[field];
            if (value === "#ERROR") {
              style.backgroundColor = "#fee2e2";
              style.color = "#dc2626";
            } else {
              style.fontStyle = "italic";
              // Add a small indicator for formula cells
              style.position = "relative";
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

    // Create a React component for the row index cell
    const RowIndexCellRenderer = (params: any) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            width: "100%",
            padding: "0 4px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#6c757d",
              lineHeight: 1,
            }}
          >
            ⋮⋮
          </span>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              color: "#495057",
            }}
          >
            {params.value}
          </span>
        </div>
      );
    };

    return [
      {
        field: "rowIndex",
        headerName: "#",
        width: 80,
        pinned: "left",
        editable: false,
        rowDrag: true,
        resizable: false,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          fontWeight: "bold",
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #dee2e6",
        } as CellStyle,
        cellRenderer: RowIndexCellRenderer,
        cellClassRules: {
          "row-index-cell": () => true,
        },
      },
      {
        field: "Quantity",
        headerName: "Quantity",
        width: 120, // Keep original width for Quantity
        editable: true,
        resizable: true,
        cellStyle: getCellStyleFunction("Quantity"),
      },
      {
        field: "Name",
        headerName: "Name",
        width: 260, // Keep original width for Name
        editable: true,
        resizable: true,
        cellStyle: getCellStyleFunction("Name"),
      },
      ...["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].map(
        (col) => ({
          field: col,
          headerName: col,
          width: 200, // Increased from 80 to 120 (50% larger)
          editable: true,
          resizable: true,
          cellStyle: getCellStyleFunction(col),
        })
      ),
    ];
  }, [sheetData, pendingChanges]); // Only depend on data changes, not other state

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

  // Modified cell value change handler - now tracks changes locally
  const handleCellValueChanged = async (event: CellValueChangedEvent) => {
    if (isLoading) return;

    const { data, colDef, newValue, oldValue } = event;
    if (!data || !colDef?.field) return;

    // Skip if value hasn't actually changed
    if (newValue === oldValue) return;

    const rowIndex = data.rowIndex;
    const field = colDef.field;
    const columnIndex = getColumnIndex(field);
    const changeKey = `${rowIndex}-${columnIndex}`;

    const existingRow = sheetData?.Rows.find((r) => r.rowIndex === rowIndex);
    const existingCell = existingRow?.Cells.find(
      (c) => c.columnIndex === columnIndex
    );

    let cellValue = newValue || "";
    let formula: string | null | undefined = undefined;

    if (cellValue && cellValue.startsWith("=")) {
      if (!isValidFormula(cellValue)) {
        toast.error("Invalid formula syntax");
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
      isFormulaChange: Boolean(formula),
    };

    // Add to pending changes
    setPendingChanges((prev) => new Map(prev.set(changeKey, pendingChange)));

    // Resolve dependent formulas
    const cellRef = getColumnName(columnIndex) + rowIndex;
    await resolveDependentFormulas(cellRef);
  };

  const addNewRow = async () => {
    if (isLoading || !sheetData) return;

    setIsLoading(true);

    try {
      const maxRow = Math.max(...sheetData.Rows.map((r) => r.rowIndex), 0);
      await createRow.mutateAsync({
        sheetId: sheetData.id,
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
        await createRow.mutateAsync({
          sheetId: sheetData.id,
          rowIndex: actualStartIndex + i,
        });
      }

      setShowAddRowsDialog(false);
      onRefresh();
    } catch (error) {
      console.error("Failed to add multiple rows:", error);
      toast.error("Failed to add rows");
    } finally {
      setIsLoading(false);
    }
  };

  // Save all pending changes
  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0 && pendingRowReorders.size === 0) return;

    setIsSaving(true);
    try {
      const results = [];
      const errors = [];

      // Save cell changes first
      if (pendingChanges.size > 0) {
        const cellChanges = Array.from(pendingChanges.values());
        const cellResults = await batchUpdateCells.mutateAsync(cellChanges);
        results.push(...cellResults.results);
        errors.push(...cellResults.errors);
      }

      // Save row reorders
      if (pendingRowReorders.size > 0) {
        const rowReorders = Array.from(pendingRowReorders.values());
        const positionUpdates = rowReorders.map((reorder) => ({
          rowId: reorder.rowId,
          newRowIndex: reorder.newRowIndex,
        }));

        try {
          const reorderResult = await reorderRows.mutateAsync(
            positionUpdates
          );
          results.push(reorderResult);
        } catch (reorderError) {
          console.error("Row reorder failed:", reorderError);
          errors.push(reorderError);
        }
      }

      if (errors.length > 0) {
        console.error("Some changes failed:", errors);
        toast.error(
          `${errors.length} changes failed to save. Check console for details.`
        );
      }

      if (results.length > 0) {
        // Clear all pending changes
        setPendingChanges(new Map());
        setPendingRowReorders(new Map());
        // Refresh to get latest data
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard all pending changes
  const handleDiscardChanges = () => {
    setPendingChanges(new Map());
    setPendingRowReorders(new Map());
    // Refresh grid data to show original values and positions
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
    const columnIndex = getColumnIndex(field);
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
      toast("Please select a cell first by clicking on it");
      return;
    }
    setShowCellEditor(true);
  };

  const handleEditColor = () => {
    if (!selectedCellInfo) {
      toast("Please select a cell first by clicking on it");
      return;
    }
    setShowColorPicker(true);
  };

  const handleEditFormula = () => {
    if (!selectedCellInfo) {
      toast("Please select a cell first by clicking on it");
      return;
    }
    setShowFormulaPicker(true);
  };

  const handleDeleteRow = async () => {
    if (!selectedCellInfo) {
      toast("Please select a cell in the row you want to delete");
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete row ${selectedCellInfo.rowIndex}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const existingRow = sheetData?.Rows.find(
        (r) => r.rowIndex === selectedCellInfo.rowIndex
      );

      if (existingRow) {
        await deleteRow.mutateAsync(existingRow.id);
        setSelectedCellInfo(null);
        onRefresh();
      } else {
        toast.error("Row not found");
      }
    } catch (error) {
      console.error("Failed to delete row:", error);
      toast.error("Failed to delete row");
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

    try {
      const existingRow = sheetData?.Rows.find(
        (r) => r.rowIndex === selectedCellInfo.rowIndex
      );
      const columnIndex = getColumnIndex(selectedCellInfo.field);
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      console.log("Found existing row:", existingRow);
      console.log("Found existing cell:", existingCell);
      console.log("Column index:", columnIndex);

      if (existingCell) {
        console.log(
          "Adding clear operation to pending changes for cell:",
          existingCell.id
        );

        const changeKey = `${selectedCellInfo.rowIndex}-${columnIndex}`;

        // Create a pending change that clears the cell
        const clearChange: PendingCellChange = {
          id: `${changeKey}-${Date.now()}`,
          rowId: existingRow?.id,
          rowIndex: selectedCellInfo.rowIndex,
          columnIndex,
          cellId: existingCell.id,
          oldValue: existingCell.value || "",
          newValue: "",
          formula: null, // Clear formula
          color: null, // Clear color
          changeType: "update",
          timestamp: Date.now(),
          isFormulaChange: false,
        };

        // Add to pending changes
        setPendingChanges((prev) => new Map(prev.set(changeKey, clearChange)));

        // Clear the selected cell info since we've processed it
        setSelectedCellInfo(null);

        console.log("Cell clear added to pending changes successfully");
      } else {
        // If no cell exists, nothing to clear
        console.log("No existing cell found to clear");
        toast.error("No cell to clear - cell doesn't exist in database");
      }
    } catch (error) {
      console.error("Failed to add clear operation to pending changes:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to clear cell: ${errorMessage}`);
    }
  };

  // New handlers for color and formula changes
  const handleColorChange = async (color: string) => {
    if (!selectedCellInfo) return;

    const rowIndex = selectedCellInfo.rowIndex;
    const columnIndex = getColumnIndex(selectedCellInfo.field);
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
    setShowColorPicker(false);
  };

  // Updated handleFormulaApply to work with pending changes
  const handleFormulaApply = async (formula: string) => {
    if (!selectedCellInfo) return;

    // Validate formula
    if (formula.startsWith("=") && !isValidFormula(formula)) {
      toast.error("Invalid formula syntax");
      return;
    }

    const rowIndex = selectedCellInfo.rowIndex;
    const columnIndex = getColumnIndex(selectedCellInfo.field);
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
      formula: formula.startsWith("=") ? formula : null, // Ensure formula is properly set
      color: existingPendingChange?.color || existingCell?.color || undefined,
      changeType: existingCell ? "update" : "add",
      timestamp: Date.now(),
      isFormulaChange: Boolean(formula.startsWith("=")),
    };

    console.log("handleFormulaApply - updatedChange:", updatedChange);

    // Add to pending changes
    setPendingChanges((prev) => new Map(prev.set(changeKey, updatedChange)));
    setShowFormulaPicker(false);
    setSelectedCellInfo(null);

    // Resolve dependent formulas if this is a formula change
    if (formula.startsWith("=")) {
      const cellRef = getColumnName(columnIndex) + rowIndex;
      await resolveDependentFormulas(cellRef);
    }
  };

  // Updated handleFormulaApplyToColumn to work with pending changes
  const handleFormulaApplyToColumn = async (
    baseFormula: string,
    columnIndex: number
  ) => {
    if (!selectedCellInfo || !sheetData) return;

    // Validate formula
    if (baseFormula.startsWith("=") && !isValidFormula(baseFormula)) {
      toast.error("Invalid formula syntax");
      return;
    }

    let formulasApplied = 0;
    const newPendingChanges = new Map(pendingChanges);

    // Get all rows sorted by row index
    const sortedRows = [...sheetData.Rows].sort(
      (a, b) => a.rowIndex - b.rowIndex
    );

    for (const row of sortedRows) {
      // Apply same logic as before for checking valid data
      let shouldApply = false;

      if (baseFormula.includes("*")) {
        if (columnIndex >= 2) {
          const firstColumnIndex = columnIndex - 2;
          const secondColumnIndex = columnIndex - 1;

          // Check both existing cells AND pending changes
          const firstCell = row.Cells.find(
            (c) => c.columnIndex === firstColumnIndex
          );
          const secondCell = row.Cells.find(
            (c) => c.columnIndex === secondColumnIndex
          );

          // Check pending changes for these cells
          const firstPendingKey = `${row.rowIndex}-${firstColumnIndex}`;
          const secondPendingKey = `${row.rowIndex}-${secondColumnIndex}`;
          const firstPending = newPendingChanges.get(firstPendingKey);
          const secondPending = newPendingChanges.get(secondPendingKey);

          // Get effective values (pending or existing)
          const firstValue = firstPending?.newValue || firstCell?.value || "";
          const secondValue =
            secondPending?.newValue || secondCell?.value || "";

          const firstHasValue = firstValue && !isNaN(parseFloat(firstValue));
          const secondHasValue = secondValue && !isNaN(parseFloat(secondValue));

          shouldApply = Boolean(firstHasValue || secondHasValue);
        }
      } else if (baseFormula.includes("+")) {
        if (columnIndex >= 2) {
          // For addition, check if there's any data in preceding columns
          let hasValidData = false;

          // Check from column 0 up to current column - 1
          for (let i = 0; i < columnIndex; i++) {
            const cell = row.Cells.find((c) => c.columnIndex === i);
            const pendingKey = `${row.rowIndex}-${i}`;
            const pending = newPendingChanges.get(pendingKey);

            // Get effective value (pending or existing)
            const value = pending?.newValue || cell?.value || "";

            if (value && value.trim() !== "" && !isNaN(parseFloat(value))) {
              hasValidData = true;
              break;
            }
          }

          shouldApply = hasValidData;
        }
      } else {
        shouldApply = true;
      }

      if (shouldApply) {
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
          formula: rowFormula, // Ensure formula is properly set
          color:
            existingPendingChange?.color || existingCell?.color || undefined,
          changeType: existingCell ? "update" : "add",
          timestamp: Date.now(),
          isFormulaChange: true,
        };

        console.log(`Row ${row.rowIndex} formula change:`, updatedChange);

        newPendingChanges.set(changeKey, updatedChange);
        formulasApplied++;
      }
    }

    console.log(
      "handleFormulaApplyToColumn - total changes:",
      newPendingChanges.size
    );
    setPendingChanges(newPendingChanges);
    setShowFormulaPicker(false);
    setSelectedCellInfo(null);

    if (formulasApplied > 0) {
      toast.success(`Applied formula to ${formulasApplied} rows (pending save)`);

      // Resolve dependent formulas for the changed column
      const cellRef = getColumnName(columnIndex) + selectedCellInfo.rowIndex;
      await resolveDependentFormulas(cellRef);
    } else {
      toast.error("No valid data found for formula application");
    }
  };

  // Enhanced pending changes summary
  const getPendingChangesSummary = () => {
    const changes = Array.from(pendingChanges.values());
    const reorders = Array.from(pendingRowReorders.values());
    const colorChanges = changes.filter((c) => c.color && !c.isFormulaChange);
    const formulaChanges = changes.filter((c) => c.isFormulaChange);
    const valueChanges = changes.filter((c) => !c.isFormulaChange && !c.color);

    return {
      colorChanges,
      formulaChanges,
      valueChanges,
      rowReorders: reorders,
      total: changes.length + reorders.length,
    };
  };

  // Handle row drag end event
  const handleRowDragEnd = async (event: RowDragEndEvent) => {
    console.log("Kahon row drag end event triggered:", event);

    if (!event.overNode || !sheetData || isReordering) {
      console.log("Early return - conditions not met");
      return;
    }

    setIsReordering(true);
    console.log("Processing kahon row reorder as pending change...");

    try {
      const draggedRowData = event.node.data;
      const overRowData = event.overNode.data;
      const overIndex = (event as any).overIndex;

      console.log("Dragged row data:", draggedRowData);
      console.log("Target row data:", overRowData);
      console.log("Over index:", overIndex);

      // Get all current rows sorted by row index
      const allRows = [...sheetData.Rows].sort(
        (a, b) => a.rowIndex - b.rowIndex
      );

      // Find the actual positions in the sorted array
      const draggedRowIndex = allRows.findIndex(
        (r) => r.id === draggedRowData.id
      );
      let targetRowIndex = overIndex;

      // If overIndex is not reliable, find by row data
      if (typeof targetRowIndex !== "number" || targetRowIndex < 0) {
        targetRowIndex = allRows.findIndex((r) => r.id === overRowData.id);
      }

      console.log("Calculated indices:", { draggedRowIndex, targetRowIndex });

      if (draggedRowIndex === -1 || targetRowIndex === -1) {
        console.error("Could not determine row positions");
        return;
      }

      // Use the enhanced calculation function with validation
      const newPendingReorders = calculateRowReorderMappings(
        draggedRowData.id,
        draggedRowIndex,
        targetRowIndex,
        allRows
      );

      if (newPendingReorders.size === 0) {
        console.log("No row position changes needed");
        return;
      }

      // Validate the new mappings before applying
      const { validateRowMappings } = await import(
        "@/lib/utils/formulaUpdater"
      );
      const validation = validateRowMappings(newPendingReorders, allRows);

      if (!validation.isValid) {
        console.error("Row mapping validation failed:", validation.errors);
        toast.error(`Cannot reorder rows: ${validation.errors.join(", ")}`);
        return;
      }

      // Merge with existing pending reorders, handling conflicts
      const mergedReorders = new Map(pendingRowReorders);

      newPendingReorders.forEach((newMapping, rowId) => {
        const existingMapping = mergedReorders.get(rowId);
        if (existingMapping) {
          // Update existing mapping to use the original old index but new target
          mergedReorders.set(rowId, {
            ...newMapping,
            oldRowIndex: existingMapping.oldRowIndex, // Keep original starting position
          });
        } else {
          mergedReorders.set(rowId, newMapping);
        }
      });

      // Validate merged mappings as well
      const mergedValidation = validateRowMappings(mergedReorders, allRows);
      if (!mergedValidation.isValid) {
        console.error(
          "Merged mapping validation failed:",
          mergedValidation.errors
        );
        toast.error(
          `Cannot apply row reordering: ${mergedValidation.errors.join(", ")}`
        );
        return;
      }

      // Create row mappings for formula updates
      const rowMappings = createRowMappingsFromReorders(mergedReorders);

      // Find all formulas that need to be updated
      const formulaUpdates = updateAllFormulasForRowReorder(
        sheetData,
        rowMappings,
        "kahon"
      );

      console.log("Kahon formula updates needed:", formulaUpdates);

      // Apply formula updates to pending changes
      const newPendingChanges = new Map(pendingChanges);

      formulaUpdates.forEach((update) => {
        const changeKey = `${update.rowIndex}-${update.columnIndex}`;
        const existingRow = sheetData.Rows.find(
          (r) => r.rowIndex === update.rowIndex
        );

        // Handle case where row index has changed due to reordering
        let targetRow = existingRow;
        if (!targetRow) {
          // Find row by looking at the reverse mapping
          const originalRowIndex = Array.from(mergedReorders.values()).find(
            (mapping) => mapping.newRowIndex === update.rowIndex
          )?.oldRowIndex;

          if (originalRowIndex) {
            targetRow = sheetData.Rows.find(
              (r) => r.rowIndex === originalRowIndex
            );
          }
        }

        if (!targetRow) {
          console.warn(
            `Could not find target row for formula update at index ${update.rowIndex}`
          );
          return;
        }

        const existingCell = targetRow.Cells.find(
          (c) => c.columnIndex === update.columnIndex
        );
        const existingPendingChange = newPendingChanges.get(changeKey);

        const updatedChange: PendingCellChange = {
          id: existingPendingChange?.id || `${changeKey}-formula-${Date.now()}`,
          rowId: targetRow.id,
          rowIndex: update.rowIndex, // Use the new row index
          columnIndex: update.columnIndex,
          cellId: update.cellId,
          oldValue:
            existingPendingChange?.oldValue || existingCell?.value || "",
          newValue:
            existingPendingChange?.newValue || existingCell?.value || "",
          formula: update.newFormula,
          color:
            existingPendingChange?.color || existingCell?.color || undefined,
          changeType: "update",
          timestamp: Date.now(),
          isFormulaChange: true,
          newRowIndex: update.rowIndex, // Track the new row position
        };

        newPendingChanges.set(changeKey, updatedChange);
      });

      // Update states
      setPendingRowReorders(mergedReorders);
      setPendingChanges(newPendingChanges);

      console.log(
        "Kahon row reordering and formula updates tracked as pending changes"
      );
    } catch (error) {
      console.error("Failed to track kahon row reorder:", error);
      toast.error(
        `Failed to reorder rows: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsReordering(false);
    }
  };

  const defaultColDef: ColDef = {
    resizable: true,
    sortable: false,
    filter: false,
    suppressSizeToFit: true, // Prevent auto-resizing
    suppressAutoSize: true, // Prevent auto-sizing
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kahon Sheet</h3>
        <div className="space-x-2 flex items-center">
          {isReordering && (
            <span className="text-sm text-gray-600 font-medium">
              Reordering rows...
            </span>
          )}
          {(pendingChanges.size > 0 || pendingRowReorders.size > 0) && (
            <>
              <span className="text-sm text-gray-600 font-medium">
                {pendingChanges.size + pendingRowReorders.size} unsaved change
                {pendingChanges.size + pendingRowReorders.size > 1 ? "s" : ""}
                {pendingRowReorders.size > 0 &&
                  ` (${pendingRowReorders.size} reorder${
                    pendingRowReorders.size > 1 ? "s" : ""
                  })`}
              </span>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                <span className="mr-1">💾</span>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleDiscardChanges}
                disabled={isSaving}
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
                size="sm"
              >
                <span className="mr-1">❌</span>
                Discard
              </Button>
            </>
          )}
          <Button
            onClick={addNewRow}
            disabled={isLoading}
            className="bg-black text-white hover:bg-gray-800"
            size="sm"
          >
            <span className="mr-1">➕</span>
            Add Row
          </Button>
          <Button
            onClick={() => setShowAddRowsDialog(true)}
            disabled={isLoading}
            variant="outline"
            className="border-black text-black hover:bg-gray-100"
            size="sm"
          >
            <span className="mr-1">📝</span>
            Add Multiple
          </Button>
          <Button
            onClick={handleDeleteRow}
            disabled={!selectedCellInfo || isLoading}
            className="bg-black text-white hover:bg-gray-800"
            size="sm"
          >
            <span className="mr-1">🗑️</span>
            Delete Row
          </Button>
          <Button
            onClick={handleClearCell}
            disabled={!selectedCellInfo || isLoading}
            variant="outline"
            className="border-black text-black hover:bg-gray-100"
            size="sm"
          >
            <span className="mr-1">🧹</span>
            Clear Cell
          </Button>
          <Button
            onClick={handleEditColor}
            disabled={!selectedCellInfo}
            className="bg-black text-white hover:bg-gray-800"
            size="sm"
          >
            <span className="mr-1">🎨</span>
            Color
          </Button>
          <Button
            onClick={handleEditFormula}
            disabled={!selectedCellInfo}
            variant="outline"
            className="border-black text-black hover:bg-gray-100"
            size="sm"
          >
            <span className="mr-1">🧮</span>
            Formula
          </Button>
        </div>
      </div>

      {/* Selected Cell Info with pending change indicator */}
      {selectedCellInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Selected Cell:</span>{" "}
            {selectedCellInfo.field}
            {selectedCellInfo.rowIndex}
            {(() => {
              const changeKey = `${selectedCellInfo.rowIndex}-${getColumnIndex(
                selectedCellInfo.field
              )}`;
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
          onRowDragEnd={handleRowDragEnd}
          getRowId={(params) => params.data.id}
          enableRangeSelection={false}
          singleClickEdit={true}
          stopEditingWhenCellsLoseFocus={true}
          tooltipShowDelay={500}
          rowDragManaged={true}
          animateRows={true}
          suppressColumnVirtualisation={true} // Prevent column virtualization issues
          maintainColumnOrder={true} // Maintain column order
          getRowStyle={(params) => {
            // Add subtle styling for rows with formulas
            const hasFormulas = Object.keys(params.data).some((key) => {
              if (key === "id" || key === "rowIndex") return false;
              const row = sheetData?.Rows.find(
                (r: any) => r.rowIndex === params.data.rowIndex
              );
              const columnIndex = getColumnIndex(key);
              const cell = row?.Cells.find(
                (c: any) => c.columnIndex === columnIndex
              );
              return cell?.formula?.startsWith("=");
            });

            return hasFormulas ? { backgroundColor: "#fafbff" } : undefined;
          }}
        />
      </div>

      {showColorPicker && selectedCellInfo && (
        <ColorPicker
          isOpen={showColorPicker}
          currentColor={(() => {
            const changeKey = `${selectedCellInfo.rowIndex}-${getColumnIndex(
              selectedCellInfo.field
            )}`;
            const pendingChange = pendingChanges.get(changeKey);
            return pendingChange?.color || selectedCellInfo.currentColor;
          })()}
          currentValue={selectedCellInfo.currentValue}
          currentFormula={(() => {
            const changeKey = `${selectedCellInfo.rowIndex}-${getColumnIndex(
              selectedCellInfo.field
            )}`;
            const pendingChange = pendingChanges.get(changeKey);
            return pendingChange?.formula || selectedCellInfo.currentFormula;
          })()}
          cellPosition={{
            row: selectedCellInfo.rowIndex,
            column: selectedCellInfo.field,
            columnIndex: getColumnIndex(selectedCellInfo.field),
          }}
          sheetType="kahon"
          mode="color"
          onColorChange={handleColorChange}
          onFormulaApply={handleFormulaApply}
          onFormulaApplyToColumn={handleFormulaApplyToColumn}
          onClose={() => {
            setShowColorPicker(false);
          }}
        />
      )}

      {showFormulaPicker && selectedCellInfo && (
        <ColorPicker
          isOpen={showFormulaPicker}
          currentColor={(() => {
            const changeKey = `${selectedCellInfo.rowIndex}-${getColumnIndex(
              selectedCellInfo.field
            )}`;
            const pendingChange = pendingChanges.get(changeKey);
            return pendingChange?.color || selectedCellInfo.currentColor;
          })()}
          currentValue={selectedCellInfo.currentValue}
          currentFormula={(() => {
            const changeKey = `${selectedCellInfo.rowIndex}-${getColumnIndex(
              selectedCellInfo.field
            )}`;
            const pendingChange = pendingChanges.get(changeKey);
            return pendingChange?.formula || selectedCellInfo.currentFormula;
          })()}
          cellPosition={{
            row: selectedCellInfo.rowIndex,
            column: selectedCellInfo.field,
            columnIndex: getColumnIndex(selectedCellInfo.field),
          }}
          sheetType="kahon"
          mode="formula"
          onColorChange={handleColorChange}
          onFormulaApply={handleFormulaApply}
          onFormulaApplyToColumn={handleFormulaApplyToColumn}
          onClose={() => {
            setShowFormulaPicker(false);
          }}
        />
      )}

      {showAddRowsDialog && sheetData && (
        <AddRowsDialog
          isOpen={showAddRowsDialog}
          maxRowIndex={Math.max(...sheetData.Rows.map((r) => r.rowIndex), 0)}
          onAddRows={addMultipleRows}
          onClose={() => setShowAddRowsDialog(false)}
          sheetType="kahon"
        />
      )}

      {isLoading && (
        <div className="text-center text-gray-600 py-2">Saving changes...</div>
      )}
    </div>
  );
}
