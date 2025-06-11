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
  SheetWithData,
  AddCellType,
} from "../../../utils/types/kahon.type";
import { addKahonCalculationRow } from "@/lib/server/manageKahonRows";
import { addKahonCell, updateKahonCell } from "@/lib/server/manageCells";
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
  updateCellValueInSheetData,
} from "@/lib/utils/formulaParser";
import ColorPicker from "./ColorPicker";

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
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    cellId: string;
    rowIndex: number;
    field: string;
    currentColor?: string;
    currentValue?: string;
    currentFormula?: string;
  } | null>(null);

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
        const displayValue = getCellDisplayValue(
          cell,
          data,
          row.rowIndex,
          cell.columnIndex,
          "kahon" // Pass kahon sheet type explicitly
        );

        if (columnName in gridRow) {
          (gridRow as any)[columnName] = displayValue;
        }
      });

      rows.push(gridRow);
    });

    return rows;
  };

  const resolveFormulasOnInit = async () => {
    if (!sheetData) return;

    try {
      const updates = resolveAllFormulas(sheetData, "kahon");

      if (updates.length > 0) {
        console.log(`Resolving ${updates.length} formulas on initialization`);

        // Apply updates via API
        for (const update of updates) {
          await updateKahonCell(update.cellId, {
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
      {
        field: "Quantity",
        headerName: "Quantity",
        width: 120,
        editable: true,
        cellStyle: getCellStyleFunction("Quantity"),
      },
      {
        field: "Name",
        headerName: "Name",
        width: 200,
        editable: true,
        cellStyle: getCellStyleFunction("Name"),
      },
      {
        field: "A",
        headerName: "A",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("A"),
      },
      {
        field: "B",
        headerName: "B",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("B"),
      },
      {
        field: "C",
        headerName: "C",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("C"),
      },
      {
        field: "D",
        headerName: "D",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("D"),
      },
      {
        field: "E",
        headerName: "E",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("E"),
      },
      {
        field: "F",
        headerName: "F",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("F"),
      },
      {
        field: "G",
        headerName: "G",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("G"),
      },
      {
        field: "H",
        headerName: "H",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("H"),
      },
      {
        field: "I",
        headerName: "I",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("I"),
      },
      {
        field: "J",
        headerName: "J",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("J"),
      },
      {
        field: "K",
        headerName: "K",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("K"),
      },
      {
        field: "L",
        headerName: "L",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("L"),
      },
      {
        field: "M",
        headerName: "M",
        width: 80,
        editable: true,
        cellStyle: getCellStyleFunction("M"),
      },
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

    const { data, colDef, newValue, oldValue } = event;
    if (!data || !colDef?.field) return;

    // Skip if value hasn't actually changed
    if (newValue === oldValue) return;

    setIsLoading(true);

    try {
      const rowIndex = data.rowIndex;
      const field = colDef.field;
      const columnIndex = getColumnIndex(field);
      const changedCellRef = `${field}${rowIndex}`;

      const existingRow = sheetData?.Rows.find((r) => r.rowIndex === rowIndex);
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      let cellValue = newValue || "";
      let formula = undefined;

      if (cellValue && cellValue.startsWith("=")) {
        if (!isValidFormula(cellValue)) {
          alert("Invalid formula syntax");
          return;
        }
        formula = cellValue;
        cellValue = "0";
      }

      const cellData = {
        value: cellValue,
        formula: formula,
        color: existingCell?.color === null ? undefined : existingCell?.color,
      };

      // Update the primary cell
      if (existingCell) {
        await updateKahonCell(existingCell.id, cellData);
      } else if (existingRow) {
        await addKahonCell({
          rowId: existingRow.id,
          columnIndex: columnIndex,
          ...cellData,
        });
      } else {
        await addKahonCalculationRow({
          sheetId: sheetData?.id,
          rowIndex: rowIndex,
        });
        onRefresh();
        return;
      }

      // Find and update dependent cells
      const dependentCells = findDependentCells(changedCellRef, dependencyMap);

      if (dependentCells.length > 0) {
        console.log(`Updating ${dependentCells.length} dependent cells`);

        // Create updated sheet data for formula calculations
        let updatedSheetData = updateCellValueInSheetData(
          sheetData,
          rowIndex,
          columnIndex,
          formula ? "0" : cellValue
        );

        // Process dependent cells
        for (const depCellRef of dependentCells) {
          const depRow = parseInt(depCellRef.match(/\d+$/)?.[0] || "0");
          const depColumnName = depCellRef.replace(/\d+$/, "");
          const depColumnIndex = getColumnIndex(depColumnName);

          const depExistingRow = sheetData?.Rows.find(
            (r) => r.rowIndex === depRow
          );
          const depExistingCell = depExistingRow?.Cells.find(
            (c) => c.columnIndex === depColumnIndex
          );

          if (depExistingCell?.formula) {
            // Recalculate the dependent cell's value
            const newDepValue = getCellDisplayValue(
              depExistingCell,
              updatedSheetData,
              depRow,
              depColumnIndex,
              "kahon"
            );

            // Update the dependent cell
            await updateKahonCell(depExistingCell.id, {
              value: newDepValue,
              formula: depExistingCell.formula,
              color:
                depExistingCell.color === null
                  ? undefined
                  : depExistingCell.color,
            });

            // Update our local sheet data for subsequent calculations
            updatedSheetData = updateCellValueInSheetData(
              updatedSheetData,
              depRow,
              depColumnIndex,
              newDepValue
            );
          }
        }
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
      await addKahonCalculationRow({
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

  const handleColorChange = async (color: string) => {
    if (!selectedCellInfo) return;

    setIsLoading(true);
    try {
      const existingRow = sheetData?.Rows.find(
        (r) => r.rowIndex === selectedCellInfo.rowIndex
      );
      const columnIndex = getColumnIndex(selectedCellInfo.field);
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      if (existingCell) {
        await updateKahonCell(existingCell.id, {
          value: existingCell.value || "",
          formula: existingCell.formula || undefined,
          color: color || undefined, // Convert empty string to undefined
        });
      } else if (existingRow) {
        await addKahonCell({
          rowId: existingRow.id,
          columnIndex: columnIndex,
          value: selectedCellInfo.currentValue || "",
          color: color || undefined, // Convert empty string to undefined
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
      const columnIndex = getColumnIndex(selectedCellInfo.field);
      const existingCell = existingRow?.Cells.find(
        (c) => c.columnIndex === columnIndex
      );

      const cellData = {
        value: formula.startsWith("=") ? "0" : formula,
        formula: formula.startsWith("=") ? formula : undefined,
        color: existingCell?.color === null ? undefined : existingCell?.color,
      };

      if (existingCell) {
        await updateKahonCell(existingCell.id, cellData);
      } else if (existingRow) {
        await addKahonCell({
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
      const field = selectedCellInfo.field;

      // Get all rows sorted by row index
      const sortedRows = [...sheetData.Rows].sort(
        (a, b) => a.rowIndex - b.rowIndex
      );

      for (const row of sortedRows) {
        // Check if we need to verify numeric values for multiplication formulas
        if (baseFormula.includes("*")) {
          // For multiplication, check if the two left columns have valid data
          if (columnIndex < 2) continue; // Need at least 2 columns to the left

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
          if (firstHasValue || secondHasValue) {
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
              color:
                existingCell?.color === null ? undefined : existingCell?.color,
            };

            if (existingCell) {
              await updateKahonCell(existingCell.id, cellData);
            } else {
              await addKahonCell({
                rowId: row.id,
                columnIndex: columnIndex,
                ...cellData,
              });
            }
            formulasApplied++;
          }
        } else if (baseFormula.includes("+") && baseFormula.includes("Name")) {
          // For addition formulas that exclude Quantity column
          // Check if at least one of the two left cells has valid data
          if (columnIndex < 2) continue; // Need at least 2 columns to check

          const firstColumnIndex = columnIndex - 2;
          const secondColumnIndex = columnIndex - 1;

          const firstCell = row.Cells.find(
            (c) => c.columnIndex === firstColumnIndex
          );
          const secondCell = row.Cells.find(
            (c) => c.columnIndex === secondColumnIndex
          );

          // Check if at least one of the two left cells has valid data
          let hasValidData = false;

          // For first cell (could be Quantity, Name, or A, B, C...)
          if (firstCell?.value && firstCell.value.trim() !== "") {
            // For Name column (index 1), any non-empty value is valid
            // For other columns, check if it's numeric or if it's Quantity column
            if (
              firstColumnIndex === 1 ||
              firstColumnIndex === 0 ||
              !isNaN(parseFloat(firstCell.value))
            ) {
              hasValidData = true;
            }
          }

          // For second cell (could be Name or A, B, C...)
          if (
            !hasValidData &&
            secondCell?.value &&
            secondCell.value.trim() !== ""
          ) {
            // For Name column (index 1), any non-empty value is valid
            // For other columns, check if it's numeric or if it's Quantity column
            if (
              secondColumnIndex === 1 ||
              secondColumnIndex === 0 ||
              !isNaN(parseFloat(secondCell.value))
            ) {
              hasValidData = true;
            }
          }

          if (hasValidData) {
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
              color:
                existingCell?.color === null ? undefined : existingCell?.color,
            };

            if (existingCell) {
              await updateKahonCell(existingCell.id, cellData);
            } else {
              await addKahonCell({
                rowId: row.id,
                columnIndex: columnIndex,
                ...cellData,
              });
            }
            formulasApplied++;
          }
        } else {
          // For other formulas, apply to all rows
          let rowFormula = baseFormula.replace(/\d+/g, row.rowIndex.toString());

          const existingCell = row.Cells.find(
            (c) => c.columnIndex === columnIndex
          );
          const cellData = {
            value: "0",
            formula: rowFormula,
            color:
              existingCell?.color === null ? undefined : existingCell?.color,
          };

          if (existingCell) {
            await updateKahonCell(existingCell.id, cellData);
          } else {
            await addKahonCell({
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
        alert("No valid data found for formula application");
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
        <h3 className="text-lg font-semibold">Kahon Sheet</h3>
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

      {showCellEditor && selectedCellInfo && (
        <ColorPicker
          isOpen={showCellEditor}
          currentColor={selectedCellInfo.currentColor}
          currentValue={selectedCellInfo.currentValue}
          currentFormula={selectedCellInfo.currentFormula}
          cellPosition={{
            row: selectedCellInfo.rowIndex,
            column: selectedCellInfo.field,
            columnIndex: getColumnIndex(selectedCellInfo.field),
          }}
          sheetType="kahon"
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
