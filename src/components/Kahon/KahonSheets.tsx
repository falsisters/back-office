"use client";

import React, { useState, useEffect, useRef } from "react";
import { DateRangePicker } from "./DateRangePicker";
import { getUserSheetsByDate } from "@/lib/server/getSheetsByDateRange";
import { SaveChangesModal } from "./SaveChangesModal";
import { SheetToolbar } from "./SheetToolbar";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { DateRange } from "react-day-picker";
import { useKahon } from "@/context/KahonContext";
import { AddCalculationRowButton } from "./AddCalculationRowButton";
import { BatchCellEditor } from "./BatchCellEditor";
import { Loader2 } from "lucide-react";
import { SheetEmptyState } from "./SheetEmptyState";
import {
  parseFormula,
  getCellReference,
  createSumColumnAbove,
  createSumRowLeft,
  createMultiplyRow,
  createAddRow,
} from "@/utils/formulaUtils";
import { toast } from "sonner";
import type {
  GetUserSheetsByDatePayload,
  GetUserSheetsByDateParams,
} from "../../../utils/types/getSheetsByDateRange.type";
import type { EditCellsPayload } from "../../../utils/types/sheet.type";

// Custom CSS for cell colors
const injectCellColorStyles = () => {
  if (
    typeof document !== "undefined" &&
    !document.getElementById("cell-color-styles")
  ) {
    const style = document.createElement("style");
    style.id = "cell-color-styles";
    style.textContent = `
      .jexcel_content td[data-cell-color] {
        background-color: var(--cell-bg-color) !important;
      }
      .jexcel_content td.formula-cell {
        font-style: italic;
        position: relative;
      }
      .jexcel_content td.formula-cell::before {
        content: "f";
        position: absolute;
        top: 2px;
        left: 2px;
        font-size: 8px;
        color: #666;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }
};

export default function KahonSheets() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  // Update type usage
  const [sheetData, setSheetData] = useState<GetUserSheetsByDatePayload | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedCells, setSelectedCells] = useState<
    Array<{ col: number; row: number; cellId: string }>
  >([]);
  const spreadsheetRef = useRef<any>(null);
  const spreadsheetElementRef = useRef<HTMLDivElement>(null);

  const {
    selectedSheet,
    setSelectedSheet,
    addCalculationRow,
    updateCells,
    loadingOperations,
  } = useKahon();

  // Inject styles on component mount
  useEffect(() => {
    injectCellColorStyles();
  }, []);

  const applyCellColor = (element: HTMLElement, color: string) => {
    if (color && color.startsWith("#")) {
      element.style.setProperty("--cell-bg-color", color);
      element.setAttribute("data-cell-color", color);
    }
  };

  const markFormulaCell = (element: HTMLElement, hasFormula: boolean) => {
    if (hasFormula) {
      element.classList.add("formula-cell");
    } else {
      element.classList.remove("formula-cell");
    }
  };

  // Enhanced formula application functions
  const applyFormulaToSelection = async (formulaType: string) => {
    if (selectedCells.length === 0) {
      toast.error("No cells selected");
      return;
    }

    const cellToUpdate = selectedCells[0];
    const { col, row, cellId } = cellToUpdate;

    let formula = "";
    let description = "";

    switch (formulaType) {
      case "sum-column-above":
        formula = createSumColumnAbove(col, row);
        description = "Sum column above";
        break;
      case "sum-row-left":
        formula = createSumRowLeft(col, row);
        description = "Sum row left";
        break;
      case "add-above":
        if (row === 0) {
          toast.error("No cell above to reference");
          return;
        }
        formula = `=${getCellReference(col, row - 1)}`;
        description = "Reference cell above";
        break;
      case "add-left":
        if (col === 0) {
          toast.error("No cell to the left to reference");
          return;
        }
        formula = `=${getCellReference(col - 1, row)}`;
        description = "Reference cell left";
        break;
      case "multiply-left-two":
        if (col < 2) {
          toast.error("Need at least 2 cells to the left");
          return;
        }
        formula = createMultiplyRow(col - 2, col - 1, row);
        description = "Multiply two cells left";
        break;
      case "add-all-vertical":
        formula = createSumColumnAbove(col, row);
        description = "Sum all cells above";
        break;
      case "multiply-all-rows":
        if (col < 2) {
          toast.error("Need at least column C for row multiplication");
          return;
        }
        formula = createMultiplyRow(2, 4, row); // Columns C, D, E
        description = "Multiply row cells";
        break;
      case "add-all-rows":
        if (col < 2) {
          toast.error("Need at least column C for row addition");
          return;
        }
        formula = createAddRow(2, 4, row); // Columns C, D, E
        description = "Add row cells";
        break;
      default:
        toast.error("Invalid formula type");
        return;
    }

    if (!formula) {
      toast.error(`Cannot create ${description.toLowerCase()}`);
      return;
    }

    try {
      await updateCells({
        cells: [{ id: cellId, value: "", formula: formula }],
      });
      toast.success(`Applied ${description}`);
    } catch (error) {
      toast.error("Failed to apply formula");
    }
  };
  // New function to apply colors to selection
  const applyColorToSelection = async (color: string) => {
    if (selectedCells.length === 0) {
      toast.error("No cells selected");
      return;
    }

    try {
      const cellUpdates = selectedCells.map(({ cellId }) => {
        // Find the current value from sheetData instead of DOM textContent
        let currentValue = "";

        // Find the cell in sheetData by ID
        for (const row of sheetData?.Rows || []) {
          for (const cell of row.Cells || []) {
            if (cell.id === cellId) {
              // If it's a formula cell, use the evaluated value, otherwise use the raw value
              currentValue =
                cell.formula && cell.formula.startsWith("=")
                  ? cell.value || ""
                  : cell.value || "";
              break;
            }
          }
          if (currentValue !== "") break;
        }

        return {
          id: cellId,
          value: currentValue,
          color: color,
        };
      });

      await updateCells({ cells: cellUpdates });

      // Apply color immediately
      selectedCells.forEach(({ cellId }) => {
        const cellElement = document.getElementById(cellId);
        if (cellElement) {
          applyCellColor(cellElement, color);
        }
      });

      toast.success(`Applied color to ${selectedCells.length} cell(s)`);
    } catch (error) {
      toast.error("Failed to apply color");
    }
  };
  // Helper functions for context menu actions
  const applyColorToCells = async (
    cells: Array<{ cellId: string }>,
    color: string
  ) => {
    try {
      const cellUpdates = cells.map(({ cellId }) => {
        // Find the current value from sheetData instead of DOM textContent
        let currentValue = "";

        // Find the cell in sheetData by ID
        for (const row of sheetData?.Rows || []) {
          for (const cell of row.Cells || []) {
            if (cell.id === cellId) {
              // If it's a formula cell, use the evaluated value, otherwise use the raw value
              currentValue =
                cell.formula && cell.formula.startsWith("=")
                  ? cell.value || ""
                  : cell.value || "";
              break;
            }
          }
          if (currentValue !== "") break;
        }

        return {
          id: cellId,
          value: currentValue,
          color: color,
        };
      });

      await updateCells({ cells: cellUpdates });

      cells.forEach(({ cellId }) => {
        const cellElement = document.getElementById(cellId);
        if (cellElement) {
          applyCellColor(cellElement, color);
        }
      });

      toast.success(`Applied color to ${cells.length} cell(s)`);
    } catch (error) {
      toast.error("Failed to apply color");
    }
  };
  const removeColorFromCells = async (cells: Array<{ cellId: string }>) => {
    try {
      const cellUpdates = cells.map(({ cellId }) => {
        // Find the current value from sheetData instead of DOM textContent
        let currentValue = "";

        // Find the cell in sheetData by ID
        for (const row of sheetData?.Rows || []) {
          for (const cell of row.Cells || []) {
            if (cell.id === cellId) {
              // If it's a formula cell, use the evaluated value, otherwise use the raw value
              currentValue =
                cell.formula && cell.formula.startsWith("=")
                  ? cell.value || ""
                  : cell.value || "";
              break;
            }
          }
          if (currentValue !== "") break;
        }

        return {
          id: cellId,
          value: currentValue,
          color: undefined,
        };
      });

      await updateCells({ cells: cellUpdates });

      cells.forEach(({ cellId }) => {
        const cellElement = document.getElementById(cellId);
        if (cellElement) {
          cellElement.style.removeProperty("--cell-bg-color");
          cellElement.removeAttribute("data-cell-color");
        }
      });

      toast.success(`Removed color from ${cells.length} cell(s)`);
    } catch (error) {
      toast.error("Failed to remove color");
    }
  };

  const initializeSpreadsheet = React.useCallback(
    (sheetData: NonNullable<GetUserSheetsByDatePayload>) => {
      if (spreadsheetElementRef.current) {
        spreadsheetElementRef.current.innerHTML = "";
      }

      if (spreadsheetRef.current) {
        try {
          spreadsheetRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying spreadsheet:", error);
        }
        spreadsheetRef.current = null;
      }
      const data = sheetData.Rows.map((row: any) => {
        return row.Cells.sort((a: any, b: any) => a.columnIndex - b.columnIndex)
          .slice(0, 5)
          .map((cell: any) => {
            // If cell has formula, show the stored value (which should be the evaluated result)
            if (cell.formula && cell.formula.startsWith("=")) {
              // Return the stored value, not re-evaluate the formula
              return cell.value || "";
            }
            return cell.value || "";
          });
      });

      const columns = [
        {
          type: "text" as const,
          width: 150,
          title: "Quantity",
          name: "quantity",
        },
        { type: "text" as const, width: 400, title: "Name", name: "name" },
        { type: "text" as const, width: 200, title: "C", name: "col_c" },
        { type: "text" as const, width: 200, title: "D", name: "col_d" },
        { type: "text" as const, width: 200, title: "E", name: "col_e" },
      ];

      const options = {
        data: data,
        columns: columns,
        allowExport: true,
        allowInsertColumn: false,
        allowInsertRow: true,
        allowDeleteColumn: false,
        allowDeleteRow: true,
        editable: true,
        tableOverflow: true,
        tableWidth: "100%",
        tableHeight: "600px",
        minDimensions: [5, Math.max(data.length + 5, 20)] as [number, number],
        style: {
          fontSize: "14px",
        },
        onchange: (
          instance: any,
          cell: HTMLTableCellElement,
          colIndex: string | number,
          rowIndex: string | number,
          newValue: any,
          oldValue: any
        ) => {
          const col =
            typeof colIndex === "string" ? parseInt(colIndex, 10) : colIndex;
          const row =
            typeof rowIndex === "string" ? parseInt(rowIndex, 10) : rowIndex;

          const targetCell = sheetData?.Rows?.[row]?.Cells?.find(
            (cell) => cell.columnIndex === col
          );
          const cellId = targetCell?.id;

          if (cellId) {
            const isFormula = newValue.toString().startsWith("=");
            const cellData: EditCellsPayload["cells"][0] = {
              id: cellId,
              value: String(newValue || ""),
            };
            if (isFormula) {
              cellData.formula = newValue;
              // Don't evaluate formulas on the frontend - let the backend handle it
              // The backend will evaluate and store the result
              cellData.value = ""; // Clear value, backend will populate with evaluated result

              // Mark as formula cell for styling
              setTimeout(() => {
                try {
                  markFormulaCell(cell, true);
                } catch (error) {
                  console.error("Error marking formula cell:", error);
                }
              }, 10);
            } else {
              markFormulaCell(cell, false);
            }

            updateCells({
              cells: [cellData],
            }).then(() => {
              if (isFormula) {
                const currentCellRef = getCellReference(col, row);
                updateDependentCells(
                  spreadsheetRef.current,
                  sheetData,
                  currentCellRef
                );
              }
            });
          }
        },
        updateTable: (
          instance: any,
          cell: HTMLTableCellElement,
          col: number,
          row: number,
          value: any
        ) => {
          const cellData = sheetData?.Rows?.[row]?.Cells?.find(
            (c) => c.columnIndex === col
          );

          if (cellData) {
            // Apply cell color if it exists
            if (cellData.color) {
              applyCellColor(cell, cellData.color);
            }

            // Mark formula cells and show stored evaluated result
            if (cellData.formula && cellData.formula.startsWith("=")) {
              markFormulaCell(cell, true);
              // Return the stored value (which should be the evaluated result)
              return cellData.value || "";
            }
          }

          return value;
        },
        updateCell: (
          instance: any,
          cell: HTMLTableCellElement,
          x: number,
          y: number,
          value: string
        ) => {
          const cellData = sheetData?.Rows?.[y]?.Cells?.find(
            (c) => c.columnIndex === x
          );

          if (cellData?.id) {
            cell.setAttribute("id", cellData.id);
          }

          if (cellData) {
            // Apply cell background color
            if (cellData.color) {
              applyCellColor(cell, cellData.color);
            }

            // Mark formula cells
            if (cellData.formula && cellData.formula.startsWith("=")) {
              markFormulaCell(cell, true);
            }
          }

          return value;
        },
        onload: (instance: any) => {
          // Set cell IDs and apply styling after the spreadsheet is loaded
          sheetData.Rows.forEach((row: any, y: number) => {
            row.Cells.forEach((cell: any) => {
              // Use setTimeout to ensure DOM is ready and access cells directly from DOM
              setTimeout(() => {
                const cellElement =
                  spreadsheetElementRef.current?.querySelector(
                    `tbody tr:nth-child(${y + 1}) td:nth-child(${
                      cell.columnIndex + 1
                    })`
                  ) as HTMLElement;

                if (cellElement && cell.id) {
                  cellElement.setAttribute("id", cell.id);

                  // Apply cell color
                  if (cell.color) {
                    applyCellColor(cellElement, cell.color);
                  } // Mark formula cells and show stored evaluated result
                  if (cell.formula && cell.formula.startsWith("=")) {
                    markFormulaCell(cellElement, true);
                    // Show the stored value (which should be the evaluated result)
                    if (
                      spreadsheetRef.current &&
                      spreadsheetRef.current.setValueFromCoords
                    ) {
                      // Use the stored value, don't re-evaluate
                      const displayValue = cell.value || "";
                      spreadsheetRef.current.setValueFromCoords(
                        cell.columnIndex,
                        y,
                        displayValue,
                        true
                      );
                    }
                  }
                }
              }, 50);
            });
          });
        },

        // Enhanced context menu
        contextMenu: function (
          instance: any,
          colIndex: string | null,
          rowIndex: string | null,
          event: PointerEvent
        ) {
          // Prevent default context menu behavior
          event.preventDefault();
          event.stopPropagation();

          const x = colIndex ? parseInt(colIndex, 10) : 0;
          const y = rowIndex ? parseInt(rowIndex, 10) : 0;

          // Get the actual clicked cell element
          const clickedCell = event.target as HTMLElement;
          const actualCell = clickedCell.closest("td") as HTMLElement;

          // Capture current selection without triggering updates
          const currentSelectedCells: Array<{
            col: number;
            row: number;
            cellId: string;
          }> = [];

          const selectedElements =
            document.querySelectorAll(".jexcel_selected");
          selectedElements.forEach((element: Element) => {
            const cellElement = element as HTMLElement;
            const col = parseInt(cellElement.getAttribute("data-x") || "0");
            const row = parseInt(cellElement.getAttribute("data-y") || "0");
            const cellId = cellElement.getAttribute("id");

            if (cellId) {
              currentSelectedCells.push({ col, row, cellId });
            }
          }); // Store selection for use in menu actions - use actual clicked cell if no selection
          const menuSelectedCells =
            currentSelectedCells.length > 0
              ? currentSelectedCells
              : actualCell?.getAttribute("id")
              ? [
                  {
                    col: x,
                    row: y,
                    cellId: actualCell.getAttribute("id") || "",
                  },
                ]
              : [
                  {
                    col: x,
                    row: y,
                    cellId:
                      sheetData?.Rows?.[y]?.Cells?.find(
                        (cell) => cell.columnIndex === x
                      )?.id || "",
                  },
                ];

          const items: object[] = [
            {
              title: `Selected: ${getCellReference(x, y)}`,
              onclick: () => {},
              disabled: true,
            },
            { type: "line" },
            {
              title: "Quick Formulas",
              submenu: [
                {
                  title: "Sum Column Above",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "sum-column-above"),
                  disabled: y === 0,
                },
                {
                  title: "Sum Row Left",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "sum-row-left"),
                  disabled: x === 0,
                },
                {
                  title: "Reference Cell Above",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "add-above"),
                  disabled: y === 0,
                },
                {
                  title: "Reference Cell Left",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "add-left"),
                  disabled: x === 0,
                },
                {
                  title: "Multiply Left Two",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "multiply-left-two"),
                  disabled: x < 2,
                },
                { type: "line" },
                {
                  title: "Multiply Row (C×D×E)",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "multiply-all-rows"),
                  disabled: x < 2,
                },
                {
                  title: "Add Row (C+D+E)",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "add-all-rows"),
                  disabled: x < 2,
                },
              ],
            },
            { type: "line" },
            {
              title: "Cell Colors",
              submenu: [
                {
                  title: "🟡 Light Yellow",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#fffacd"),
                },
                {
                  title: "🔵 Light Blue",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#e6f3ff"),
                },
                {
                  title: "🟢 Light Green",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#e6ffe6"),
                },
                {
                  title: "🌸 Light Pink",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#ffe6f3"),
                },
                {
                  title: "🟠 Light Orange",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#ffe6cc"),
                },
                {
                  title: "🟣 Light Purple",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#f3e6ff"),
                },
                {
                  title: "⚫ Light Gray",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#f0f0f0"),
                },
                {
                  title: "⚪ White",
                  onclick: () =>
                    applyColorToCells(menuSelectedCells, "#ffffff"),
                },
                { type: "line" },
                {
                  title: "Remove Color",
                  onclick: () => removeColorFromCells(menuSelectedCells),
                },
              ],
            },
          ];

          return items;
        },

        // Enhanced selection tracking
        onselection: function (
          obj: any,
          x1: number,
          y1: number,
          x2: number,
          y2: number
        ) {
          // Track selected cells for better management
          const newSelectedCells: Array<{
            col: number;
            row: number;
            cellId: string;
          }> = [];
          for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
              const cellData = sheetData?.Rows?.[y]?.Cells?.find(
                (cell) => cell.columnIndex === x
              );
              if (cellData?.id) {
                newSelectedCells.push({ col: x, row: y, cellId: cellData.id });
              }
            }
          }

          setSelectedCells(newSelectedCells);
        },

        // ...rest of existing options...
      };

      setTimeout(() => {
        if (spreadsheetElementRef.current) {
          try {
            const instance = jspreadsheet(
              spreadsheetElementRef.current,
              options
            );
            spreadsheetRef.current = instance;
            setSelectedSheet(sheetData.id);
          } catch (error) {
            console.error("Error initializing spreadsheet:", error);
          }
        }
      }, 100);
    },
    [updateCells, setSelectedSheet]
  );

  // Helper function for quick formulas from context menu
  const applyQuickFormula = async (
    cells: Array<{ col: number; row: number; cellId: string }>,
    formulaType: string
  ) => {
    if (cells.length === 0) return;

    const cell = cells[0]; // Apply to first selected cell
    const { col, row, cellId } = cell;

    let formula = "";

    switch (formulaType) {
      case "sum-column-above":
        formula = createSumColumnAbove(col, row);
        break;
      case "sum-row-left":
        formula = createSumRowLeft(col, row);
        break;
      case "add-above":
        formula = `=${getCellReference(col, row - 1)}`;
        break;
      case "add-left":
        formula = `=${getCellReference(col - 1, row)}`;
        break;
      case "multiply-left-two":
        formula = createMultiplyRow(col - 2, col - 1, row);
        break;
      case "multiply-all-rows":
        formula = createMultiplyRow(2, 4, row);
        break;
      case "add-all-rows":
        formula = createAddRow(2, 4, row);
        break;
    }

    if (formula) {
      try {
        await updateCells({
          cells: [{ id: cellId, value: "", formula: formula }],
        });
        toast.success("Formula applied successfully");
      } catch (error) {
        toast.error("Failed to apply formula");
      }
    }
  };
  const updateDependentCells = (
    instance: any,
    sheetData: any,
    changedCellRef: string
  ) => {
    if (!instance || !instance.setValueFromCoords) {
      console.warn("Spreadsheet instance not ready for dependent cell updates");
      return;
    }
    sheetData.Rows.forEach((row: any, rowIndex: number) => {
      row.Cells.forEach((cell: any) => {
        if (cell.formula && cell.formula.startsWith("=")) {
          const cellRefs = parseFormula(cell.formula);
          if (cellRefs.includes(changedCellRef)) {
            setTimeout(() => {
              try {
                // Use stored evaluated result instead of re-evaluating
                const storedValue =
                  cell.evaluatedValue !== undefined
                    ? cell.evaluatedValue
                    : cell.value;
                if (instance.setValueFromCoords) {
                  instance.setValueFromCoords(
                    cell.columnIndex,
                    rowIndex,
                    storedValue?.toString() || "",
                    true
                  );
                }
              } catch (error) {
                console.error("Error updating dependent cell:", error);
              }
            }, 20);
          }
        }
      });
    });
  };

  const fetchSheetsData = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    try {
      const params: GetUserSheetsByDateParams = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      };

      const response = await getUserSheetsByDate(params);

      if (response) {
        setSheetData(response);
        initializeSpreadsheet(response);
      } else {
        setSheetData(null);
      }
    } catch (error) {
      console.error("Failed to fetch sheets:", error);
      setSheetData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, initializeSpreadsheet]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchSheetsData();
    }
  }, [dateRange, fetchSheetsData]);

  useEffect(() => {
    return () => {
      if (spreadsheetRef.current) {
        try {
          spreadsheetRef.current.destroy();
        } catch (error) {
          console.warn("Error cleaning up spreadsheet:", error);
        }
      }
    };
  }, []);

  const handleSaveChanges = () => {
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (spreadsheetRef.current) {
      const data = spreadsheetRef.current.getData();
      console.log("Spreadsheet data to save:", data);
      // Implement save logic here
    }
    setIsSaveModalOpen(false);
  };

  const totalRows = sheetData?.Rows.length || 0;

  return (
    <div className="space-y-6">
      <SheetToolbar
        mode="kahon"
        dateRange={dateRange}
        loading={loading || loadingOperations}
        onRefresh={fetchSheetsData}
        onSave={() => setIsSaveModalOpen(true)}
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <div className="flex gap-2">
          {/* TODO: Enable in next release - AddCalculationRowButton still buggy */}
          <BatchCellEditor mode={"kahon"} />
          {selectedCells.length > 0 && (
            <div className="text-sm text-muted-foreground bg-blue-50 px-3 py-1 rounded">
              {selectedCells.length} cell(s) selected • Right-click for options
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary font-medium">Loading data...</span>
        </div>
      ) : !sheetData && dateRange?.from && dateRange?.to ? (
        <SheetEmptyState
          mode="kahon"
          message="No data found for the selected date range. Please try a different date range."
        />
      ) : !dateRange?.from || !dateRange?.to ? (
        <SheetEmptyState
          mode="kahon"
          message="Please select a date range to view sheets"
        />
      ) : (
        <Card className="w-full shadow-md overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-primary text-xl">
              Sheet Details
            </CardTitle>
            <CardDescription>
              {sheetData?.name} • {totalRows} rows
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 overflow-x-auto">
              <div
                ref={spreadsheetElementRef}
                id="spreadsheet"
                className="w-full"
                style={{
                  minHeight: "600px",
                  width: "100%",
                  display: "block",
                  overflow: "visible",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <SaveChangesModal
        open={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
        onConfirm={handleConfirmSave}
        loading={loading || loadingOperations}
      />
    </div>
  );
}
