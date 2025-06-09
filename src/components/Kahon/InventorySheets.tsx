"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { DateRangePicker } from "./DateRangePicker"
import { getInventorySheetsByDate } from "@/lib/server/getInventorySheetsByDate"
import { useInventory } from "@/context/InventoryContext"
import jspreadsheet from "jspreadsheet-ce"
import "jspreadsheet-ce/dist/jspreadsheet.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, RefreshCw, Save } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import type {
  GetInventorySheetPayload,
  GetInventorySheetsByDateParams,
} from "../../../utils/types/inventory.type"
import { AddItemRowModal } from "./AddItemRowModal"
import { AddCalculationRowButton } from "./AddCalculationRowButton"
import { BatchCellEditor } from "./BatchCellEditor"
import { SaveChangesModal } from "./SaveChangesModal"
import { SheetToolbar } from "./SheetToolbar"
import { SheetEmptyState } from "./SheetEmptyState"

export default function InventorySheets() {
  const {
    selectedSheet,
    setSelectedSheet,
    updateCells,
    loadingOperations
  } = useInventory();

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sheetsData, setSheetsData] = useState<GetInventorySheetPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const spreadsheetRef = useRef<jspreadsheet.JspreadsheetInstance | null>(null)
  const spreadsheetElementRef = useRef<HTMLDivElement>(null)

  const initializeSpreadsheet = useCallback((sheetData: GetInventorySheetPayload) => {
    if (spreadsheetElementRef.current) {
      spreadsheetElementRef.current.innerHTML = ""
    }

    if (spreadsheetRef.current && spreadsheetElementRef.current) {
      try {
        spreadsheetRef.current.destroy()
      } catch (error) {
        console.warn("Error destroying spreadsheet:", error)
      }
      spreadsheetRef.current = null
    }

    // Determine the maximum number of columns from the data
    const maxColumns = sheetData.Rows.reduce((max, row) => {
      return Math.max(max, row.Cells.length)
    }, 0)

    // Transform the data for jspreadsheet
    const data = sheetData.Rows.map((row) => {
      const rowData: string[] = []
      row.Cells.forEach((cell) => {
        rowData[cell.columnIndex] = cell.value || ""
      })
      // Fill any missing columns with empty strings
      for (let i = 0; i < maxColumns; i++) {
        if (rowData[i] === undefined) rowData[i] = ""
      }
      return rowData
    })

    // Create dynamic columns based on the data
    const columns = Array.from({ length: maxColumns }, (_, i) => ({
      type: "text" as const,
      width: i === 0 ? 150 : i === 1 ? 400 : 200, // Wider for first two columns
      title: i === 0 ? "Quantity" : i === 1 ? "Item" : `${String.fromCharCode(65 + i)}`,
      name: `col_${i}`
    }))

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
      minDimensions: [maxColumns, Math.max(data.length + 5, 20)] as [number, number],
      style: {
        fontSize: "14px",
      },
      onchange: async (
        instance: any,
        cell: HTMLTableCellElement,
        colIndex: string | number,
        rowIndex: string | number,
        newValue: any,
      ) => {
        const col = typeof colIndex === "string" ? parseInt(colIndex, 10) : colIndex;
        const row = typeof rowIndex === "string" ? parseInt(rowIndex, 10) : rowIndex;
        const cellId = sheetData?.Rows?.[row]?.Cells?.[col]?.id;
        // Get old value directly from the cell element
        const oldValue = cell.innerText;

        if (cellId) {
          try {
            const isFormula = newValue.toString().startsWith('=');
            await updateCells({
              cells: [{
                id: cellId, // Use id instead of rowId
                value: isFormula ? "" : String(newValue || ''),
                formula: isFormula ? String(newValue) : undefined,
              }]
            });
          } catch (error) {
            console.error('Failed to update cell:', error);
            // Set the old value directly to the cell
            cell.innerText = oldValue;
          }
        }
      },
      updateCell: (instance: any, cell: HTMLTableCellElement, x: number, y: number, value: string) => {
        const cellId = sheetData?.Rows?.[y]?.Cells?.[x]?.id;
        if (cellId) {
          cell.setAttribute('id', cellId);
        }
        return value;
      },
      onload: (instance: any) => {
        setSelectedSheet(sheetData.id);
        // Set cell IDs and initialize the sheet data
        sheetData.Rows.forEach((row, y) => {
          row.Cells.forEach((cell, x) => {
            const element = instance.getCellFromCoords(x, y);
            if (element && cell.id) {
              element.setAttribute('id', cell.id);
              // Set the initial value
              instance.setValue(x, y, cell.value || '');
            }
          });
        });
      }
    }

    setTimeout(() => {
      if (spreadsheetElementRef.current) {
        try {
          const instance = jspreadsheet(spreadsheetElementRef.current, options)
          spreadsheetRef.current = instance
        } catch (error) {
          console.error("Error initializing spreadsheet:", error)
        }
      }
    }, 100)
  }, [updateCells, setSelectedSheet]) // Removed fetchSheetsData from dependencies

  const fetchSheetsData = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      const params: GetInventorySheetsByDateParams = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      }

      const response = await getInventorySheetsByDate(params)
      if (response) {
        setSheetsData(response)
        initializeSpreadsheet(response)
      } else {
        setSheetsData(null)
      }
    } catch (error) {
      console.error("Failed to fetch inventory sheets:", error)
      setSheetsData(null)
    } finally {
      setLoading(false)
    }
  }, [dateRange?.from, dateRange?.to, initializeSpreadsheet])

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchSheetsData()
    }
  }, [dateRange, fetchSheetsData])

  useEffect(() => {
    return () => {
      if (spreadsheetRef.current) {
        try {
          spreadsheetRef.current.destroy()
        } catch (error) {
          console.warn("Error destroying spreadsheet on unmount:", error)
        }
      }
    }
  }, [])

  const saveSpreadsheetData = async () => {
    if (spreadsheetRef.current && sheetsData) {
      try {
        console.log('🔄 Starting save operation...');
        const changes: { id: string; value: string; formula?: string }[] = [];
        const currentData = spreadsheetRef.current.getData();
        console.log('📊 Current spreadsheet data:', currentData);
        console.log('🗄️ Sheet data from state:', sheetsData);
        
        sheetsData.Rows.forEach((row, rowIndex) => {
          row.Cells.forEach((cell) => {
            const newValue = currentData[rowIndex][cell.columnIndex];
            const cellElement = document.getElementById(cell.id);
            const oldValue = cell.value || '';
            
            if (newValue !== oldValue) {
              console.log(`📝 Change detected in cell ${cell.id}:`, {
                old: oldValue,
                new: newValue,
                element: cellElement?.innerText
              });
              
              const isFormula = String(newValue).startsWith('=');
              changes.push({
                id: cell.id,
                value: isFormula ? "" : String(newValue || ''),
                formula: isFormula ? String(newValue) : undefined
              });
            }
          });
        });

        console.log('📦 Changes to be sent:', changes);
        
        if (changes.length > 0) {
          console.log('🚀 Sending update request...');
          await updateCells({ cells: changes });
          console.log('✅ Update successful');
          await fetchSheetsData();
          console.log('🔄 Data refreshed');
        } else {
          console.log('ℹ️ No changes detected');
        }
      } catch (error) {
        console.error('❌ Save operation failed:', error);
        throw error;
      }
    }
  };

  const handleSaveChanges = async () => {
    console.log('🔰 Save changes triggered');
    try {
      await saveSpreadsheetData();
      setIsSaveModalOpen(false);
      console.log('✅ Save completed successfully');
    } catch (error) {
      console.error('❌ Save changes failed:', error);
      // You might want to show an error toast here
    }
  };

  const totalRows = sheetsData?.Rows.length || 0
  const totalColumns = sheetsData?.Rows[0]?.Cells.length || 0

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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary font-medium">Loading inventory data...</span>
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
            <CardTitle className="text-orange-700 text-xl">Inventory Sheet</CardTitle>
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
  )
}