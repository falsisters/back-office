"use client"

import React, { useState, useEffect, useRef } from "react"
import { DateRangePicker } from "./DateRangePicker"
import { getUserSheetsByDate } from "@/lib/server/getSheetsByDateRange"
import { SaveChangesModal } from "./SaveChangesModal"
import { SheetToolbar } from "./SheetToolbar"
import jspreadsheet from "jspreadsheet-ce"
import "jspreadsheet-ce/dist/jspreadsheet.css"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import { useKahon } from "@/context/KahonContext"
import { AddItemRowModal } from "./AddItemRowModal"
import { AddCalculationRowButton } from "./AddCalculationRowButton"
import { BatchCellEditor } from "./BatchCellEditor"
import { Loader2 } from "lucide-react"

export default function KahonSheets() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sheetData, setSheetData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const spreadsheetRef = useRef<any>(null)
  const spreadsheetElementRef = useRef<HTMLDivElement>(null)
  
  const {
    selectedSheet,
    setSelectedSheet,
    addItemRow,
    addCalculationRow,
    updateCells,
    deleteRow,
    loadingOperations
  } = useKahon()

  const initializeSpreadsheet = React.useCallback((sheetData: any) => {
    if (spreadsheetElementRef.current) {
      spreadsheetElementRef.current.innerHTML = ""
    }

    if (spreadsheetRef.current) {
      try {
        spreadsheetRef.current.destroy()
      } catch (error) {
        console.warn("Error destroying spreadsheet:", error)
      }
      spreadsheetRef.current = null
    }

    const data = sheetData.Rows.map((row: any) => {
      return row.Cells.sort((a: any, b: any) => a.columnIndex - b.columnIndex)
        .slice(0, 5)
        .map((cell: any) => cell.value || "")
    })

    const columns = [
      { type: "text" as const, width: 150, title: "Quantity", name: "quantity" },
      { type: "text" as const, width: 400, title: "Name", name: "name" },
      { type: "text" as const, width: 200, title: "C", name: "col_c" },
      { type: "text" as const, width: 200, title: "D", name: "col_d" },
      { type: "text" as const, width: 200, title: "E", name: "col_e" },
    ]

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
        // Ensure colIndex and rowIndex are numbers for array access
        const col = typeof colIndex === "string" ? parseInt(colIndex, 10) : colIndex
        const row = typeof rowIndex === "string" ? parseInt(rowIndex, 10) : rowIndex
        const cellId = sheetData?.Rows?.[row]?.Cells?.[col]?.id
        if (cellId) {
          updateCells({
            cells: [{
              id: cellId,
              value: newValue,
              // Include other cell properties if needed
            }]
          })
        }
      },
      oninsertrow: (instance: any, rowIndex: number) => {
        // You can implement row insertion logic here
        console.log("Row inserted at index:", rowIndex)
      }
    }

    setTimeout(() => {
      if (spreadsheetElementRef.current) {
        try {
          const instance = jspreadsheet(spreadsheetElementRef.current, options)
          spreadsheetRef.current = instance
          setSelectedSheet(sheetData.id)
        } catch (error) {
          console.error("Error initializing spreadsheet:", error)
        }
      }
    }, 100)
  }, [updateCells, deleteRow, setSelectedSheet])

  const fetchSheetsData = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      const response = await getUserSheetsByDate({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      })

      if (response) {
        setSheetData(response)
        initializeSpreadsheet(response)
      } else {
        setSheetData(null)
      }
    } catch (error) {
      console.error("Failed to fetch sheets:", error)
      setSheetData(null)
    } finally {
      setLoading(false)
    }
  }, [dateRange, initializeSpreadsheet])

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
          console.warn("Error cleaning up spreadsheet:", error)
        }
      }
    }
  }, [])

  const handleSaveChanges = () => {
    setIsSaveModalOpen(true)
  }

  const handleConfirmSave = () => {
    if (spreadsheetRef.current) {
      const data = spreadsheetRef.current.getData()
      console.log("Spreadsheet data to save:", data)
      // Implement save logic here
    }
    setIsSaveModalOpen(false)
  }

  const totalRows = sheetData?.Rows.length || 0

  return (
    <div className="space-y-6">
      <SheetToolbar
        dateRange={dateRange}
        loading={loading || loadingOperations}
        onRefresh={fetchSheetsData}
        onSave={handleSaveChanges}
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <div className="flex gap-2">
          <AddItemRowModal />
          <AddCalculationRowButton />
          <BatchCellEditor />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary font-medium">Loading data...</span>
        </div>
      ) : !sheetData && dateRange?.from && dateRange?.to ? (
        <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No data found for the selected date range. Please try a different date range.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !dateRange?.from || !dateRange?.to ? (
        <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Please select a date range to view sheets</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full shadow-md overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-primary text-xl">Sheet Details</CardTitle>
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
  )
}