"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { DateRangePicker } from "./DateRangePicker";
import { getInventorySheetsByDate } from "@/lib/server/getInventorySheetsByDate";
import { useInventory } from "@/context/InventoryContext";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type {
  GetInventorySheetPayload,
  GetInventorySheetsByDateParams,
} from "../../../utils/types/inventory.type";
import { AddItemRowModal } from "./AddItemRowModal";
import { AddCalculationRowButton } from "./AddCalculationRowButton";
import { BatchCellEditor } from "./BatchCellEditor";
import { SaveChangesModal } from "./SaveChangesModal";
import { SheetToolbar } from "./SheetToolbar";
import { SheetEmptyState } from "./SheetEmptyState";
import {
  evaluateFormula,
  parseFormula,
  parseCellReference,
  getCellReference,
} from "@/utils/formulaUtils";
import { CellColorPicker } from "./CellColorPicker";
import { KahonFormulas } from "./KahonFormulas";
import { toast } from "sonner";

// Custom CSS for cell colors - reuse the same injection function
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

export default function InventorySheets() {
  const { selectedSheet, setSelectedSheet, updateCells, loadingOperations } =
    useInventory();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sheetsData, setSheetsData] = useState<GetInventorySheetPayload | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedCells, setSelectedCells] = useState<
    Array<{ col: number; row: number; cellId: string }>
  >([]);
  const spreadsheetRef = useRef<jspreadsheet.JspreadsheetInstance | null>(null);
  const spreadsheetElementRef = useRef<HTMLDivElement>(null);

  // Inject styles on component mount
  useEffect(() => {
    injectCellColorStyles();
  }, []);

  const getCellValue = (col: number, row: number): string | number => {
    if (
      !sheetsData?.Rows?.[row]?.Cells?.find((cell) => cell.columnIndex === col)
    )
      return "";
    const cell = sheetsData.Rows[row].Cells.find(
      (cell) => cell.columnIndex === col
    );
    return cell?.value || "";
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

  const applyFormulaToSelection = async (formulaType: string) => {
    if (selectedCells.length === 0) {
      toast.error("No cells selected");
      return;
    }

    const cellToUpdate = selectedCells[0];
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
        formula = `=SUM(${getCellReference(col, row - 1)}:${getCellReference(
          col,
          0
        )})`;
        description = "Add All (Vertical)";
        break;
      case "add-all-horizontal":
        if (col === 0) {
          toast.error("No cells to the left to sum");
          return;
        }
        formula = `=SUM(${getCellReference(0, row)}:${getCellReference(
          col - 1,
          row
        )})`;
        description = "Add All (Horizontal)";
        break;
      case "average-all-vertical":
        if (row === 0) {
          toast.error("No cells above to average");
          return;
        }
        formula = `=AVERAGE(${getCellReference(
          col,
          row - 1
        )}:${getCellReference(col, 0)})`;
        description = "Average All (Vertical)";
        break;
      case "average-all-horizontal":
        if (col === 0) {
          toast.error("No cells to the left to average");
          return;
        }
        formula = `=AVERAGE(${getCellReference(0, row)}:${getCellReference(
          col - 1,
          row
        )})`;
        description = "Average All (Horizontal)";
        break;
      case "count-all-vertical":
        if (row === 0) {
          toast.error("No cells above to count");
          return;
        }
        formula = `=COUNTA(${getCellReference(col, row - 1)}:${getCellReference(
          col,
          0
        )})`;
        description = "Count All (Vertical)";
        break;
      case "count-all-horizontal":
        if (col === 0) {
          toast.error("No cells to the left to count");
          return;
        }
        formula = `=COUNTA(${getCellReference(0, row)}:${getCellReference(
          col - 1,
          row
        )})`;
        description = "Count All (Horizontal)";
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

  const initializeSpreadsheet = useCallback(
    (sheetData: GetInventorySheetPayload) => {
      if (spreadsheetElementRef.current) {
        spreadsheetElementRef.current.innerHTML = "";
      }

      if (spreadsheetRef.current && spreadsheetElementRef.current) {
        try {
          spreadsheetRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying spreadsheet:", error);
        }
        spreadsheetRef.current = null;
      }

      // Determine the maximum number of columns from the data
      const maxColumns = sheetData.Rows.reduce((max, row) => {
        return Math.max(max, row.Cells.length);
      }, 0);

      // Transform the data for jspreadsheet with formula evaluation
      const data = sheetData.Rows.map((row) => {
        const rowData: string[] = [];
        row.Cells.forEach((cell) => {
          // If cell has formula, evaluate it and show result
          if (cell.formula && cell.formula.startsWith("=")) {
            const result = evaluateCellFormula(cell.formula);
            rowData[cell.columnIndex] = result.toString();
          } else {
            rowData[cell.columnIndex] = cell.value || "";
          }
        });
        // Fill any missing columns with empty strings
        for (let i = 0; i < maxColumns; i++) {
          if (rowData[i] === undefined) rowData[i] = "";
        }
        return rowData;
      });

      // Create dynamic columns based on the data
      const columns = Array.from({ length: maxColumns }, (_, i) => ({
        type: "text" as const,
        width: i === 0 ? 150 : i === 1 ? 400 : 200, // Wider for first two columns
        title:
          i === 0
            ? "Quantity"
            : i === 1
            ? "Item"
            : `${String.fromCharCode(65 + i)}`,
        name: `col_${i}`,
      }));

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
        minDimensions: [maxColumns, Math.max(data.length + 5, 20)] as [
          number,
          number
        ],
        style: {
          fontSize: "14px",
        },
        onchange: async (
          instance: any,
          cell: HTMLTableCellElement,
          colIndex: string | number,
          rowIndex: string | number,
          newValue: any
        ) => {
          const col =
            typeof colIndex === "string" ? parseInt(colIndex, 10) : colIndex;
          const row =
            typeof rowIndex === "string" ? parseInt(rowIndex, 10) : rowIndex;

          // Find the cell by matching row and column indices
          const targetCell = sheetData?.Rows?.[row]?.Cells?.find(
            (cell) => cell.columnIndex === col
          );
          const cellId = targetCell?.id;

          if (cellId) {
            try {
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

              await updateCells({
                cells: [cellData],
              });

              // Update dependent cells
              if (isFormula) {
                const currentCellRef = getCellReference(col, row);
                updateDependentCells(
                  spreadsheetRef.current,
                  sheetData,
                  currentCellRef
                );
              }
            } catch (error) {
              console.error("Failed to update cell:", error);
            }
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

            // Mark formula cells and show evaluated result
            if (cellData.formula && cellData.formula.startsWith("=")) {
              markFormulaCell(cell, true);
              // If there's a stored value from the backend, use it; otherwise evaluate
              if (cellData.value && cellData.value !== "0") {
                return cellData.value;
              } else {
                try {
                  const result = evaluateCellFormula(cellData.formula);
                  return result.toString();
                } catch (error) {
                  return "#ERROR!";
                }
              }
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
          setSelectedSheet(sheetData.id);
          // Set cell IDs and apply styling after the spreadsheet is loaded
          sheetData.Rows.forEach((row, y) => {
            row.Cells.forEach((cell, x) => {
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
                  }

                  // Mark formula cells and evaluate them
                  if (cell.formula && cell.formula.startsWith("=")) {
                    markFormulaCell(cellElement, true);
                    // Use the stored value if available, otherwise evaluate
                    let displayValue = cell.value;
                    if (!displayValue || displayValue === "0") {
                      try {
                        const result = evaluateCellFormula(cell.formula);
                        displayValue = result.toString();
                      } catch (error) {
                        displayValue = "#ERROR!";
                      }
                    }

                    if (
                      spreadsheetRef.current &&
                      spreadsheetRef.current.setValueFromCoords
                    ) {
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
          const selectedElements = document.querySelectorAll(".jexcel_selected");
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
                  title: "Add All Vertical",
                  onclick: () => applyFormulaToSelection("add-all-vertical"),
                },
                {
                  title: "Add All Horizontal",
                  onclick: () => applyFormulaToSelection("add-all-horizontal"),
                },
                {
                  title: "Average All Vertical",
                  onclick: () => applyFormulaToSelection("average-all-vertical"),
                },
                {
                  title: "Average All Horizontal",
                  onclick: () => applyFormulaToSelection("average-all-horizontal"),
                },
                {
                  title: "Count All Vertical",
                  onclick: () => applyFormulaToSelection("count-all-vertical"),
                },
                {
                  title: "Count All Horizontal",
                  onclick: () => applyFormulaToSelection("count-all-horizontal"),
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
                (c) => c.columnIndex === x
              );
              if (cellData?.id) {
                newSelectedCells.push({ col: x, row: y, cellId: cellData.id });
              }
            }
          }

          setSelectedCells(newSelectedCells);
        },

        // ...existing options...
      };

      setTimeout(() => {
        if (spreadsheetElementRef.current) {
          try {
            const instance = jspreadsheet(
              spreadsheetElementRef.current,
              options
            );
            spreadsheetRef.current = instance;
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
      const params: GetInventorySheetsByDateParams = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      };

      const response = await getInventorySheetsByDate(params);
      if (response) {
        setSheetsData(response);
        initializeSpreadsheet(response);
      } else {
        setSheetsData(null);
      }
    } catch (error) {
      console.error("Failed to fetch inventory sheets:", error);
      setSheetsData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange?.from, dateRange?.to, initializeSpreadsheet]);

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
          console.warn("Error destroying spreadsheet on unmount:", error);
        }
      }
    };
  }, []);

  const saveSpreadsheetData = async () => {
    if (spreadsheetRef.current && sheetsData) {
      try {
        console.log("🔄 Starting save operation...");
        const changes: { id: string; value: string; formula?: string }[] = [];
        const currentData = spreadsheetRef.current.getData();
        console.log("📊 Current spreadsheet data:", currentData);
        console.log("🗄️ Sheet data from state:", sheetsData);

        sheetsData.Rows.forEach((row, rowIndex) => {
          row.Cells.forEach((cell) => {
            const newValue = currentData[rowIndex][cell.columnIndex];
            const oldValue = cell.value || "";

            if (newValue !== oldValue) {
              console.log(`📝 Change detected in cell ${cell.id}:`, {
                old: oldValue,
                new: newValue,
                element: document.getElementById(cell.id)?.innerText,
              });

              const isFormula = String(newValue).startsWith("=");
              const cellUpdate: any = {
                id: cell.id,
                value: String(newValue || ""),
              };

              if (isFormula) {
                cellUpdate.formula = String(newValue);
                // For formulas, calculate the actual value
                try {
                  const result = evaluateCellFormula(String(newValue));
                  cellUpdate.value = result.toString();
                } catch (error) {
                  cellUpdate.value = "#ERROR!";
                }
              }

              changes.push(cellUpdate);
            }
          });
        });

        console.log("📦 Changes to be sent:", changes);

        if (changes.length > 0) {
          console.log("🚀 Sending update request...");
          await updateCells({ cells: changes });
          console.log("✅ Update successful");
          await fetchSheetsData();
          console.log("🔄 Data refreshed");
        } else {
          console.log("ℹ️ No changes detected");
        }
      } catch (error) {
        console.error("❌ Save operation failed:", error);
        throw error;
      }
    }
  };

  const handleSaveChanges = async () => {
    console.log("🔰 Save changes triggered");
    try {
      await saveSpreadsheetData();
      setIsSaveModalOpen(false);
      console.log("✅ Save completed successfully");
    } catch (error) {
      console.error("❌ Save changes failed:", error);
      // You might want to show an error toast here
    }
  };

  const totalRows = sheetsData?.Rows.length || 0;
  const totalColumns = sheetsData?.Rows[0]?.Cells.length || 0;

  return (
    <div className="space-y-6">
      <SheetToolbar
        mode="inventory"
        dateRange={dateRange}
        loading={loading || loadingOperations}
        onRefresh={fetchSheetsData}
        onSave={() => setIsSaveModalOpen(true)}
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <div className="flex gap-2">
          <AddItemRowModal mode="inventory" />
          <AddCalculationRowButton mode="inventory" />
          <BatchCellEditor mode="inventory" />
          {selectedCells.length > 0 && (
            <div className="text-sm text-muted-foreground bg-orange-50 px-3 py-1 rounded">
              {selectedCells.length} cell(s) selected • Right-click for options
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary font-medium">
            Loading inventory data...
          </span>
        </div>
      ) : !sheetsData && dateRange?.from && dateRange?.to ? (
        <SheetEmptyState
          mode="inventory"
          message="No inventory data found for the selected date range."
        />
      ) : !dateRange?.from || !dateRange?.to ? (
        <SheetEmptyState
          mode="inventory"
          message="Please select a date range to view inventory sheets"
        />
      ) : (
        <Card className="w-full shadow-md overflow-hidden border-t-4 border-t-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent">
            <CardTitle className="text-orange-700 text-xl">
              Inventory Sheet
            </CardTitle>
            <CardDescription>
              {sheetsData?.name} • {totalRows} items • {totalColumns} columns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 overflow-x-auto">
              <div
                ref={spreadsheetElementRef}
                id="inventory-spreadsheet"
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
        onConfirm={handleSaveChanges}
        loading={loading || loadingOperations}
      />
    </div>
  );
}
