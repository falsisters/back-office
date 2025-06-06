"use client"

import React, { useState, useEffect, useRef } from "react"
import { DateRangePicker } from "./DateRangePicker"
import { getInventorySheetsByDate } from "@/lib/server/getInventorySheetsByDate"
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

export default function InventorySheets() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sheetsData, setSheetsData] = useState<GetInventorySheetPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const spreadsheetRef = useRef<jspreadsheet.JspreadsheetInstance | null>(null)
  const spreadsheetElementRef = useRef<HTMLDivElement>(null)

  const initializeSpreadsheet = React.useCallback((sheetData: GetInventorySheetPayload) => {
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
  }, [])

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

  const saveSpreadsheetData = () => {
    if (spreadsheetRef.current) {
      const data = spreadsheetRef.current.getData()
      console.log("Inventory spreadsheet data:", data)
      // Implement save functionality here
    }
  }

  const totalRows = sheetsData?.Rows.length || 0
  const totalColumns = sheetsData?.Rows[0]?.Cells.length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-foreground">Inventory Sheets</h3>
          <p className="text-sm text-muted-foreground">
            {dateRange?.from && dateRange?.to
              ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
              : "Select date range to view inventory data"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fetchSheetsData}
            disabled={loading || !dateRange || !dateRange.from || !dateRange.to}
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
          <Button
            onClick={saveSpreadsheetData}
            disabled={!sheetsData || loading}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="mb-6 flex justify-start">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary font-medium">Loading inventory data...</span>
        </div>
      ) : !sheetsData && dateRange?.from && dateRange?.to ? (
        <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No inventory data found for the selected date range.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !dateRange?.from || !dateRange?.to ? (
        <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Please select a date range to view inventory sheets
              </p>
            </div>
          </CardContent>
        </Card>
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
    </div>
  )
}