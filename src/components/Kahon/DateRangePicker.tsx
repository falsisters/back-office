"use client"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Check, ArrowLeft, X } from "lucide-react"
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
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined)
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const handleStartDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTempStartDate(selectedDate)
    }
  }

  const handleEndDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && tempStartDate && selectedDate >= tempStartDate) {
      setTempEndDate(selectedDate)
    }
  }

  const confirmStartDate = () => {
    if (tempStartDate) {
      setIsSelectingEndDate(true)
      setTempEndDate(undefined) // Reset end date when confirming new start date
    }
  }

  const confirmEndDate = () => {
    if (tempStartDate && tempEndDate) {
      onDateChange({ from: tempStartDate, to: tempEndDate })
      setIsOpen(false)
      resetState()
    }
  }

  const goBackToStartDate = () => {
    setIsSelectingEndDate(false)
    setTempEndDate(undefined)
  }

  const resetState = () => {
    setIsSelectingEndDate(false)
    setTempStartDate(undefined)
    setTempEndDate(undefined)
  }

  const handleCancel = () => {
    resetState()
    setIsOpen(false)
  }

  // Reset selection state when popover opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      resetState()
    }
  }

  const formatDateDisplay = () => {
    if (date?.from && date?.to) {
      return `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd")}`
    }
    return "Select dates"
  }

  return (
    <div className="grid gap-2">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-auto justify-start text-left font-normal border-primary/30 text-primary px-4",
              !date?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-1 h-5 w-5" />
            {formatDateDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b flex justify-between items-center">
            <div>
              <h4 className="font-medium text-sm">
                {!isSelectingEndDate ? "Select start date" : "Select end date"}
              </h4>
              {isSelectingEndDate && tempStartDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Start: {format(tempStartDate, "MMM dd, yyyy")}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              {isSelectingEndDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBackToStartDate}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={!isSelectingEndDate ? tempStartDate || today : tempStartDate || today}
            selected={!isSelectingEndDate ? tempStartDate : tempEndDate}
            onSelect={!isSelectingEndDate ? handleStartDateSelect : handleEndDateSelect}
            numberOfMonths={1}
            disabled={{
              after: today,
              before: isSelectingEndDate && tempStartDate ? tempStartDate : undefined,
            }}
          />
          
          {/* Confirmation buttons */}
          <div className="p-3 border-t bg-gray-50">
            {!isSelectingEndDate ? (
              // Start date confirmation
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  {tempStartDate ? (
                    <>
                      <span className="font-medium">Start date: </span>
                      <span className="text-muted-foreground">
                        {format(tempStartDate, "MMM dd, yyyy")}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Select a start date</span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={confirmStartDate}
                  disabled={!tempStartDate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="mr-1 h-4 w-4" />
                  OK
                </Button>
              </div>
            ) : (
              // End date confirmation
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  {tempEndDate ? (
                    <>
                      <span className="font-medium">End date: </span>
                      <span className="text-muted-foreground">
                        {format(tempEndDate, "MMM dd, yyyy")}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Select an end date</span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={confirmEndDate}
                  disabled={!tempEndDate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Confirm
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}