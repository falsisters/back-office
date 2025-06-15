import { z } from "zod";

export const ShiftSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  cashierId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ShiftEmployeeSchema = z.object({
  id: z.string(),
  shiftId: z.string(),
  employeeId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  shift: ShiftSchema,
});

export const EmployeeWithShiftsSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  ShiftEmployee: z.array(ShiftEmployeeSchema),
});

export type ShiftResponse = z.infer<typeof ShiftSchema>;
export type ShiftEmployeeResponse = z.infer<typeof ShiftEmployeeSchema>;
export type EmployeeWithShiftsResponse = z.infer<
  typeof EmployeeWithShiftsSchema
>;
export type GetAllEmployeesResponse = EmployeeWithShiftsResponse[];
