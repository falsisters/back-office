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
// Update imports to use correct types
import type {
  GetInventorySheetPayload,
  GetInventorySheetsByDateParams,
  InventoryCellOperationBatch,
  UpdateInventoryCellParams,
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
  createSumColumnAbove,
  createSumRowLeft,
  createMultiplyRow,
  createAddRow,
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
  // Update type usage
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
    if (!sheetsData?.Rows?.[row]) return "";

    const cell = sheetsData.Rows[row].Cells?.find(
      (cell) => cell.columnIndex === col
    );
    if (!cell) return "";

    // If cell has a formula, return the evaluated result from the database
    if (cell.formula && cell.formula.startsWith("=")) {
      // Use the stored value which should be the evaluated result
      return cell.value || "";
    }

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

  const applyFormulaToCell = async (
    cell: {
      col: number;
      row: number;
      cellId: string;
    },
    formulaType: string
  ) => {
    const { col, row, cellId } = cell;

    let formula = "";
    let description = "";

    switch (formulaType) {
      case "sum-column-above":
        if (row === 0) {
          toast.error("No cells above to sum");
          return;
        }
        formula = `=SUM(${getCellReference(col, 0)}:${getCellReference(
          col,
          row - 1
        )})`;
        description = "Sum column above";
        break;
      case "sum-row-left":
        if (col === 0) {
          toast.error("No cells to the left to sum");
          return;
        }
        formula = `=SUM(${getCellReference(0, row)}:${getCellReference(
          col - 1,
          row
        )})`;
        description = "Sum row left";
        break;
      case "average-column-above":
        if (row === 0) {
          toast.error("No cells above to average");
          return;
        }
        formula = `=AVERAGE(${getCellReference(col, 0)}:${getCellReference(
          col,
          row - 1
        )})`;
        description = "Average column above";
        break;
      case "count-column-above":
        if (row === 0) {
          toast.error("No cells above to count");
          return;
        }
        formula = `=COUNTA(${getCellReference(col, 0)}:${getCellReference(
          col,
          row - 1
        )})`;
        description = "Count column above";
        break;
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

  // Enhanced formula application for inventory context
  const applyQuickFormula = async (
    cells: Array<{ col: number; row: number; cellId: string }>,
    formulaType: string
  ) => {
    if (cells.length === 0) return;

    const cell = cells[0];
    const { col, row, cellId } = cell;

    let formula = "";

    switch (formulaType) {
      case "sum-column-above":
        formula = createSumColumnAbove(col, row);
        break;
      case "sum-row-left":
        formula = createSumRowLeft(col, row);
        break;
      case "average-column-above":
        if (row === 0) return;
        formula = `=AVERAGE(${getCellReference(col, 0)}:${getCellReference(
          col,
          row - 1
        )})`;
        break;
      case "count-column-above":
        if (row === 0) return;
        formula = `=COUNTA(${getCellReference(col, 0)}:${getCellReference(
          col,
          row - 1
        )})`;
        break;
      case "multiply-inventory-calc":
        // For inventory: multiply quantity × price or similar
        if (col < 2) return;
        formula = createMultiplyRow(0, 1, row); // Quantity × Item value
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
  const applyColorToCells = async (
    cells: Array<{ cellId: string }>,
    color: string
  ) => {
    try {
      const cellUpdates: InventoryCellOperationBatch["cells"] = cells.map(
        ({ cellId }) => {
          // Find the current value from sheetsData instead of DOM textContent
          let currentValue = "";

          // Find the cell in sheetsData by ID
          for (const row of sheetsData?.Rows || []) {
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
        }
      );

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
      const cellUpdates: InventoryCellOperationBatch["cells"] = cells.map(
        ({ cellId }) => {
          // Find the current value from sheetsData instead of DOM textContent
          let currentValue = "";

          // Find the cell in sheetsData by ID
          for (const row of sheetsData?.Rows || []) {
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
        }
      );

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

  // Initialize the spreadsheet with data and settings
  const initializeSpreadsheet = useCallback(
    (sheetData: NonNullable<GetInventorySheetPayload>) => {
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
      }, 0); // Transform the data for jspreadsheet with formula evaluation
      const data = sheetData.Rows.map((row) => {
        const rowData: string[] = [];
        row.Cells.forEach((cell) => {
          // If cell has formula, show the stored value (which should be the evaluated result)
          if (cell.formula && cell.formula.startsWith("=")) {
            // Return the stored value, not re-evaluate the formula
            rowData[cell.columnIndex] = cell.value || "";
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

          const targetCell = sheetData?.Rows?.[row]?.Cells?.find(
            (cell) => cell.columnIndex === col
          );
          const cellId = targetCell?.id;

          if (cellId) {
            try {
              const isFormula = newValue.toString().startsWith("=");
              const cellData: InventoryCellOperationBatch["cells"][0] = {
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

              await updateCells({
                cells: [cellData],
              });

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
            } // Mark formula cells and show stored evaluated result
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
          setSelectedSheet(sheetData.id);
          // Set cell IDs and apply styling after the spreadsheet is loaded
          sheetData.Rows.forEach((row, y) => {
            row.Cells.forEach((cell) => {
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
                    // Use the stored value (which should be the evaluated result)
                    const displayValue = cell.value || "";

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

        // Enhanced context menu for inventory
        contextMenu: function (
          instance: any,
          colIndex: string | null,
          rowIndex: string | null,
          event: PointerEvent
        ) {
          event.preventDefault();
          event.stopPropagation();

          const x = colIndex ? parseInt(colIndex, 10) : 0;
          const y = rowIndex ? parseInt(rowIndex, 10) : 0;

          // Get the actual clicked cell element
          const clickedCell = event.target as HTMLElement;
          const actualCell = clickedCell.closest("td") as HTMLElement;

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
          });

          // Store selection for use in menu actions - use actual clicked cell if no selection
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
                        (c) => c.columnIndex === x
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
              title: "Inventory Formulas",
              submenu: [
                {
                  title: "Sum Column Above",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "sum-column-above"),
                  disabled: y === 0,
                },
                {
                  title: "Average Column Above",
                  onclick: () =>
                    applyQuickFormula(
                      menuSelectedCells,
                      "average-column-above"
                    ),
                  disabled: y === 0,
                },
                {
                  title: "Count Items Above",
                  onclick: () =>
                    applyQuickFormula(menuSelectedCells, "count-column-above"),
                  disabled: y === 0,
                },
                {
                  title: "Multiply Quantity × Value",
                  onclick: () =>
                    applyQuickFormula(
                      menuSelectedCells,
                      "multiply-inventory-calc"
                    ),
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
    [updateCells, setSelectedSheet]
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
        const changes: InventoryCellOperationBatch["cells"] = [];
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
              const cellUpdate: InventoryCellOperationBatch["cells"][0] = {
                id: cell.id,
                value: String(newValue || ""),
              };
              if (isFormula) {
                cellUpdate.formula = String(newValue);
                // Don't evaluate formulas locally - let backend handle evaluation
                cellUpdate.value = ""; // Backend will calculate and store the result
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
          {/* TODO: Enable in next release - AddCalculationRowButton still buggy */}
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
