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
import { AddItemRowModal } from "./AddItemRowModal";
import { AddCalculationRowButton } from "./AddCalculationRowButton";
import { BatchCellEditor } from "./BatchCellEditor";
import { Loader2 } from "lucide-react";
import { KahonFormulas } from "./KahonFormulas";
import { SheetEmptyState } from "./SheetEmptyState";
import {
  evaluateFormula,
  parseFormula,
  parseCellReference,
  getCellReference,
} from "@/utils/formulaUtils";
import { CellColorPicker } from "./CellColorPicker";
import { toast } from "sonner";

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
  const [sheetData, setSheetData] = useState<any>(null);
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
    addItemRow,
    addCalculationRow,
    updateCells,
    deleteRow,
    loadingOperations,
  } = useKahon();

  // Inject styles on component mount
  useEffect(() => {
    injectCellColorStyles();
  }, []);

  const getCellValue = (col: number, row: number): string | number => {
    if (!sheetData?.Rows?.[row]?.Cells?.[col]) return "";
    const cell = sheetData.Rows[row].Cells[col];
    return cell.value || "";
  };

  const evaluateCellFormula = (formula: string): number | string => {
    return evaluateFormula(formula, getCellValue);
  };

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

  // New function to apply formulas
  const applyFormulaToSelection = async (formulaType: string) => {
    if (selectedCells.length === 0) {
      toast.error("No cells selected");
      return;
    }

    const cellToUpdate = selectedCells[0]; // Use first selected cell
    const { col, row, cellId } = cellToUpdate;

    let formula = "";
    let description = "";
    const maxCols = 5;

    switch (formulaType) {
      case "add-all-vertical":
        if (row === 0) {
          toast.error("No cells above to sum");
          return;
        }
        const allCellsAbove = Array.from({ length: row }, (_, i) =>
          getCellReference(col, i)
        ).join("+");
        formula = `=${allCellsAbove}`;
        description = "Sum of all cells above";
        break;
      case "add-vertical":
        if (row === 0) {
          toast.error("No cells above to add");
          return;
        }
        const cellsToAdd = Array.from({ length: row }, (_, i) =>
          getCellReference(col, i)
        ).join("+");
        formula = `=${cellsToAdd}`;
        description = "Addition of all cells above";
        break;
      case "multiply-all-rows":
        if (col === 0) {
          toast.error("No cells to the left to multiply");
          return;
        }
        const allCellsInRow = Array.from({ length: maxCols }, (_, i) =>
          getCellReference(i, row)
        ).join("*");
        formula = `=${allCellsInRow}`;
        description = "Multiplication of all cells in the row";
        break;
      case "subtract-vertical":
        if (row === 0) {
          toast.error("No cells above to subtract");
          return;
        }
        const allCellsBelow = Array.from({ length: row }, (_, i) =>
          getCellReference(col, i)
        ).join("-");
        formula = `=${allCellsBelow}`;
        description = "Subtraction of all cells above";
        break;
      case "add-all-rows":
        if (col === 0) {
          toast.error("No cells to the left to add");
          return;
        }
        const allCellsInColumn = Array.from({ length: maxCols }, (_, i) =>
          getCellReference(col, i)
        ).join("+");
        formula = `=${allCellsInColumn}`;
        description = "Addition of all cells in the column";
        break;
      case "multiply-left":
        if (col === 0) {
          toast.error("No cells to the left to multiply");
          return;
        }
        const leftCells = Array.from({ length: maxCols }, (_, i) =>
          getCellReference(col - 1, i)
        ).join("*");
        formula = `=${leftCells}`;
        description = "Multiplication of all cells to the left";
        break;
      default:
        toast.error("Invalid formula type");
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
        const cellElement = document.getElementById(cellId);
        return {
          id: cellId,
          value: cellElement?.textContent || "",
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

  const initializeSpreadsheet = React.useCallback(
    (sheetData: any) => {
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
            // If cell has formula, evaluate it and show result
            if (cell.formula && cell.formula.startsWith("=")) {
              const result = evaluateCellFormula(cell.formula);
              return result.toString();
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
          const cellId = sheetData?.Rows?.[row]?.Cells?.[col]?.id;

          if (cellId) {
            const isFormula = newValue.toString().startsWith("=");
            const cellData: any = {
              id: cellId,
              value: String(newValue || ""), // Always send the actual value
            };

            if (isFormula) {
              cellData.formula = newValue;
              // For formulas, evaluate them and set both formula and calculated value
              try {
                const result = evaluateCellFormula(newValue);
                cellData.value = result.toString(); // Set the calculated result as value

                // Update display immediately
                setTimeout(() => {
                  try {
                    if (
                      spreadsheetRef.current &&
                      spreadsheetRef.current.setValueFromCoords
                    ) {
                      spreadsheetRef.current.setValueFromCoords(
                        col,
                        row,
                        result.toString(),
                        true
                      );
                    }
                    markFormulaCell(cell, true);
                  } catch (error) {
                    console.error(
                      "Error updating formula cell display:",
                      error
                    );
                  }
                }, 10);
              } catch (evalError) {
                console.error("Formula evaluation error:", evalError);
                cellData.value = "#ERROR!";
              }
            } else {
              markFormulaCell(cell, false);
            }

            updateCells({
              cells: [cellData],
            }).then(() => {
              // Update dependent cells
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
          const cellData = sheetData?.Rows?.[row]?.Cells?.[col];

          if (cellData) {
            // Apply cell color if it exists
            if (cellData.color) {
              applyCellColor(cell, cellData.color);
            }

            // Mark formula cells
            if (cellData.formula && cellData.formula.startsWith("=")) {
              markFormulaCell(cell, true);
              // Show evaluated result instead of formula
              const result = evaluateCellFormula(cellData.formula);
              return result.toString();
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
          const cellId = sheetData?.Rows?.[y]?.Cells?.[x]?.id;
          const cellData = sheetData?.Rows?.[y]?.Cells?.[x];

          if (cellId) {
            cell.setAttribute("id", cellId);
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
            row.Cells.forEach((cell: any, x: number) => {
              // Use setTimeout to ensure DOM is ready and access cells directly from DOM
              setTimeout(() => {
                const cellElement =
                  spreadsheetElementRef.current?.querySelector(
                    `tbody tr:nth-child(${y + 1}) td:nth-child(${x + 1})`
                  ) as HTMLElement;

                if (cellElement && cell.id) {
                  cellElement.setAttribute("id", cell.id);

                  // Apply cell color
                  if (cell.color) {
                    applyCellColor(cellElement, cell.color);
                  }

                  // Mark formula cells and evaluate them
                  if (cell.formula && cell.formula.startsWith("=")) {
                    markFormulaCell(cellElement, true);
                    const result = evaluateCellFormula(cell.formula);
                    // Use the spreadsheetRef instead of instance parameter
                    if (
                      spreadsheetRef.current &&
                      spreadsheetRef.current.setValueFromCoords
                    ) {
                      spreadsheetRef.current.setValueFromCoords(
                        x,
                        y,
                        result.toString(),
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
          // Convert string indices to numbers, handle null values
          const x = colIndex ? parseInt(colIndex, 10) : 0;
          const y = rowIndex ? parseInt(rowIndex, 10) : 0;

          // Update selected cells when context menu opens
          const newSelectedCells: Array<{
            col: number;
            row: number;
            cellId: string;
          }> = [];

          // Get currently selected cells
          const selectedElements =
            document.querySelectorAll(".jexcel_selected");
          selectedElements.forEach((element: Element) => {
            const col = parseInt(element.getAttribute("data-x") || "0");
            const row = parseInt(element.getAttribute("data-y") || "0");
            const cellElement = element.closest("td") as HTMLElement;
            const cellId = cellElement?.getAttribute("id");

            if (cellId) {
              newSelectedCells.push({ col, row, cellId });
            }
          });

          setSelectedCells(newSelectedCells);

          // Create custom context menu items
          const items: object[] = [
            {
              title: "Insert row",
              onclick: () => {
                if (instance && instance.insertRow) {
                  instance.insertRow(y);
                }
              },
            },
            {
              title: "Delete row",
              onclick: () => {
                if (instance && instance.deleteRow) {
                  instance.deleteRow(y);
                }
              },
            },
            {
              title: "Insert column",
              onclick: () => {
                if (instance && instance.insertColumn) {
                  instance.insertColumn(x);
                }
              },
            },
            {
              title: "Delete column",
              onclick: () => {
                if (instance && instance.deleteColumn) {
                  instance.deleteColumn(x);
                }
              },
            },
            { type: "line" },
            {
              title: "Quick Formulas",
              submenu: [
                {
                  title: "Add All Vertical Cells",
                  onclick: () => applyFormulaToSelection("add-all-vertical"),
                },
                {
                  title: "Add Vertical Cells",
                  onclick: () => applyFormulaToSelection("add-vertical"),
                },
                {
                  title: "Multiply All Row Cells",
                  onclick: () => applyFormulaToSelection("multiply-all-rows"),
                },
                {
                  title: "Subtract Vertical Cells",
                  onclick: () => applyFormulaToSelection("subtract-vertical"),
                },
                {
                  title: "Add All Row Cells",
                  onclick: () => applyFormulaToSelection("add-all-rows"),
                },
                {
                  title: "Multiply Left Cells",
                  onclick: () => applyFormulaToSelection("multiply-left"),
                },
              ],
            },
            {
              title: "Cell Colors",
              submenu: [
                {
                  title: "🟡 Light Yellow",
                  onclick: () => applyColorToSelection("#fffacd"),
                },
                {
                  title: "🔵 Light Blue",
                  onclick: () => applyColorToSelection("#e6f3ff"),
                },
                {
                  title: "🟢 Light Green",
                  onclick: () => applyColorToSelection("#e6ffe6"),
                },
                {
                  title: "🌸 Light Pink",
                  onclick: () => applyColorToSelection("#ffe6f3"),
                },
                {
                  title: "🟠 Light Orange",
                  onclick: () => applyColorToSelection("#ffe6cc"),
                },
                {
                  title: "🟣 Light Purple",
                  onclick: () => applyColorToSelection("#f3e6ff"),
                },
                {
                  title: "⚫ Light Gray",
                  onclick: () => applyColorToSelection("#f0f0f0"),
                },
                {
                  title: "⚪ White",
                  onclick: () => applyColorToSelection("#ffffff"),
                },
                { type: "line" },
                {
                  title: "Remove Color",
                  onclick: async () => {
                    if (selectedCells.length === 0) return;
                    try {
                      const cellUpdates = selectedCells.map(({ cellId }) => {
                        const cellElement = document.getElementById(cellId);
                        return {
                          id: cellId,
                          value: cellElement?.textContent || "",
                          color: undefined,
                        };
                      });
                      await updateCells({ cells: cellUpdates });
                      selectedCells.forEach(({ cellId }) => {
                        const cellElement = document.getElementById(cellId);
                        if (cellElement) {
                          cellElement.style.removeProperty("--cell-bg-color");
                          cellElement.removeAttribute("data-cell-color");
                        }
                      });
                      toast.success(
                        `Removed color from ${selectedCells.length} cell(s)`
                      );
                    } catch (error) {
                      toast.error("Failed to remove color");
                    }
                  },
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
              const cellData = sheetData?.Rows?.[y]?.Cells?.[x];
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
    [updateCells, setSelectedSheet, selectedCells]
  );

  const updateDependentCells = (
    instance: any,
    sheetData: any,
    changedCellRef: string
  ) => {
    // Add safety check for instance
    if (!instance || !instance.setValueFromCoords) {
      console.warn("Spreadsheet instance not ready for dependent cell updates");
      return;
    }

    sheetData.Rows.forEach((row: any, rowIndex: number) => {
      row.Cells.forEach((cell: any, colIndex: number) => {
        if (cell.formula && cell.formula.startsWith("=")) {
          const cellRefs = parseFormula(cell.formula);
          if (cellRefs.includes(changedCellRef)) {
            setTimeout(() => {
              try {
                const result = evaluateCellFormula(cell.formula);
                if (instance.setValueFromCoords) {
                  instance.setValueFromCoords(
                    colIndex,
                    rowIndex,
                    result.toString(),
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
      const response = await getUserSheetsByDate({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });

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
          <AddItemRowModal mode="kahon" />
          <AddCalculationRowButton mode="kahon" />
          <BatchCellEditor mode={"kahon"} />
          {/* Remove KahonFormulas and CellColorPicker as they're now in context menu */}
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
