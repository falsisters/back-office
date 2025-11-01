import { z } from "zod";

export const EmployeeFilterSchema = z.object({
  branch: z.string().optional(),
});

export type EmployeeFilter = z.infer<typeof EmployeeFilterSchema>;
