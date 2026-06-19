"use client";

import React from "react";
import { useEmployee, useEmployeeAttendance } from "@/hooks/useEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AttendanceCalendar from "./AttendanceCalendar";
import { EmployeeWithShiftsResponse } from "../../../utils/types/Employee/getEmployee.type";

interface EmployeeDetailClientProps {
  id: string;
  initialEmployee: EmployeeWithShiftsResponse | null;
}

const EmployeeDetailClient = ({
  id,
  initialEmployee,
}: EmployeeDetailClientProps) => {
  const { data: employee, isLoading: employeeLoading } = useEmployee(
    id,
    initialEmployee ? { initialData: initialEmployee } : undefined
  );
  const { data: attendance, isLoading: attendanceLoading } =
    useEmployeeAttendance();

  if (!employee && !employeeLoading) {
    notFound();
  }

  if (employeeLoading && !employee) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    notFound();
  }

  const activeShifts = employee.ShiftEmployee.filter(
    (se) => se.shift.endTime === null
  ).length;

  const totalShifts = employee.ShiftEmployee.length;
  const completedShifts = employee.ShiftEmployee.filter(
    (se) => se.shift.endTime !== null
  ).length;

  const recentShifts = employee.ShiftEmployee
    .sort(
      (a, b) =>
        new Date(b.shift.createdAt).getTime() -
        new Date(a.shift.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/employees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">{employee.name}</CardTitle>
                {employee.branch && (
                  <p className="text-lg text-muted-foreground">
                    Branch: {employee.branch}
                  </p>
                )}
                <p className="text-muted-foreground">
                  Employee ID: {employee.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Joined: {new Date(employee.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Active Shifts</p>
                  <p className="text-2xl font-bold text-primary">
                    {activeShifts}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Shifts</p>
                  <p className="text-2xl font-bold">{totalShifts}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedShifts}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <AttendanceCalendar
                employee={employee}
                attendanceData={attendance || null}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShifts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No shifts found for this employee
                </p>
              ) : (
                recentShifts.map((shiftEmployee) => (
                  <div
                    key={shiftEmployee.id}
                    className="flex items-center justify-between py-3 px-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {new Date(
                          shiftEmployee.shift.startTime
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Started:{" "}
                        {new Date(
                          shiftEmployee.shift.startTime
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          shiftEmployee.shift.endTime ? "secondary" : "default"
                        }
                      >
                        {shiftEmployee.shift.endTime ? "Completed" : "Active"}
                      </Badge>
                      {shiftEmployee.shift.endTime && (
                        <span className="text-sm text-muted-foreground">
                          Ended:{" "}
                          {new Date(
                            shiftEmployee.shift.endTime
                          ).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetailClient;
