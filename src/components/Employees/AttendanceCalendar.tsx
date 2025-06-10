"use client";

import React, { useState } from "react";
import { EmployeeWithShiftsResponse } from "../../../utils/types/getEmployee.type";
import { EmployeeAttendanceResponse } from "../../../utils/types/getEmployeeAttendance.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceCalendarProps {
  employee: EmployeeWithShiftsResponse;
  attendanceData: EmployeeAttendanceResponse | null;
}

const AttendanceCalendar = ({
  employee,
  attendanceData,
}: AttendanceCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getShiftsForDate = (date: Date) => {
    if (!date) return [];

    const dateString = date.toISOString().split("T")[0];
    return employee.ShiftEmployee.filter((se) => {
      const shiftDate = new Date(se.shift.startTime)
        .toISOString()
        .split("T")[0];
      return shiftDate === dateString;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const shifts = date ? getShiftsForDate(date) : [];
          const hasShifts = shifts.length > 0;
          const hasActiveShift = shifts.some((s) => s.shift.endTime === null);

          return (
            <Card
              key={index}
              className={cn(
                "min-h-[80px] transition-colors",
                !date && "invisible",
                isToday(date) && "ring-2 ring-primary",
                hasShifts && "bg-primary/5",
                hasActiveShift && "bg-primary/10"
              )}
            >
              <CardContent className="p-2 h-full">
                {date && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    {hasShifts && (
                      <div className="space-y-1">
                        {shifts.slice(0, 2).map((shiftEmployee, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-1"
                          >
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <Badge
                              variant={
                                shiftEmployee.shift.endTime
                                  ? "secondary"
                                  : "default"
                              }
                              className="text-xs px-1 py-0"
                            >
                              {shiftEmployee.shift.endTime ? "Done" : "Active"}
                            </Badge>
                          </div>
                        ))}
                        {shifts.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{shifts.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary/5 border rounded"></div>
          <span>Has shifts</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary/10 border rounded"></div>
          <span>Active shift</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
