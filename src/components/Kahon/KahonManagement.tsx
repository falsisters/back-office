"use client"

import React, { useState, useEffect, useRef } from "react"
import { DateRangePicker } from "./DateRangePicker"
import { getUserSheetsByDate } from "@/lib/server/getSheetsByDateRange"
import jspreadsheet from "jspreadsheet-ce"
import "jspreadsheet-ce/dist/jspreadsheet.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, RefreshCw, Save, Database } from "lucide-react"
import { format } from "date-fns"
import type {
  GetUserSheetsByDatePayload,
  GetUserSheetsByDateParams,
} from "../../../utils/types/getSheetsByDateRange.type"
import type { Sheet, Row, Cell, KahonItem } from "../../../utils/types/schema.type"
import type { DateRange } from "react-day-picker"

interface KahonSheetData extends Sheet {
  Rows: (Row & {
    Cells: Cell[]
    item?: KahonItem | null
  })[]
}

export default function KahonManagement() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sheetsData, setSheetsData] = useState<KahonSheetData | null>(null)
  const [loading, setLoading] = useState(false)

  // Use useRef to store the spreadsheet instance and element reference
  const spreadsheetRef = useRef<jspreadsheet.JspreadsheetInstance | null>(null)
  const spreadsheetElementRef = useRef<HTMLDivElement>(null)

  const initializeSpreadsheet = React.useCallback((sheetData: GetUserSheetsByDatePayload) => {
    // First, make sure the element is empty
    if (spreadsheetElementRef.current) {
      spreadsheetElementRef.current.innerHTML = ""
    }

    // Destroy existing spreadsheet if it exists
    if (spreadsheetRef.current && spreadsheetElementRef.current) {
      try {
        spreadsheetRef.current.destroy()
      } catch (error) {
        console.warn("Error destroying spreadsheet:", error)
      }
      spreadsheetRef.current = null
    }

    // Transform the data for jspreadsheet
    const data = sheetData.Rows.map((row: Row & { Cells: Cell[] }) => {
      return row.Cells.sort((a, b) => a.columnIndex - b.columnIndex)
        .slice(0, 5) // Limit to 5 columns (A to E)
        .map((cell: Cell) => cell.value || "")
    })

    // Wider columns for better readability
    const columns: { type: "text"; width: number; title: string; name: string }[] = [
      { type: "text", width: 150, title: "Quantity", name: "quantity" },
      { type: "text", width: 400, title: "Name", name: "name" },
      { type: "text", width: 200, title: "C", name: "col_c" },
      { type: "text", width: 200, title: "D", name: "col_d" },
      { type: "text", width: 200, title: "E", name: "col_e" },
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
    }

    // Add a small delay to ensure the DOM is ready
    setTimeout(() => {
      if (spreadsheetElementRef.current) {
        try {
          console.log("Initializing spreadsheet with data:", data)
          const instance = jspreadsheet(spreadsheetElementRef.current, options)
          spreadsheetRef.current = instance
          console.log("Spreadsheet initialized:", instance)
        } catch (error) {
          console.error("Error initializing spreadsheet:", error)
        }
      }
    }, 100)
  }, [])

  const fetchSheetsData = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      return
    }

    setLoading(true)
    try {
      const params: GetUserSheetsByDateParams = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      }

      const response = await getUserSheetsByDate(params)

      if (response) {
        setSheetsData(response)
        initializeSpreadsheet(response)
      } else {
        setSheetsData(null)
      }
    } catch (error) {
      console.error("Failed to fetch sheets:", error)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const spreadsheetInstance = spreadsheetRef.current
      if (spreadsheetInstance) {
        try {
          spreadsheetInstance.destroy()
        } catch (error) {
          console.warn("Error destroying spreadsheet on unmount:", error)
        }
      }
    }
  }, [])

  const saveSpreadsheetData = () => {
    if (spreadsheetRef.current) {
      const data = spreadsheetRef.current.getData()
      console.log("Spreadsheet data:", data)
      // Here you can implement the save functionality
      // You might want to call an API to save the updated data
    }
  }

  const totalRows = sheetsData?.Rows.length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Kahon Management</h2>
            <p className="text-sm text-muted-foreground">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                : "Select date range to view data"}
            </p>
          </div>
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

      <div className="mb-6">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary font-medium">Loading data...</span>
        </div>
      ) : !sheetsData && dateRange?.from && dateRange?.to ? (
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
              {sheetsData?.name} • {totalRows} rows
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
    </div>
  )
}