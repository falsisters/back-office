"use client"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange) => void
}

export function DateRangePicker({ date, onDateChange }: DateRangePickerProps) {
  const today = new Date()
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false)

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    if (!isSelectingEndDate) {
      // First click - set start date
      onDateChange({ from: selectedDate, to: undefined })
      setIsSelectingEndDate(true)
    } else {
      // Second click - set end date
      if (date?.from && selectedDate >= date.from) {
        onDateChange({ from: date.from, to: selectedDate })
        setIsSelectingEndDate(false)
      } else {
        // If end date is before start date, reset and start over
        onDateChange({ from: selectedDate, to: undefined })
        setIsSelectingEndDate(true)
      }
    }
  }

  // Reset selection state when popover closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsSelectingEndDate(false)
    }
  }

  return (
    <div className="grid gap-2">
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal border-primary/30 text-primary",
              !date?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                <>{format(date.from, "MMM dd, yyyy")} - Select end date</>
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">{!isSelectingEndDate ? "Select start date" : "Select end date"}</h4>
          </div>
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={date?.from || today}
            selected={isSelectingEndDate ? date?.to : date?.from}
            onSelect={handleSelect}
            numberOfMonths={1}
            disabled={{
              after: today,
              before: isSelectingEndDate && date?.from ? date.from : undefined,
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
