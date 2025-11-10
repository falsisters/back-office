import { z } from "zod";

export const EmployeeAttendanceFilterSchema = z.object({
  startDate: z.string().optional(), // Format: YYYY-MM-DD
  endDate: z.string().optional(), // Format: YYYY-MM-DD
});

export const AttendanceEmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  branch: z.string().optional(),
  joinedAt: z.string(),
});

export const AttendanceShiftSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isOngoing: z.boolean(),
  cashierName: z.string(),
  employees: z.array(AttendanceEmployeeSchema),
  totalEmployees: z.number(),
});

export const AttendanceDateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  totalDays: z.number(),
});

export const AttendanceSummarySchema = z.object({
  totalShifts: z.number(),
  completedShifts: z.number(),
  ongoingShifts: z.number(),
  uniqueEmployeesCount: z.number(),
  daysWithShifts: z.number(),
});

export const EmployeeAttendanceResponseSchema = z.object({
  dateRange: AttendanceDateRangeSchema,
  summary: AttendanceSummarySchema,
  attendance: z.array(AttendanceShiftSchema),
  attendanceByDate: z.record(z.string(), z.array(AttendanceShiftSchema)),
});

export type EmployeeAttendanceFilter = z.infer<
  typeof EmployeeAttendanceFilterSchema
>;
export type AttendanceEmployee = z.infer<typeof AttendanceEmployeeSchema>;
export type AttendanceShift = z.infer<typeof AttendanceShiftSchema>;
export type AttendanceDateRange = z.infer<typeof AttendanceDateRangeSchema>;
export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>;
export type EmployeeAttendanceResponse = z.infer<
  typeof EmployeeAttendanceResponseSchema
>;
